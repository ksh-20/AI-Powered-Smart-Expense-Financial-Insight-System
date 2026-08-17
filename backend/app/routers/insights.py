from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.models.user_settings import UserSettings
from app.services.budget_service import get_progress
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
            "amount": float(e.amount),
            "category": cat,
            "description": e.description or "Expense",
            "date": str(e.date) if e.date else "",
        })

    # Retrieve real-time budget goals and progress for this user
    budget_progress_data = get_progress(db, user.id)

    # Retrieve portfolio monthly budget from user settings
    settings = (
        db.query(UserSettings)
        .filter(UserSettings.user_id == user.id)
        .first()
    )
    monthly_budget = (
        float(settings.monthly_budget)
        if settings and settings.monthly_budget
        else 0.0
    )

    result = generate_detailed_insights(
        total=total,
        categories=categories,
        expenses=expense_dicts,
        budget_goals=budget_progress_data,
        monthly_budget=monthly_budget,
    )
    result["total"] = total
    result["count"] = len(expenses)
    result["categories"] = categories
    result["budget_goals"] = budget_progress_data
    result["monthly_budget"] = monthly_budget

    return result