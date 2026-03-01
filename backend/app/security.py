from fastapi import Header, HTTPException, status

from .config import settings


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if not settings.enable_api_key_auth:
        return

    if not settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API auth is enabled but API_KEY is not configured on the server.",
        )

    if x_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header.",
        )
