from fastapi import APIRouter

from ..schemas import GenerateRequest, GenerateResponse
from ..services.generation import generation_service

router = APIRouter(prefix="/v1", tags=["generation"])


@router.post("/generate", response_model=GenerateResponse)
def generate(payload: GenerateRequest) -> GenerateResponse:
    result = generation_service.generate(payload)
    return GenerateResponse(
        image_id=result.image_id,
        image_path=result.image_path,
        seed=result.seed,
        used_stub=result.used_stub,
    )
