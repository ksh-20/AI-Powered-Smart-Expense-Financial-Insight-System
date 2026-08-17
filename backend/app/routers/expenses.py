from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.services.expense_service import create_expense, update_expense, delete_expense
from app.cache import cache_get, cache_set, invalidate_user_caches, user_cache_key
from typing import List

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

# Prefixes invalidated together on any write so analytics stays consistent
_WRITE_INVALIDATE_PREFIXES = ("expenses", "analytics")


@router.post("/", response_model=ExpenseOut)
def add_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    expense = create_expense(db, data, user.id)
    invalidate_user_caches(user.id, *_WRITE_INVALIDATE_PREFIXES)
    return expense


@router.get("/", response_model=List[ExpenseOut])
def get_expenses(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    key = user_cache_key("expenses", user.id)
    cached = cache_get(key)
    if cached is not None:
        return cached

    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.date.desc())
        .all()
    )
    # Serialise to dicts for JSON-compatible caching
    result = [ExpenseOut.model_validate(e).model_dump(mode="json") for e in expenses]
    cache_set(key, result, ttl=120)  # shorter TTL – list is mutation-sensitive
    return expenses


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
def edit_expense(
    expense_id: int,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    expense = update_expense(db, expense_id, data, user.id)
    invalidate_user_caches(user.id, *_WRITE_INVALIDATE_PREFIXES)
    return expense


@router.delete("/{expense_id}")
def remove_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    result = delete_expense(db, expense_id, user.id)
    invalidate_user_caches(user.id, *_WRITE_INVALIDATE_PREFIXES)
    return result