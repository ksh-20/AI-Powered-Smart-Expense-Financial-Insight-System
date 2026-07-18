from celery import Task
from app.celery_app import celery_app
from app.database import SessionLocal
from app.services.upload_service import run_statement_processing_sync


@celery_app.task(
    name="app.tasks.process_statement_task",
    bind=True,
    autoretry_for=(Exception,),   # retry on any transient error (network, API timeout)
    max_retries=3,
    default_retry_delay=10,       # wait 10s between retries
    acks_late=True,               # only ack after successful completion / exhausted retries
)
def process_statement_task(self: Task, statement_id: int, user_id: int, filepath: str) -> str:
    """
    Background worker task to process uploaded statements using parsing or OCR.

    Retries up to 3 times (with 10s delay) on transient failures such as
    Gemini API timeouts or temporary DB connectivity issues.
    """
    print(
        f"[Celery] process_statement_task start — statement={statement_id} "
        f"attempt={self.request.retries + 1}/{self.max_retries + 1}"
    )
    db = SessionLocal()
    try:
        run_statement_processing_sync(statement_id, user_id, filepath, db)
        return f"Successfully processed statement {statement_id}"
    except Exception as e:
        print(
            f"[Celery] process_statement_task error — statement={statement_id}: {e}"
        )
        raise  # let autoretry_for handle retry / final failure
    finally:
        db.close()
