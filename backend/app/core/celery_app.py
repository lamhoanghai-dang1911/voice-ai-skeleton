from celery import Celery
from app.config import settings

celery_app = Celery(
    "ix_voice_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    worker_prefetch_multiplier=1,
    broker_connection_retry_on_startup=False,
    broker_connection_max_retries=1,
    broker_transport_options={
        "max_retries": 1,
        "socket_timeout": 1.0,
        "socket_connect_timeout": 1.0,
    },
)
