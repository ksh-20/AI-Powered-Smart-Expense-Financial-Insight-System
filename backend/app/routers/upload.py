from fastapi import APIRouter,UploadFile,File,Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.services.upload_service import process_statement

router=APIRouter(prefix="/api/upload",tags=["Upload"])

@router.post("/")
async def upload_statement(
    file:UploadFile=File(...),
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    return await process_statement(file,db,user.id)