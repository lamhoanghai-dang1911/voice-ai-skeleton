# NGUYÊN TẮC BẢO MẬT & QUẢN TRỊ DỮ LIỆU (SECURITY GUIDELINES)

## 1. Quản lý Biến môi trường (Environment & Secrets Hygiene)
- **Cam kết Zero-Secret**: Tệp `.env.example` trong repository tuyệt đối không chứa mật khẩu, private key hoặc token thật. Mọi giá trị đều là placeholder an toàn.
- **Quy tắc Git Ignore**: Tệp `.env`, `.env.local`, các tệp khóa `*.pem`, `*.key`, `*.cert` bị loại bỏ hoàn toàn trong `.gitignore` và được kiểm tra tự động bởi pipeline CI (`.github/workflows/ci.yml`).
- **Secret Key**: Khi đưa lên môi trường staging hoặc production, bắt buộc sinh chuỗi ngẫu nhiên mạnh bằng:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

---

## 2. Bảo vệ dữ liệu ghi âm và Quyền riêng tư (Audio & Voice Privacy)
- **Local-first Isolation**: Mọi file ghi âm tải lên được lưu trong thư mục `data/storage/` trên máy cục bộ và được bảo vệ bằng volume riêng biệt, không tự động đồng bộ lên bất kỳ dịch vụ đám mây công cộng nào.
- **Chống Directory Traversal**: `StorageService` tự động sanitize tên tệp và xác thực đường dẫn tuyệt đối phải nằm trong thư mục gốc được cấp phép, ngăn chặn các tấn công path traversal (`../`).
- **Kiểm soát định dạng và kích thước**: Tệp âm thanh bị giới hạn kích thước tối đa 100MB và kiểm tra header thực tế để phòng ngừa mã độc ẩn trong file đa phương tiện.

---

## 3. Nguyên tắc đạo đức AI (Ethical Voice AI & Fair Interaction Signals)
- **Không phán quyết con người**: Các tín hiệu tương tác âm học (tốc độ nói, ngắt lời, sắc thái) chỉ là tham chiếu hỗ trợ chuyên viên QA và quản lý đào tạo, không được sử dụng làm căn cứ pháp lý, kỷ luật hoặc đánh giá phẩm chất đạo đức cá nhân.
- **Human-in-the-loop**: Mọi quyết định nghiệm thu kết quả cuộc gọi đều phải có sự xác nhận và phê duyệt của Thẩm định viên (Human QA Reviewer).
