import sys
import asyncio
from pathlib import Path
import edge_tts
import soundfile as sf
import sounddevice as sd

# Force UTF-8 encoding on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


async def main():
    text = (
        "Dạ em chào anh Nam, em là Minh từ bộ phận tư vấn bảo hiểm Prudential. "
        "Cuộc gọi này được ghi âm nhằm mục đích nâng cao chất lượng dịch vụ ạ. "
        "Hôm nay em xin phép tư vấn chi tiết về giải pháp PRU-Đầu Tư Linh Hoạt. "
        "Kết quả đầu tư thực tế không được cam kết lãi suất cố định và anh có 21 ngày cân nhắc dùng thử ạ."
    )

    # Giọng nữ: vi-VN-HoaiMyNeural | Giọng nam: vi-VN-NamMinhNeural
    voice = "vi-VN-HoaiMyNeural"

    print("==========================================================")
    print("   TỔNG HỢP GIỌNG NÓI TIẾNG VIỆT (AI NEURAL TTS)          ")
    print("==========================================================")
    print(f"[*] Đang dùng giọng: {voice}")
    print("[*] Đang xử lý chuyển văn bản thành giọng nói...")

    communicate = edge_tts.Communicate(text, voice)

    output_dir = Path("data/audio").resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "cuoc_goi_tu_van_prudential_pru_dau_tu_linh_hoat_01.wav"

    # Lưu file âm thanh trực tiếp
    await communicate.save(str(output_file))

    print(f"\n[✓] ĐÃ LƯU FILE THÀNH CÔNG TẠI:")
    print(f"    👉 {output_file}")

    # Đọc và phát thử ra loa
    try:
        data, fs = sf.read(str(output_file))
        print("\n[*] Đang phát câu thoại qua loa máy tính...")
        sd.play(data, fs)
        sd.wait()
        print("[✓] Đã phát xong!")
    except Exception as e:
        print(f"[!] Không thể phát ra loa (bỏ qua): {e}")

    print("==========================================================")
    print("👉 Bây giờ bạn có thể lấy file này kéo thả vào http://localhost:3000")


if __name__ == "__main__":
    asyncio.run(main())
