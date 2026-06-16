from pydantic import BaseModel
from datetime import date
from typing import Optional

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str
    date: date

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None

class ExpenseOut(BaseModel):
    id: int
    amount: float
    category: str
    description: str
    date: date
    user_id: int

    class Config:
        from_attributes = True