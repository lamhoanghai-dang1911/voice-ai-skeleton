# SỔ TAY VẬN HÀNH CỤC BỘ (LOCAL RUNBOOK)

## 1. Yêu cầu môi trường tối thiểu
- **Hệ điều hành**: Windows 10/11 (PowerShell 7+ hoặc WSL2), macOS hoặc Ubuntu Linux.
- **Docker & Docker Compose**: Docker Desktop phiên bản 24+ hoặc Docker Engine tương đương.
- **Python**: Phiên bản 3.10+ (nếu chạy native ngoài container).
- **Node.js**: Phiên bản 20+ (nếu chạy frontend ngoài container).

---

## 2. Vận hành với Docker Compose

### 2.1 Khởi động chế độ CPU tiêu chuẩn
```bash
# 1. Sao chép mẫu cấu hình
cp .env.example .env

# 2. Khởi chạy toàn bộ hệ sinh thái (Redis, Backend, Worker, Frontend)
docker compose up -d --build

# 3. Theo dõi logs xử lý
docker compose logs -f
```

### 2.2 Khởi động chế độ GPU NVIDIA CUDA
Yêu cầu: Máy trạm có GPU NVIDIA và đã cài đặt NVIDIA Container Toolkit.
```bash
docker compose --profile gpu up -d --build
```

### 2.3 Kiểm tra trạng thái dịch vụ
```bash
docker compose ps
```
Cả 4 container phải ở trạng thái `running` hoặc `healthy`:
- `ix-voice-redis` (port 6379)
- `ix-voice-backend` (port 8000)
- `ix-voice-worker`
- `ix-voice-frontend` (port 3000)

### 2.4 Dừng hệ thống và giải phóng tài nguyên
```bash
docker compose down
```
(Nếu muốn xóa cả volume dữ liệu audio/redis tạm: `docker compose down -v`)

---

## 3. Khắc phục sự cố thường gặp (Troubleshooting)

### Port 8000 hoặc 3000 bị xung đột:
- Mở `.env` hoặc `docker-compose.yml` để đổi cổng map (ví dụ: `8001:8000` hoặc `3001:80`).

### Không thể kết nối Redis khi chạy local native:
- Đảm bảo biến `CELERY_BROKER_URL` trỏ tới `redis://localhost:6379/0` thay vì `redis://redis:6379/0`.
- Nếu không chạy Redis, hệ thống sẽ tự động chuyển sang chế độ background task cục bộ.
