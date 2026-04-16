from fastapi import APIRouter

from app.core.config import settings
from app.db.mongodb import database
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        mongodb_connected=database is not None,
        api_prefix=settings.api_v1_prefix,
    )
