from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

router=APIRouter(prefix="/api/profile",tags=["Profile"])

@router.get("/")
def profile(
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    return {
        "id":user.id,
        "name":user.name,
        "email":user.email
    }