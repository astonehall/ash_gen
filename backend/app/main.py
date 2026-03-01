from fastapi import FastAPI

from .config import settings
from .routers.generate import router as generate_router
from .routers.health import router as health_router

app = FastAPI(title=settings.app_name)
app.include_router(health_router)
app.include_router(generate_router)
