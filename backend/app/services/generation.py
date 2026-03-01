from __future__ import annotations

import hashlib
import time
from dataclasses import dataclass
from pathlib import Path
from random import randint
from typing import Any

from ..config import settings
from ..schemas import GenerateRequest


@dataclass
class GenerationResult:
    image_id: str
    image_path: str
    seed: int
    used_stub: bool


class ImageGenerationService:
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

        generator = torch.Generator(device=torch_device).manual_seed(seed)
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
            from diffusers import StableDiffusionXLPipeline
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
