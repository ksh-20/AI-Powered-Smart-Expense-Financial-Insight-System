from celery import Celery
from app.config import settings

broker_url = settings.CELERY_BROKER_URL
celery_app = Celery("tasks", broker=broker_url, backend=broker_url)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Celery on Windows requires solo execution, which we handle via worker run flags.
    include=["app.tasks"]
)
