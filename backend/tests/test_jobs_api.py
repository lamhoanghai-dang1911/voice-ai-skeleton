import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_upload_invalid_file_extension():
    fake_file = io.BytesIO(b"fake text content")
    response = client.post(
        "/api/v1/jobs",
        files={"file": ("test.txt", fake_file, "text/plain")}
    )
    assert response.status_code == 400
    assert "Định dạng tệp không được hỗ trợ" in response.json()["detail"]


def test_upload_valid_audio_mock():
    # 100 bytes of dummy WAV content
    fake_wav = io.BytesIO(b"RIFF" + b"\x00" * 96)
    response = client.post(
        "/api/v1/jobs",
        files={"file": ("sample.wav", fake_wav, "audio/wav")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "jobId" in data
    assert data["status"] == "QUEUED"


def test_get_canonical_mock_job():
    canonical_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    response = client.get(f"/api/v1/jobs/{canonical_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["jobId"] == canonical_id
    assert data["status"] == "COMPLETED"


def test_get_canonical_mock_transcript():
    canonical_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    response = client.get(f"/api/v1/jobs/{canonical_id}/transcript")
    assert response.status_code == 200
    data = response.json()
    assert data["jobId"] == canonical_id
    assert len(data["segments"]) > 0


def test_get_canonical_mock_analysis():
    canonical_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    response = client.get(f"/api/v1/jobs/{canonical_id}/analysis")
    assert response.status_code == 200
    data = response.json()
    assert "checklistResults" in data
    assert "emotionSignals" in data
