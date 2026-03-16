from fastapi import APIRouter, Depends, HTTPException, status

from ..schemas import (
    GenerateRequest,
    GenerateResponse,
    GenerationOptionsResponse,
    ModelInfoResponse,
)
from ..security import require_api_key
from ..services.generation import generation_service

router = APIRouter(prefix="/v1", tags=["generation"], dependencies=[Depends(require_api_key)])


@router.post("/generate", response_model=GenerateResponse)
def generate(payload: GenerateRequest) -> GenerateResponse:
    try:
        result = generation_service.generate(payload)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return GenerateResponse(
        image_id=result.image_id,
        image_path=result.image_path,
        seed=result.seed,
        used_stub=result.used_stub,
    )


@router.get("/generate/options", response_model=GenerationOptionsResponse)
def generation_options() -> GenerationOptionsResponse:
    return generation_service.get_generation_options()


@router.get("/model/info", response_model=ModelInfoResponse)
def model_info() -> ModelInfoResponse:
    return generation_service.get_model_info()
