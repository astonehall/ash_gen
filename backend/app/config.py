from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AshGen API"
    app_host: str = "127.0.0.1"
    app_port: int = 8000

    output_dir: Path = Path("outputs")
    model_id: str = "stabilityai/stable-diffusion-xl-base-1.0"
    device: str = "auto"
    enable_stub_generator: bool = True

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
settings.output_dir.mkdir(parents=True, exist_ok=True)
