from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.statement import Statement
from app.services.upload_service import save_and_create_statement_record
from app.tasks import process_statement_task

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("/")
async def upload_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Asynchronous statement upload. Saves file and triggers background extraction task.
    """
    # Accept standard receipt and statement formats
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["csv", "pdf", "png", "jpg", "jpeg"]:
        raise HTTPException(status_code=400, detail="Only CSV, PDF, and image formats (PNG, JPG) are supported.")

    statement, filepath = await save_and_create_statement_record(file, db, user.id)
    
    # Enqueue Celery task
    process_statement_task.delay(statement.id, user.id, filepath)
    
    return {
        "id": statement.id,
        "status": statement.status,
        "message": "Statement upload accepted. Background processing started."
    }

@router.get("/status/{statement_id}")
def check_statement_status(
    statement_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """
    Get background statement processing task status.
    """
    statement = db.query(Statement).filter(
        Statement.id == statement_id,
        Statement.user_id == user.id
    ).first()
    
    if not statement:
        raise HTTPException(status_code=404, detail="Statement record not found.")
        
    return {
        "id": statement.id,
        "status": statement.status,
        "transactions_imported": statement.transactions_imported,
        "error_message": statement.error_message
    }