import time
import json
from datetime import datetime, timezone
from pathlib import Path
from app.core.celery_app import celery_app
from app.core.logger import logger
from app.config import settings
from app.services.storage import storage_service
from app.models.contracts import JobStatusEnum, AudioJobV01
from app.workers.pipeline_adapter import get_pipeline_adapter


def _update_job_status(job_id: str, status: JobStatusEnum, progress: int, errors: list = None):
    job_file = storage_service.base_dir / job_id / "job.json"
    now_iso = datetime.now(timezone.utc).isoformat()

    if job_file.exists():
        with open(job_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {
            "jobId": job_id,
            "traceId": f"trace-{job_id[:8]}",
            "audioMetadata": {"filename": "unknown", "fileSize": 0, "format": "audio/wav"},
            "createdAt": now_iso
        }

    data["status"] = status.value
    data["progress"] = progress
    data["updatedAt"] = now_iso
    data["errors"] = errors or data.get("errors", [])

    with open(job_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@celery_app.task(bind=True, name="process_audio_pipeline")
def process_audio_pipeline(self, job_id: str, audio_path: str):
    """
    Asynchronously executes the end-to-end pipeline:
    Validation -> VAD -> ASR + Diarization -> NLP & Emotion -> Evidence Store
    """
    logger.info(f"[Task] Starting audio processing pipeline for job {job_id}")
    adapter = get_pipeline_adapter()
    job_dir = storage_service.base_dir / job_id

    try:
        # Step 1: Validation
        _update_job_status(job_id, JobStatusEnum.VALIDATING, 15)
        time.sleep(1)  # Simulated execution time

        # Step 2: VAD & Diarization
        _update_job_status(job_id, JobStatusEnum.VAD_PROCESSING, 35)
        adapter.run_vad_and_diarization(audio_path, job_id)
        time.sleep(1)

        # Step 3: ASR & Speaker Attribution
        _update_job_status(job_id, JobStatusEnum.ASR_DIARIZATION, 65)
        transcript = adapter.run_asr(audio_path, job_id)
        transcript_file = job_dir / "transcript.json"
        with open(transcript_file, "w", encoding="utf-8") as f:
            f.write(transcript.model_dump_json(indent=2))
        time.sleep(1)

        # Step 4: NLP Summary, Policy Grounding & Emotion
        _update_job_status(job_id, JobStatusEnum.NLP_ANALYSIS, 85)
        analysis = adapter.run_nlp_and_emotion(transcript, audio_path, job_id)
        analysis_file = job_dir / "analysis.json"
        with open(analysis_file, "w", encoding="utf-8") as f:
            f.write(analysis.model_dump_json(indent=2))
        time.sleep(1)

        # Step 5: Completed
        _update_job_status(job_id, JobStatusEnum.COMPLETED, 100)
        logger.info(f"[Task] Completed audio processing pipeline for job {job_id}")

        return {"jobId": job_id, "status": "COMPLETED"}

    except Exception as e:
        logger.error(f"[Task] Pipeline failed for job {job_id}: {str(e)}")
        now_iso = datetime.now(timezone.utc).isoformat()
        err = [{"code": "PIPELINE_ERROR", "message": str(e), "timestamp": now_iso}]
        _update_job_status(job_id, JobStatusEnum.FAILED, 0, errors=err)
        raise e
