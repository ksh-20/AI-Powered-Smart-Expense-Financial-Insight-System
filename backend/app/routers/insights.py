from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.ai.recommender import generate_recommendations

router=APIRouter(prefix="/api/insights",tags=["Insights"])

@router.get("/")
def insights(
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    expenses=db.query(Expense).filter(
        Expense.user_id==user.id
    ).all()

    total=sum([e.amount for e in expenses])

    categories={}
    for e in expenses:
        categories[e.category]=categories.get(e.category,0)+e.amount

    rec=generate_recommendations(total,categories)

    return {
        "recommendations":rec,
        "total":total,
        "categories":categories
    }