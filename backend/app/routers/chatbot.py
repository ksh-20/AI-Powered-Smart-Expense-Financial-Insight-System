from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.models.user_settings import UserSettings
from app.schemas.chatbot import ChatRequest
from app.ai.chatbot_engine import financial_chat

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


@router.post("/")
def chatbot(
    data: ChatRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Gather real-time financial telemetry for the user
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.date.desc())
        .all()
    )

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

    if expenses:
        total_spent = sum(e.amount for e in expenses)
        count = len(expenses)
        cat_map = {}
        for e in expenses:
            cat = e.category or "Other"
            cat_map[cat] = cat_map.get(cat, 0.0) + e.amount

        sorted_cats = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
        top_cats_str = ", ".join(
            [
                f"{cat}: ₹{amt:,.2f} ({amt/total_spent*100:.1f}%)"
                for cat, amt in sorted_cats[:4]
            ]
        )

        user_context = (
            f"- Total Recorded Outflow: ₹{total_spent:,.2f}\n"
            f"- Total Transactions: {count}\n"
            f"- Top Spending Categories: {top_cats_str}\n"
            f"- Monthly Budget Limit: ₹{monthly_budget:,.2f} (Budget Set: {'Yes' if monthly_budget > 0 else 'No'})\n"
        )
    else:
        user_context = (
            f"User has not recorded any transactions yet.\n"
            f"- Monthly Budget Limit: ₹{monthly_budget:,.2f}\n"
        )

    response_text = financial_chat(data.message, user_context)
    return {"response": response_text}