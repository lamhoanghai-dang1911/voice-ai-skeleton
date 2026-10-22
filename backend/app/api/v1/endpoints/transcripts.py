import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.services.storage import storage_service, get_fixture_path
from app.models.contracts import TranscriptV01

router = APIRouter()


@router.get("/jobs/{job_id}/transcript", response_model=TranscriptV01, summary="Get timestamped Vietnamese transcript")
def get_transcript(job_id: str):
    transcript_file = storage_service.base_dir / job_id / "transcript.json"

    if not transcript_file.exists():
        # Check canonical fixture fallback
        if job_id == "f47ac10b-58cc-4372-a567-0e02b2c3d479":
            fixture_file = get_fixture_path("mock_transcript.json")
            if fixture_file and fixture_file.exists():
                with open(fixture_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        raise HTTPException(
            status_code=404,
            detail=f"Transcript cho Job ID {job_id} chưa sẵn sàng hoặc không tồn tại."
        )

    with open(transcript_file, "r", encoding="utf-8") as f:
        return json.load(f)
