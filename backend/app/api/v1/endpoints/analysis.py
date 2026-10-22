import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.services.storage import storage_service, get_fixture_path
from app.models.contracts import AnalysisEmotionV01

router = APIRouter()


@router.get("/jobs/{job_id}/analysis", response_model=AnalysisEmotionV01, summary="Get conversation analysis, policy grounding and emotion signals")
def get_analysis(job_id: str):
    analysis_file = storage_service.base_dir / job_id / "analysis.json"

    if not analysis_file.exists():
        # Check canonical fixture fallback
        if job_id == "f47ac10b-58cc-4372-a567-0e02b2c3d479":
            fixture_file = get_fixture_path("mock_analysis_emotion.json")
            if fixture_file and fixture_file.exists():
                with open(fixture_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        raise HTTPException(
            status_code=404,
            detail=f"Kết quả phân tích cho Job ID {job_id} chưa sẵn sàng hoặc không tồn tại."
        )

    with open(analysis_file, "r", encoding="utf-8") as f:
        return json.load(f)
