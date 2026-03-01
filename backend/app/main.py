from fastapi import FastAPI

from .config import settings
from .routers.generate import router as generate_router
from .routers.health import router as health_router
from .services.generation import generation_service

app = FastAPI(title=settings.app_name, version=settings.app_version)
app.include_router(health_router)
app.include_router(generate_router)


@app.on_event("startup")
def validate_runtime_configuration() -> None:
    generation_service.validate_startup_configuration()
