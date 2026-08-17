from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.ai.recommender import generate_detailed_insights

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("/")
def insights(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.date.desc())
        .all()
    )

    total = round(sum([e.amount for e in expenses]), 2)

    categories = {}
    expense_dicts = []
    for e in expenses:
        cat = e.category or "Other"
        categories[cat] = round(categories.get(cat, 0.0) + e.amount, 2)
        expense_dicts.append({
            "id": e.id,
            "amount": e.amount,
            "category": cat,
            "description": e.description or "Expense",
            "date": str(e.date) if e.date else "",
        })

    result = generate_detailed_insights(total, categories, expense_dicts)
    result["total"] = total
    result["count"] = len(expenses)
    result["categories"] = categories

    return result