# TÀI LIỆU KIẾN TRÚC KỸ THUẬT (IX.VOICE ARCHITECTURE)

## 1. Chuỗi giá trị xử lý E2E
```text
[Audio Input (WAV/MP3/M4A)]
          │
          ▼
┌────────────────────────┐
│  Upload & Validation   │ ──► Kiểm tra MIME, định dạng, thời lượng & kích thước (<100MB)
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│    VAD (Silero VAD)    │ ──► Tách đoạn tiếng nói (Speech segments), loại bỏ khoảng lặng
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│    ASR (PhoWhisper)    │ ──► Nhận dạng giọng nói tiếng Việt + sinh Timestamps
│ + pyannote Diarization │ ──► Gán nhãn người nói (Speaker 01: Tư vấn, Speaker 02: Khách)
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│  NLP & Policy Grounding│ ──► Tóm tắt cuộc gọi, trích xuất action items
│  & Acoustic Signals    │ ──► Đối chiếu Checklist Prudential (PRU-Đầu Tư Linh Hoạt)
│  (librosa extraction)  │ ──► Tốc độ nói, tỷ lệ im lặng, số lần ngắt lời (chỉ báo hỗ trợ)
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│  Evidence & QA Review  │ ──► Con người (Thẩm định viên QA) rà soát bằng chứng,
│  (Audit State Machine) │     phê duyệt PASS / PASS WITH ACTIONS / REJECT
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│  Dashboard & API v1    │ ──► Xuất kết quả báo cáo tuân thủ và tích hợp
└────────────────────────┘
```

## 2. Thiết kế Adapter Pattern cho AI Pipeline
Để đảm bảo Backend và Frontend không bị phụ thuộc vào sự thay đổi thư viện hay phiên bản model trong suốt 16 tuần R&D, hệ thống sử dụng kiến trúc `BasePipelineAdapter`:

- `MockPipelineAdapter`: Trả về dữ liệu kịch bản chuẩn hóa từ `contracts/fixtures/` trong mili-giây, phục vụ kiểm thử tích hợp BE/FE từ W1–W6.
- `RealPipelineAdapter`: Chứa mã nguồn gọi inference của Silero VAD, PhoWhisper và pyannote khi bước vào các Gate M3/M4.
- **Exit/Swap Trigger**: Khi cần thay thế một mô hình open-source (ví dụ Whisper sang PhoWhisper hoặc ONNX quantize), chỉ cần chỉnh sửa adapter tương ứng mà không làm thay đổi API Contract hoặc Schema của cơ sở dữ liệu.

## 3. Kiến trúc Local-first và Hàng đợi Celery
- **API Gateway (FastAPI)**: Tiếp nhận request upload file, lưu trữ file an toàn và gửi nhiệm vụ vào hàng đợi.
- **Broker (Redis)**: Điều phối các task xử lý âm thanh.
- **Worker (Celery)**: Thực thi tuần tự các bước trong pipeline, cập nhật % tiến trình (`progress: 0 -> 100`) và ghi nhận file trạng thái.
- **Fallback Worker**: Trong trường hợp chạy thử nghiệm local không bật Redis, backend tự động chuyển sang chế độ background task cục bộ giúp nhà phát triển có thể demo độc lập.
