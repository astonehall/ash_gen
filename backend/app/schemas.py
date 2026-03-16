from typing import Literal

from pydantic import BaseModel, Field


SamplerName = Literal["euler", "euler_a", "dpmpp_2m"]
SigmaScheduleName = Literal["normal", "karras"]


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1000)
    negative_prompt: str | None = Field(default=None, max_length=1000)
    width: int = Field(default=1024, ge=256, le=2048)
    height: int = Field(default=1024, ge=256, le=2048)
    steps: int = Field(default=30, ge=1, le=150)
    guidance_scale: float = Field(default=6.5, ge=1.0, le=20.0)
    seed: int | None = Field(default=None, ge=0)
    sampler: SamplerName = Field(default="euler")
    sigma_schedule: SigmaScheduleName = Field(default="normal")


class GenerateResponse(BaseModel):
    image_id: str
    image_path: str
    seed: int
    used_stub: bool


class GenerationOptionsResponse(BaseModel):
    samplers: list[SamplerName]
    sigma_schedules: list[SigmaScheduleName]
    default_sampler: SamplerName
    default_sigma_schedule: SigmaScheduleName
    supported_combinations: dict[SamplerName, list[SigmaScheduleName]]


class ModelInfoResponse(BaseModel):
    used_stub: bool
    model_id: str
    checkpoints_dir: str
    model_checkpoint: str | None
    resolved_checkpoint_path: str | None
    checkpoint_exists: bool
    configured_device: str
    resolved_device: str
    pipeline_loaded: bool
