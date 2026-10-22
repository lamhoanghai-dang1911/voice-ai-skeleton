import os
import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.config import settings
from app.core.logger import logger


class StorageService:
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or settings.STORAGE_LOCAL_DIR).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_upload_file(self, upload_file: UploadFile, job_id: str) -> Path:
        """Saves an incoming upload file safely under the job directory."""
        # Sanitize filename
        safe_filename = Path(upload_file.filename).name
        job_dir = self.base_dir / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        destination_path = job_dir / safe_filename

        # Prevent directory traversal
        if not str(destination_path.resolve()).startswith(str(self.base_dir)):
            raise HTTPException(status_code=400, detail="Invalid file path security violation")

        try:
            with open(destination_path, "wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
        except Exception as e:
            logger.error(f"Failed to save upload file: {e}")
            raise HTTPException(status_code=500, detail="Failed to store audio file locally")

        return destination_path

    def get_file_path(self, job_id: str, filename: str) -> Optional[Path]:
        target = (self.base_dir / job_id / filename).resolve()
        if not str(target).startswith(str(self.base_dir)) or not target.exists():
            return None
        return target


storage_service = StorageService()


def get_fixture_path(filename: str) -> Optional[Path]:
    """Dynamically resolves fixture path across local, test, or docker environments."""
    cwd_path = Path("contracts/fixtures") / filename
    if cwd_path.exists():
        return cwd_path.resolve()
    
    cur = Path(__file__).resolve()
    for parent in [cur] + list(cur.parents):
        candidate = parent / "contracts" / "fixtures" / filename
        if candidate.exists():
            return candidate.resolve()

    docker_path = Path("/app/contracts/fixtures") / filename
    if docker_path.exists():
        return docker_path.resolve()

    return None

