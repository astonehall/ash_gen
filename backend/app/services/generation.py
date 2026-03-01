from __future__ import annotations

import hashlib
import time
from dataclasses import dataclass
from pathlib import Path
from random import randint

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

        raise NotImplementedError(
            "Real SDXL generation is not wired yet. Set ENABLE_STUB_GENERATOR=true in .env for MVP flow."
        )

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
