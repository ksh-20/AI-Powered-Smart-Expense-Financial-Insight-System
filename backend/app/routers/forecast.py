from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.ai.predictor import forecast_expenses

router=APIRouter(prefix="/api/forecast",tags=["Forecast"])

@router.get("/")
def forecast(db:Session=Depends(get_db),user=Depends(get_current_user)):
    expenses=db.query(Expense).filter(
        Expense.user_id==user.id
    ).all()

    data=[{"amount":e.amount} for e in expenses]

    return {"forecast":forecast_expenses(data)}