import sys
from pathlib import Path
from gtts import gTTS

# Force UTF-8 encoding on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


def generate_audio():
    print("==========================================================")
    print("   TỔNG HỢP GIỌNG NÓI TIẾNG VIỆT (VIETNAMESE TTS)         ")
    print("==========================================================")

    # 1. Đoạn hội thoại kịch bản mẫu tư vấn bảo hiểm nhân thọ Prudential
    conversation_text = (
        "Dạ em chào anh Nam, em là Minh từ bộ phận tư vấn bảo hiểm Prudential. "
        "Cuộc gọi này được ghi âm nhằm mục đích nâng cao chất lượng dịch vụ ạ. "
        "Hôm nay em xin phép tư vấn chi tiết về giải pháp PRU-Đầu Tư Linh Hoạt. "
        "Gói này vừa có quyền lợi bảo vệ sinh mạng, vừa cho phép anh ủy thác đầu tư vào các quỹ liên kết đơn vị. "
        "Em xin lưu ý: Kết quả đầu tư thực tế không được cam kết lãi suất cố định, "
        "và anh hoàn toàn có quyền từ chối tham gia trong 21 ngày cân nhắc dùng thử ạ."
    )

    print("[*] Đang chuyển văn bản thành giọng đọc tiếng Việt tự nhiên...")
    
    # 2. Sinh giọng nói tiếng Việt chuẩn (lang='vi')
    tts = gTTS(text=conversation_text, lang="vi", slow=False)

    # 3. Lưu file vào thư mục data/audio/
    output_dir = Path("data/audio").resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "cuoc_goi_tu_van_prudential_pru_dau_tu_linh_hoat_01.mp3"

    tts.save(str(output_file))

    print("\n==========================================================")
    print("   TẠO FILE ÂM THANH TIẾNG VIỆT THÀNH CÔNG!               ")
    print("==========================================================")
    print(f"  - Đường dẫn: {output_file}")
    print(f"  - Ngôn ngữ: Tiếng Việt (vi)")
    print(f"  - Dung lượng: {output_file.stat().st_size:,} bytes")
    print("==========================================================")
    print("👉 Bây giờ bạn có thể lấy file này kéo thả vào http://localhost:3000 để phân tích!")


if __name__ == "__main__":
    generate_audio()
