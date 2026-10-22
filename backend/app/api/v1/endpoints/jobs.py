import os
import uuid
import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from app.config import settings
from app.core.logger import logger
from app.services.storage import storage_service, get_fixture_path
from app.services.audio_validator import audio_validator
from app.models.contracts import (
    AudioJobV01,
    JobStatusEnum,
    AudioMetadata,
    CreateJobResponse,
)
from app.workers.tasks import process_audio_pipeline

router = APIRouter()


@router.post("/jobs", response_model=CreateJobResponse, summary="Upload audio and create processing job")
async def create_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    # 1. Validate audio file
    audio_validator.validate_file_metadata(file)

    # 2. Generate unique job ID & trace ID
    job_id = str(uuid.uuid4())
    trace_id = f"trace-{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    # 3. Save audio file locally
    saved_path = storage_service.save_upload_file(file, job_id)
    file_size = saved_path.stat().st_size

    # 4. Initialize job state
    job_data = AudioJobV01(
        jobId=job_id,
        status=JobStatusEnum.QUEUED,
        progress=0,
        audioMetadata=AudioMetadata(
            filename=file.filename or "unknown.wav",
            fileSize=file_size,
            format=file.content_type or "audio/wav",
            durationMs=None
        ),
        traceId=trace_id,
        errors=[],
        createdAt=now_iso,
        updatedAt=now_iso
    )

    job_file = storage_service.base_dir / job_id / "job.json"
    with open(job_file, "w", encoding="utf-8") as f:
        f.write(job_data.model_dump_json(indent=2))

    # 5. Dispatch to Celery worker (with background thread fallback if Redis is offline)
    dispatched = False
    if settings.ENVIRONMENT != "test" and not os.environ.get("DISABLE_CELERY"):
        try:
            process_audio_pipeline.apply_async(args=[job_id, str(saved_path)], retry=False)
            dispatched = True
            logger.info(f"Dispatched job {job_id} to Celery queue")
        except Exception as e:
            logger.warning(f"Could not connect to Celery/Redis ({e}). Falling back to local BackgroundTask.")

    if not dispatched:
        def fallback_worker():
            from app.workers.tasks import _update_job_status
            from app.workers.pipeline_adapter import get_pipeline_adapter
            adapter = get_pipeline_adapter()
            try:
                _update_job_status(job_id, JobStatusEnum.VALIDATING, 15)
                _update_job_status(job_id, JobStatusEnum.VAD_PROCESSING, 35)
                _update_job_status(job_id, JobStatusEnum.ASR_DIARIZATION, 65)
                transcript = adapter.run_asr(str(saved_path), job_id)
                with open(storage_service.base_dir / job_id / "transcript.json", "w", encoding="utf-8") as tf:
                    tf.write(transcript.model_dump_json(indent=2))
                _update_job_status(job_id, JobStatusEnum.NLP_ANALYSIS, 85)
                analysis = adapter.run_nlp_and_emotion(transcript, str(saved_path), job_id)
                with open(storage_service.base_dir / job_id / "analysis.json", "w", encoding="utf-8") as af:
                    af.write(analysis.model_dump_json(indent=2))
                _update_job_status(job_id, JobStatusEnum.COMPLETED, 100)
            except Exception as ex:
                logger.error(f"Fallback worker error: {ex}")
                _update_job_status(job_id, JobStatusEnum.FAILED, 0, [{"code": "ERROR", "message": str(ex), "timestamp": now_iso}])

        background_tasks.add_task(fallback_worker)

    return CreateJobResponse(
        jobId=job_id,
        status=JobStatusEnum.QUEUED,
        traceId=trace_id,
        message="Audio file uploaded and processing job queued successfully."
    )


@router.get("/jobs/{job_id}", response_model=AudioJobV01, summary="Get job status and metadata")
def get_job(job_id: str):
    job_file = storage_service.base_dir / job_id / "job.json"
    if not job_file.exists():
        # Check if requesting the canonical mock fixture ID
        if job_id == "f47ac10b-58cc-4372-a567-0e02b2c3d479":
            fixture_file = get_fixture_path("mock_audio_job.json")
            if fixture_file and fixture_file.exists():
                with open(fixture_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        raise HTTPException(status_code=404, detail=f"Không tìm thấy Job ID {job_id}")

    with open(job_file, "r", encoding="utf-8") as f:
        return json.load(f)
