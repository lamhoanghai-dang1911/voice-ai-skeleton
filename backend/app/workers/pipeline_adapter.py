import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any
from app.config import settings
from app.core.logger import logger
from app.models.contracts import (
    AudioJobV01,
    TranscriptV01,
    AnalysisEmotionV01,
    EvidenceQAV01,
)


class BasePipelineAdapter(ABC):
    @abstractmethod
    def run_vad_and_diarization(self, audio_path: str, job_id: str) -> Dict[str, Any]:
        """Performs Voice Activity Detection and Speaker Diarization."""
        pass

    @abstractmethod
    def run_asr(self, audio_path: str, job_id: str) -> TranscriptV01:
        """Performs Vietnamese Automatic Speech Recognition."""
        pass

    @abstractmethod
    def run_nlp_and_emotion(self, transcript: TranscriptV01, audio_path: str, job_id: str) -> AnalysisEmotionV01:
        """Performs NLP summary, Prudential checklist matching, and emotion/interaction analysis."""
        pass


class MockPipelineAdapter(BasePipelineAdapter):
    """
    Mock adapter loading validated fixtures from contracts/fixtures.
    Guarantees 100% contract compliance for W1-W6 frontend and integration development.
    """

    def __init__(self):
        # Locate project root fixtures directory
        current_file = Path(__file__).resolve()
        # Traverse up to project root: backend/app/workers -> backend/app -> backend -> root
        self.root_dir = current_file.parents[3]
        self.fixtures_dir = self.root_dir / "contracts" / "fixtures"

    def _load_fixture(self, filename: str) -> Dict[str, Any]:
        path = self.fixtures_dir / filename
        if not path.exists():
            # Fallback path if running in Docker container with different workdir
            alt_path = Path("/app/contracts/fixtures") / filename
            if alt_path.exists():
                path = alt_path
            else:
                logger.warning(f"Fixture not found at {path}, returning empty dict")
                return {}
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def run_vad_and_diarization(self, audio_path: str, job_id: str) -> Dict[str, Any]:
        logger.info(f"[MockAdapter] Running simulated VAD + Diarization on {audio_path}")
        return {"speakers_detected": 2, "vad_segments": 7}

    def run_asr(self, audio_path: str, job_id: str) -> TranscriptV01:
        logger.info(f"[MockAdapter] Generating mock transcript for job {job_id}")
        data = self._load_fixture("mock_transcript.json")
        data["jobId"] = job_id
        return TranscriptV01(**data)

    def run_nlp_and_emotion(self, transcript: TranscriptV01, audio_path: str, job_id: str) -> AnalysisEmotionV01:
        logger.info(f"[MockAdapter] Generating mock analysis & emotion signals for job {job_id}")
        data = self._load_fixture("mock_analysis_emotion.json")
        data["jobId"] = job_id
        return AnalysisEmotionV01(**data)


class RealPipelineAdapter(BasePipelineAdapter):
    """
    Placeholder adapter for real OSS candidates:
    - Silero VAD
    - PhoWhisper-small
    - pyannote-community-1
    - librosa acoustic feature extraction
    To be activated as team advances through W5-W10 gates.
    """

    def __init__(self):
        logger.info(f"[RealAdapter] Initializing RealPipelineAdapter with device={settings.DEVICE}")

    def run_vad_and_diarization(self, audio_path: str, job_id: str) -> Dict[str, Any]:
        logger.info(f"[RealAdapter] Running Silero VAD & pyannote Diarization on {audio_path}...")
        # Implementation to be added by Speech AI Engineer (Lê Huy)
        raise NotImplementedError("RealPipelineAdapter will be connected in Milestone M3 (W5-W6).")

    def run_asr(self, audio_path: str, job_id: str) -> TranscriptV01:
        raise NotImplementedError("Real ASR will be connected in Milestone M3.")

    def run_nlp_and_emotion(self, transcript: TranscriptV01, audio_path: str, job_id: str) -> AnalysisEmotionV01:
        raise NotImplementedError("Real NLP & Emotion will be connected in Milestone M4.")


def get_pipeline_adapter() -> BasePipelineAdapter:
    if settings.PIPELINE_MODE.lower() == "real":
        return RealPipelineAdapter()
    return MockPipelineAdapter()
