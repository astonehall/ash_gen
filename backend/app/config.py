from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "AshGen API"
    app_version: str = "0.0.4"
    app_host: str = "127.0.0.1"
    app_port: int = 8000
    cors_origins: list[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "tauri://localhost",
        "http://tauri.localhost",
        "https://tauri.localhost",
    ]

    output_dir: Path = Path("outputs")
    checkpoints_dir: Path = Path("models/checkpoints")
    model_checkpoint: Optional[str] = None
    model_id: str = "stabilityai/stable-diffusion-xl-base-1.0"
    device: str = "auto"
    enable_stub_generator: bool = True
    enable_api_key_auth: bool = False
    api_key: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


def _resolve_from_project_root(path_value: Path) -> Path:
    return path_value if path_value.is_absolute() else (PROJECT_ROOT / path_value)


settings.output_dir = _resolve_from_project_root(settings.output_dir)
settings.checkpoints_dir = _resolve_from_project_root(settings.checkpoints_dir)
settings.output_dir.mkdir(parents=True, exist_ok=True)
