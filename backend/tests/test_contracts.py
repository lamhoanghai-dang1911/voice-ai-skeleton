import json
from pathlib import Path
from app.models.contracts import (
    AudioJobV01,
    TranscriptV01,
    AnalysisEmotionV01,
    EvidenceQAV01,
)

FIXTURES_DIR = Path(__file__).resolve().parents[2] / "contracts" / "fixtures"


def test_audio_job_contract_fixture():
    fixture_path = FIXTURES_DIR / "mock_audio_job.json"
    assert fixture_path.exists(), f"Missing fixture at {fixture_path}"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    job = AudioJobV01(**data)
    assert job.status.value == "COMPLETED"
    assert job.audioMetadata.filename.endswith(".wav")


def test_transcript_contract_fixture():
    fixture_path = FIXTURES_DIR / "mock_transcript.json"
    assert fixture_path.exists(), f"Missing fixture at {fixture_path}"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    transcript = TranscriptV01(**data)
    assert transcript.language == "vi"
    assert len(transcript.segments) > 0
    assert transcript.segments[0].speakerLabel == "Tư vấn viên"


def test_analysis_emotion_contract_fixture():
    fixture_path = FIXTURES_DIR / "mock_analysis_emotion.json"
    assert fixture_path.exists(), f"Missing fixture at {fixture_path}"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    analysis = AnalysisEmotionV01(**data)
    assert len(analysis.checklistResults) >= 3
    assert analysis.emotionSignals.disclaimer is not None
    assert "chỉ báo hỗ trợ" in analysis.emotionSignals.disclaimer


def test_evidence_qa_contract_fixture():
    fixture_path = FIXTURES_DIR / "mock_evidence_qa.json"
    assert fixture_path.exists(), f"Missing fixture at {fixture_path}"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    review = EvidenceQAV01(**data)
    assert review.auditState.value == "APPROVED"
    assert review.decision.value == "PASS"
