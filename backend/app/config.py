import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App General
    ENVIRONMENT: str = "development"
    APP_NAME: str = "INTEGRIX IX.VOICE"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "dev-insecure-secret-key-change-in-production-integrix-ix-voice-2026"

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Redis / Celery
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Audio Limits & Storage
    STORAGE_LOCAL_DIR: str = "./data/storage"
    MAX_AUDIO_SIZE_MB: int = 100
    MAX_AUDIO_DURATION_MINUTES: int = 60
    ALLOWED_AUDIO_EXTENSIONS: str = ".wav,.mp3,.m4a,.aac,.flac,.ogg"

    # Pipeline Mode & AI
    PIPELINE_MODE: str = "mock"  # "mock" or "real"
    DEVICE: str = "cpu"  # "cpu" or "cuda"
    VAD_MODEL: str = "silero_vad"
    ASR_MODEL: str = "PhoWhisper-small"
    DIARIZATION_MODEL: str = "pyannote-community-1"
    EMOTION_BACKEND: str = "librosa_acoustic"
    HF_AUTH_TOKEN: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
