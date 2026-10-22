from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.v1.api_router import api_router
from app.core.logger import logger

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="INTEGRIX IX.VOICE - Speech & Conversation Intelligence Platform (MVP v0.1)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Set CORS middleware
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} in [{settings.ENVIRONMENT}] mode")
    logger.info(f"Pipeline Mode: {settings.PIPELINE_MODE} | Device: {settings.DEVICE}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.APP_NAME}")


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
        "status": "ready"
    }
