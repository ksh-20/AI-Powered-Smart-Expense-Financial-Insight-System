from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense

router=APIRouter(prefix="/api/analytics",tags=["Analytics"])

@router.get("/")
def analytics(db:Session=Depends(get_db),user=Depends(get_current_user)):
    total=db.query(func.sum(Expense.amount)).filter(
        Expense.user_id==user.id
    ).scalar() or 0

    categories=db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).group_by(Expense.category).all()

    return {
        "total":total,
        "categories":[{"name":c,"value":v} for c,v in categories]
    }