from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    jobs,
    transcripts,
    analysis,
    qa_review
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(jobs.router, tags=["Audio Jobs"])
api_router.include_router(transcripts.router, tags=["Transcripts"])
api_router.include_router(analysis.router, tags=["Analysis & Emotion"])
api_router.include_router(qa_review.router, tags=["Evidence & QA Review"])
