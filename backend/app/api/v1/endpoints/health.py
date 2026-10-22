from fastapi import APIRouter
from app.config import settings
from app.core.logger import logger

router = APIRouter()


@router.get("/health", summary="Healthcheck endpoint")
def healthcheck():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "pipelineMode": settings.PIPELINE_MODE,
        "device": settings.DEVICE,
    }
