from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime

from app.models.budget_goal import BudgetGoal
from app.models.expense import Expense
from app.schemas.budget import BudgetGoalCreate, BudgetGoalUpdate


def list_goals(db: Session, user_id: int):
    return db.query(BudgetGoal).filter(BudgetGoal.user_id == user_id).all()


def get_goal(db: Session, goal_id: int, user_id: int) -> BudgetGoal:
    goal = db.query(BudgetGoal).filter(
        BudgetGoal.id == goal_id,
        BudgetGoal.user_id == user_id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Budget goal not found")
    return goal


def upsert_goal(db: Session, data: BudgetGoalCreate, user_id: int) -> BudgetGoal:
    """Create a budget goal; if one already exists for this category, update it."""
    existing = db.query(BudgetGoal).filter(
        BudgetGoal.user_id == user_id,
        BudgetGoal.category == data.category
    ).first()

    if existing:
        existing.monthly_limit = data.monthly_limit
        db.commit()
        db.refresh(existing)
        return existing

    goal = BudgetGoal(user_id=user_id, category=data.category, monthly_limit=data.monthly_limit)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_goal(db: Session, goal_id: int, data: BudgetGoalUpdate, user_id: int) -> BudgetGoal:
    goal = get_goal(db, goal_id, user_id)
    if data.monthly_limit is not None:
        goal.monthly_limit = data.monthly_limit
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, goal_id: int, user_id: int):
    goal = get_goal(db, goal_id, user_id)
    db.delete(goal)
    db.commit()
    return {"message": "Budget goal deleted"}


def get_progress(db: Session, user_id: int) -> list:
    """
    Return each budget goal with current-month spending and percent used.
    Uses current calendar month for the spending window.
    """
    now = datetime.now()
    goals = list_goals(db, user_id)

    # Fetch current-month spending grouped by category in one query
    spending_rows = (
        db.query(Expense.category, func.sum(Expense.amount))
        .filter(
            Expense.user_id == user_id,
            extract("year", Expense.date) == now.year,
            extract("month", Expense.date) == now.month,
        )
        .group_by(Expense.category)
        .all()
    )
    spending_map = {cat: amt for cat, amt in spending_rows}

    results = []
    for goal in goals:
        spent = spending_map.get(goal.category, 0.0)
        pct = (spent / goal.monthly_limit * 100) if goal.monthly_limit > 0 else 0.0
        if pct >= 100:
            status = "exceeded"
        elif pct >= 70:
            status = "warning"
        else:
            status = "safe"

        results.append({
            "id": goal.id,
            "category": goal.category,
            "monthly_limit": goal.monthly_limit,
            "spent": spent,
            "percent_used": round(pct, 1),
            "status": status,
        })

    return results
