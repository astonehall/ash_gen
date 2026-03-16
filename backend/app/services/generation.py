from __future__ import annotations

import hashlib
import time
import warnings
from dataclasses import dataclass
from pathlib import Path
from random import randint
from typing import Any

from ..config import settings
from ..schemas import GenerateRequest, GenerationOptionsResponse, ModelInfoResponse


@dataclass
class GenerationResult:
    image_id: str
    image_path: str
    seed: int
    used_stub: bool


class ImageGenerationService:
    SAMPLERS = ["euler", "euler_a", "dpmpp_2m"]
    SIGMA_SCHEDULES = ["normal", "karras"]

    def __init__(self, output_dir: Path) -> None:
        self.output_dir = output_dir
        self._pipeline: Any | None = None
        self._pipeline_checkpoint: Path | None = None

    def generate(self, payload: GenerateRequest) -> GenerationResult:
        seed = payload.seed if payload.seed is not None else randint(1, 2_147_483_647)
        image_id = self._build_image_id(payload.prompt, seed)

        if settings.enable_stub_generator:
            image_path = self._write_stub_image(image_id, payload.prompt, seed)
            return GenerationResult(
                image_id=image_id,
                image_path=str(image_path),
                seed=seed,
                used_stub=True,
            )

        checkpoint_path = self._resolve_checkpoint_path()
        pipeline, torch, torch_device = self._get_or_load_pipeline(checkpoint_path)
        self._apply_sampler_scheduler(pipeline, payload)

        generator = torch.Generator(device=torch_device).manual_seed(seed)
        with warnings.catch_warnings():
            warnings.filterwarnings(
                "ignore",
                message=r"`upcast_vae` is deprecated.*",
                category=FutureWarning,
            )
            result = pipeline(
                prompt=payload.prompt,
                negative_prompt=payload.negative_prompt,
                width=payload.width,
                height=payload.height,
                num_inference_steps=payload.steps,
                guidance_scale=payload.guidance_scale,
                generator=generator,
            )

        target = self.output_dir / f"{image_id}.png"
        result.images[0].save(target)

        return GenerationResult(
            image_id=image_id,
            image_path=str(target),
            seed=seed,
            used_stub=False,
        )

    def validate_startup_configuration(self) -> None:
        if settings.enable_stub_generator:
            return

        self._resolve_checkpoint_path()

    def get_model_info(self) -> ModelInfoResponse:
        resolved_checkpoint_path: Path | None = None
        checkpoint_exists = False

        if settings.model_checkpoint:
            candidate = Path(settings.model_checkpoint)
            if not candidate.is_absolute():
                candidate = settings.checkpoints_dir / candidate
            resolved_checkpoint_path = candidate
            checkpoint_exists = candidate.exists() and candidate.is_file()

        resolved_device = settings.device.lower().strip()
        if resolved_device == "auto":
            resolved_device = self._detect_device_without_error()

        return ModelInfoResponse(
            used_stub=settings.enable_stub_generator,
            model_id=settings.model_id,
            checkpoints_dir=str(settings.checkpoints_dir),
            model_checkpoint=settings.model_checkpoint,
            resolved_checkpoint_path=str(resolved_checkpoint_path) if resolved_checkpoint_path else None,
            checkpoint_exists=checkpoint_exists,
            configured_device=settings.device,
            resolved_device=resolved_device,
            pipeline_loaded=self._pipeline is not None,
        )

    def get_generation_options(self) -> GenerationOptionsResponse:
        supported_combinations = {
            sampler: list(self.SIGMA_SCHEDULES) for sampler in self.SAMPLERS
        }

        return GenerationOptionsResponse(
            samplers=list(self.SAMPLERS),
            sigma_schedules=list(self.SIGMA_SCHEDULES),
            default_sampler="euler",
            default_sigma_schedule="normal",
            supported_combinations=supported_combinations,
        )

    @staticmethod
    def _resolve_checkpoint_path() -> Path:
        if not settings.model_checkpoint:
            raise ValueError(
                "MODEL_CHECKPOINT is required when ENABLE_STUB_GENERATOR=false. "
                "Set it in backend/.env (for example: MODEL_CHECKPOINT=my_model.safetensors)."
            )

        checkpoint_path = Path(settings.model_checkpoint)
        if not checkpoint_path.is_absolute():
            checkpoint_path = settings.checkpoints_dir / checkpoint_path

        if not checkpoint_path.exists() or not checkpoint_path.is_file():
            raise FileNotFoundError(
                f"Model checkpoint not found: {checkpoint_path}. "
                "Use MODEL_CHECKPOINT with an existing file, relative to CHECKPOINTS_DIR or as an absolute path."
            )

        return checkpoint_path

    def _get_or_load_pipeline(self, checkpoint_path: Path) -> tuple[Any, Any, str]:
        try:
            import torch
            from diffusers.pipelines.stable_diffusion_xl.pipeline_stable_diffusion_xl import (
                StableDiffusionXLPipeline,
            )
        except Exception as exc:  # pragma: no cover - import guard
            raise RuntimeError(
                "Missing SDXL runtime dependencies. Install with: "
                "pip install torch diffusers transformers accelerate safetensors"
            ) from exc

        torch_device = self._resolve_torch_device(torch)
        torch_dtype = torch.float16 if torch_device in {"cuda", "mps"} else torch.float32

        if self._pipeline is None or self._pipeline_checkpoint != checkpoint_path:
            pipeline = StableDiffusionXLPipeline.from_single_file(
                str(checkpoint_path),
                torch_dtype=torch_dtype,
                use_safetensors=True,
                local_files_only=True,
            )
            pipeline = pipeline.to(torch_device)

            self._pipeline = pipeline
            self._pipeline_checkpoint = checkpoint_path

        return self._pipeline, torch, torch_device

    @staticmethod
    def _apply_sampler_scheduler(pipeline: Any, payload: GenerateRequest) -> None:
        try:
            from diffusers import (
                DPMSolverMultistepScheduler,
                EulerAncestralDiscreteScheduler,
                EulerDiscreteScheduler,
            )
        except Exception as exc:  # pragma: no cover - import guard
            raise RuntimeError(
                "Missing scheduler runtime dependencies. Install with: "
                "pip install diffusers"
            ) from exc

        base_config = dict(pipeline.scheduler.config)
        use_karras = payload.sigma_schedule == "karras"

        if payload.sampler == "euler":
            pipeline.scheduler = EulerDiscreteScheduler.from_config(
                base_config,
                use_karras_sigmas=use_karras,
            )
            return

        if payload.sampler == "euler_a":
            pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
                base_config,
                use_karras_sigmas=use_karras,
            )
            return

        if payload.sampler == "dpmpp_2m":
            pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                base_config,
                algorithm_type="dpmsolver++",
                use_karras_sigmas=use_karras,
            )
            return

        raise ValueError(f"Unsupported sampler: {payload.sampler}")

    @staticmethod
    def _resolve_torch_device(torch: Any) -> str:
        configured = settings.device.lower().strip()

        if configured != "auto":
            return configured

        if torch.cuda.is_available():
            return "cuda"

        mps_backend = getattr(torch.backends, "mps", None)
        if mps_backend and mps_backend.is_available():
            return "mps"

        return "cpu"

    def _detect_device_without_error(self) -> str:
        try:
            import torch
        except Exception:
            return "cpu"

        return self._resolve_torch_device(torch)

    def _write_stub_image(self, image_id: str, prompt: str, seed: int) -> Path:
        target = self.output_dir / f"{image_id}.txt"
        target.write_text(
            "\n".join(
                [
                    "AshGen stub output",
                    f"prompt: {prompt}",
                    f"seed: {seed}",
                    f"timestamp: {int(time.time())}",
                ]
            ),
            encoding="utf-8",
        )
        return target

    @staticmethod
    def _build_image_id(prompt: str, seed: int) -> str:
        digest = hashlib.sha256(f"{prompt}:{seed}:{time.time_ns()}".encode("utf-8")).hexdigest()
        return digest[:16]


generation_service = ImageGenerationService(output_dir=settings.output_dir)
