from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.services.expense_service import create_expense, update_expense, delete_expense
from typing import List

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseOut)
def add_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return create_expense(db, data, user.id)

@router.get("/", response_model=List[ExpenseOut])
def get_expenses(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Expense).filter(Expense.user_id == user.id).order_by(Expense.date.desc()).all()

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
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
    user=Depends(get_current_user)
):
    return update_expense(db, expense_id, data, user.id)

@router.delete("/{expense_id}")
def remove_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return delete_expense(db, expense_id, user.id)