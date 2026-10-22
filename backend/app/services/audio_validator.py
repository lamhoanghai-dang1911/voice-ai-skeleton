from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings


class AudioValidator:
    def __init__(self):
        self.allowed_extensions = [
            ext.strip().lower()
            for ext in settings.ALLOWED_AUDIO_EXTENSIONS.split(",")
            if ext.strip()
        ]
        self.max_size_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024

    def validate_file_metadata(self, upload_file: UploadFile) -> None:
        filename = upload_file.filename or ""
        ext = Path(filename).suffix.lower()

        if not ext or ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Định dạng tệp không được hỗ trợ ({ext}). Các định dạng cho phép: {', '.join(self.allowed_extensions)}"
            )

        # Check file size by seeking
        upload_file.file.seek(0, 2)
        file_size = upload_file.file.tell()
        upload_file.file.seek(0)

        if file_size <= 0:
            raise HTTPException(status_code=400, detail="Tệp âm thanh rỗng (0 bytes)")

        if file_size > self.max_size_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"Kích thước tệp ({file_size / (1024*1024):.2f} MB) vượt quá giới hạn tối đa cho phép ({settings.MAX_AUDIO_SIZE_MB} MB)"
            )


audio_validator = AudioValidator()
