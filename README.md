# INTEGRIX IX.VOICE (MVP v0.1)

> **Nền tảng phân tích giọng nói và hội thoại tiếng Việt (Local-first & Demo nội bộ)**  
> Chuỗi giá trị: **Âm thanh → Validation/VAD → ASR + Diarization → NLP / Rules / Emotion → Evidence & QA → Dashboard / Export / API**  
> Baseline: 16 tuần R&D (W1–W16) • Phiên bản Charter v1.1 • Change-controlled

---

## 1. Giới thiệu dự án

IX.VOICE là nền tảng phân tích hội thoại tiếng Việt tập trung vào các trường hợp nghiệp vụ doanh nghiệp (tổng đài, tư vấn tài chính, bảo hiểm nhân thọ). Phiên bản MVP v0.1 được thiết kế theo nguyên tắc:
- **Local-first**: Toàn bộ chuỗi xử lý và lưu trữ có thể triển khai, tái hiện và kiểm chứng trên máy tính cục bộ hoặc workstation.
- **Fixture & Contract-first**: Các hợp đồng dữ liệu chuẩn (`contracts/`) và bộ dữ liệu mẫu (`fixtures/`) được chuẩn hóa trước, cho phép nhóm Frontend, Backend, AI và QA phát triển song song không phụ thuộc vào tiến độ training model.
- **Dual-Profile Hardware**: Mặc định chạy CPU (thông qua mock/quantized model) và hỗ trợ kích hoạt GPU NVIDIA CUDA qua Docker profile khi cần inference tốc độ cao.
- **Emotion & Interaction As Supportive Signals**: Tín hiệu âm học (librosa) và tương tác chỉ đóng vai trò hỗ trợ coaching/review, có công bố mức độ tin cậy và không bao giờ đưa ra kết luận khẳng định phẩm chất cá nhân.

---

## 2. Cấu trúc thư mục Monorepo

```text
ai-voice-skeleton-source/
├── .github/workflows/ci.yml       # GitHub Actions CI (Secrets, Tests, Docker smoke test)
├── contracts/                     # Shared Engineering Baseline: Schemas & Fixtures
│   ├── schemas/                   # JSON Schemas cho 4 Canonical Contracts
│   │   ├── audio_job_v0_1.json
│   │   ├── transcript_v0_1.json
│   │   ├── analysis_emotion_v0_1.json
│   │   └── evidence_qa_v0_1.json
│   └── fixtures/                  # Mock fixtures (Use case Prudential Life Insurance)
│       ├── mock_audio_job.json
│       ├── mock_transcript.json
│       ├── mock_analysis_emotion.json
│       └── mock_evidence_qa.json
├── backend/                       # Python FastAPI Backend & Celery Worker
│   ├── app/
│   │   ├── api/v1/                # REST API Endpoints (Health, Jobs, Transcript, QA)
│   │   ├── core/                  # Celery config, logger, security
│   │   ├── models/                # Pydantic schemas ánh xạ Canonical Contracts
│   │   ├── services/              # Local storage & Audio validator
│   │   └── workers/               # Background task queue & Model adapters
│   ├── tests/                     # Pytest suite (Health, Contract compliance, APIs)
│   ├── Dockerfile                 # Backend & Worker containerfile
│   └── requirements.txt
├── frontend/                      # React 18 + Vite + TypeScript Dashboard
│   ├── src/
│   │   ├── api/                   # API client với cơ chế tự động fallback fixtures
│   │   ├── components/            # AudioUploader, TranscriptViewer, Analysis, QA
│   │   ├── types/                 # TypeScript interfaces từ Canonical Contracts
│   │   ├── App.tsx                # Dashboard layout & Tabs
│   │   └── index.css              # Rich aesthetic CSS design system
│   ├── Dockerfile                 # Multi-stage build (Node builder -> Nginx Alpine)
│   └── nginx.conf                 # SPA routing & reverse proxy
├── data/                          # Thư mục lưu trữ local (được gitignore an toàn)
│   ├── audio/                     # File ghi âm gốc
│   ├── storage/                   # Artifacts & Job JSON outputs
│   └── models/                    # Model weights (PhoWhisper, pyannote)
├── docs/                          # Tài liệu kiến trúc, runbook & security
├── docker-compose.yml             # Local runtime orchestration (CPU & GPU)
├── docker-compose.override.yml.example
├── .env.example                   # Biến môi trường mẫu an toàn (Zero-secret)
├── .dockerignore
└── .gitignore
```

---

## 3. Khởi chạy nhanh (Quickstart)

### Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng)

1. **Chuẩn bị cấu hình an toàn**:
   ```bash
   cp .env.example .env
   ```

2. **Chạy ở chế độ CPU (Mặc định cho mọi máy tính)**:
   ```bash
   docker compose up --build
   ```

3. **Chạy với tăng tốc GPU NVIDIA CUDA (Tùy chọn)**:
   ```bash
   docker compose --profile gpu up --build
   ```

4. **Truy cập ứng dụng**:
   - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Backend Swagger API Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
   - **API Healthcheck**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Cách 2: Khởi chạy trực tiếp cho nhà phát triển (Local Native Dev)

#### Chạy Backend:
```bash
cd backend
python -m venv .venv
# Trên Windows: .venv\Scripts\activate
# Trên Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Chạy Frontend:
```bash
cd frontend
npm install
npm run dev
```
Giao diện dev sẽ mở tại [http://localhost:3000](http://localhost:3000).

---

## 4. Chạy kiểm thử tự động (Testing)

```bash
# Chạy toàn bộ unit test và kiểm tra tính tuân thủ Canonical Contract:
cd backend
pytest tests -v
```

---

## 5. Danh mục 4 Canonical Contracts (Hợp đồng dữ liệu v0.1)

| Hợp đồng | Tệp Schema | Fixture tham chiếu | Bên phụ trách |
|---|---|---|---|
| **Audio Job v0.1** | [audio_job_v0_1.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/schemas/audio_job_v0_1.json) | [mock_audio_job.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/fixtures/mock_audio_job.json) | Thiên Long (BE) & Hải Đăng (DevOps) |
| **Transcript v0.1** | [transcript_v0_1.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/schemas/transcript_v0_1.json) | [mock_transcript.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/fixtures/mock_transcript.json) | Lê Huy (Speech AI) & Trọng Nhân (Data) |
| **Analysis / Emotion v0.1** | [analysis_emotion_v0_1.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/schemas/analysis_emotion_v0_1.json) | [mock_analysis_emotion.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/fixtures/mock_analysis_emotion.json) | Lê Huy (AI) & Bách Sỹ (BA/QA) |
| **Evidence / QA Review v0.1** | [evidence_qa_v0_1.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/schemas/evidence_qa_v0_1.json) | [mock_evidence_qa.json](file:///c:/integrix/ai-voice-skeleton-source/contracts/fixtures/mock_evidence_qa.json) | Bách Sỹ (QA) & Thiên Long (BE) |

---

## 6. Phân công vai trò (Project Team Baseline)
- **Đức**: PM / Team Leader — Điều phối tổng thể, scope và milestone gates.
- **Thiên Long**: Technical Leader / Backend — Chốt kiến trúc, canonical contracts, versioning và backend services.
- **Lê Huy**: Deputy PM / Speech AI — Pipeline VAD (Silero), ASR (PhoWhisper), Diarization (pyannote) và đặc trưng âm học (librosa).
- **Bách Sỹ**: BA / QA Coordinator — Kịch bản bảo hiểm, checklist đối chiếu tài liệu Prudential, QA evidence review.
- **Trọng Nhân**: Data Engineer — Thu thập dữ liệu tiếng Việt công khai hợp lệ, chuẩn hóa fixtures và ground truth.
- **Tùng Chi**: Frontend Developer — Giao diện Dashboard, trình xem transcript, đối soát evidence và QA review.
- **Hải Đăng**: Integration / DevOps — Docker/Compose, CI/CD GitHub Actions, môi trường local runtime và logging.
