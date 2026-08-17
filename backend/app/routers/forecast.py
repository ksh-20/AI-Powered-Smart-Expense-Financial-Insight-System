from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.ai.predictor import forecast_expenses

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])


@router.get("/")
def forecast(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Retrieves user's historical expenses and generates a trend-aware, dynamic monthly forecast.
    Returns historical aggregates, forecasted months with confidence bands, and summary metrics.
    """
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.date.asc())
        .all()
    )

    data = [
        {
            "id": e.id,
            "amount": float(e.amount),
            "category": str(e.category) if e.category else "Other",
            "date": str(e.date),
            "description": str(e.description or ""),
        }
        for e in expenses
    ]

    return forecast_expenses(data)