from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.expense import ExpenseCreate
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.services.expense_service import create_expense

router=APIRouter(prefix="/api/expenses",tags=["Expenses"])

@router.post("/")
def add_expense(
    data:ExpenseCreate,
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    return create_expense(db,data,user.id)

@router.get("/")
def get_expenses(
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Expense).filter(Expense.user_id==user.id).all()