from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.ai.anomaly_detector import detect
from app.ai.chatbot_engine import financial_chat

router = APIRouter(prefix="/api/anomaly", tags=["Anomaly"])


class ExplainRequest(BaseModel):
    transaction_id: Optional[int] = None
    amount: float
    category: str
    description: Optional[str] = "Expense"
    date: Optional[str] = ""


@router.get("/")
def anomalies(db: Session = Depends(get_db), user=Depends(get_current_user)):
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.date.desc())
        .all()
    )

    data = [
        {
            "id": e.id,
            "amount": e.amount,
            "category": e.category or "Other",
            "description": e.description or "Expense",
            "date": str(e.date) if e.date else "",
        }
        for e in expenses
    ]

    return detect(data)


@router.post("/explain")
def explain_anomaly(
    req: ExplainRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    On-demand NLP deep-dive explanation for a specific flagged transaction using LLM/Gemini.
    """
    # Fetch category context
    cat_expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id, Expense.category == req.category)
        .all()
    )
    cat_total = sum(e.amount for e in cat_expenses) if cat_expenses else req.amount
    cat_count = len(cat_expenses) if cat_expenses else 1
    cat_avg = cat_total / cat_count if cat_count > 0 else req.amount

    prompt = f"""
Analyze this flagged financial transaction for a user and explain why it is unusual in natural, concise, and helpful language:

Transaction Details:
- Description: {req.description}
- Category: {req.category}
- Amount: ₹{req.amount:,.2f}
- Date: {req.date}

User's Historical Context in '{req.category}':
- Total historical transactions: {cat_count}
- Average transaction amount: ₹{cat_avg:,.2f}

Please provide:
1. Clear reasoning on why this purchase stands out (spending anomaly).
2. NLP merchant/description interpretation.
3. A practical security / budgeting recommendation for the user.
Keep your response concise, bulleted, and actionable.
"""
    ai_response = financial_chat(prompt)
    return {"explanation": ai_response}