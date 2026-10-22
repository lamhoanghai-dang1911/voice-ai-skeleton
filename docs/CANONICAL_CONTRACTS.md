# ĐẶC TẢ HỢP ĐỒNG DỮ LIỆU CHUẨN (CANONICAL CONTRACTS SPECIFICATION v0.1)

## 1. Nguyên tắc quản trị hợp đồng (Contract-first Governance)
- Mọi giao tiếp giữa các tầng Speech AI → Backend → Frontend → QA đều phải tuân thủ 4 hợp đồng JSON Schema định nghĩa trong thư mục `contracts/schemas/`.
- Khi có bất kỳ thay đổi mang tính phá vỡ cấu trúc (breaking change):
  1. Technical Leader (Thiên Long) phải tạo Architecture Decision Record (ADR).
  2. Nâng phiên bản hợp đồng (ví dụ: `v0.1` → `v0.2`).
  3. Cập nhật fixtures mẫu và thông báo đến Speech AI (Lê Huy), Data (Trọng Nhân), QA (Bách Sỹ) và Frontend (Tùng Chi).

---

## 2. Chi tiết 4 Hợp đồng cốt lõi

### 2.1 Audio Job Contract (`audio_job_v0_1.json`)
- **Mục đích**: Theo dõi vòng đời và tiến độ xử lý file ghi âm.
- **Trạng thái**:
  - `QUEUED`: Đã tiếp nhận vào hàng đợi.
  - `VALIDATING`: Đang xác thực tệp âm thanh (MIME, bitrate, duration).
  - `VAD_PROCESSING`: Đang phát hiện tiếng nói và cắt khoảng lặng.
  - `ASR_DIARIZATION`: Đang nhận dạng tiếng Việt và gán người nói.
  - `NLP_ANALYSIS`: Đang tóm tắt và đối chiếu chính sách Prudential.
  - `COMPLETED`: Xử lý hoàn tất, sẵn sàng cho QA Review.
  - `FAILED`: Lỗi trong quá trình xử lý (kèm mảng `errors`).

### 2.2 Transcript Contract (`transcript_v0_1.json`)
- **Mục đích**: Lưu trữ nội dung hội thoại bóc băng có gắn nhãn thời gian và định danh người nói.
- **Cấu trúc đoạn (Segment)**:
  - `id`: Mã định danh đoạn (ví dụ: `seg-001`).
  - `startMs` / `endMs`: Thời gian bắt đầu và kết thúc tính theo mili-giây.
  - `speakerId`: Nhãn speaker từ thuật toán diarization (ví dụ: `SPEAKER_01`).
  - `speakerLabel`: Vai trò được suy luận (ví dụ: `Tư vấn viên` hoặc `Khách hàng`).
  - `text`: Văn bản tiếng Việt nhận dạng được.
  - `confidence`: Điểm số tin cậy (0.0 đến 1.0).

### 2.3 Analysis & Emotion Contract (`analysis_emotion_v0_1.json`)
- **Mục đích**: Tóm tắt, đối chiếu checklist nghiệp vụ và cung cấp chỉ báo âm học.
- **Quy tắc bắt buộc về Emotion**:
  - Phải có trường `disclaimer`: *"Lưu ý: Tín hiệu Emotion & Interaction chỉ là chỉ báo hỗ trợ cho công tác QA và coaching; không phải kết luận chắc chắn về cảm xúc, ý định hay phẩm chất cá nhân."*
  - Đi kèm `uncertaintyScore` (mức độ bất định) và `acousticFeatures` (tốc độ nói, khoảng lặng, ngắt lời).

### 2.4 Evidence & QA Review Contract (`evidence_qa_v0_1.json`)
- **Mục đích**: Lưu trữ kết quả thẩm định của chuyên viên QA, bằng chứng đối chiếu tài liệu và quyết định phê duyệt.
- **Quyết định (Decision)**:
  - `PASS`: Đạt chuẩn tuân thủ.
  - `PASS_WITH_ACTIONS`: Đạt nhưng có điểm cần lưu ý/nhắc nhở nội bộ.
  - `FAIL`: Không đạt chuẩn, vi phạm quy tắc bắt buộc.
