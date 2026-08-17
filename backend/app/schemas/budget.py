from pydantic import BaseModel
from typing import Optional


class BudgetGoalCreate(BaseModel):
    category: str
    monthly_limit: float


class BudgetGoalUpdate(BaseModel):
    monthly_limit: Optional[float] = None


class BudgetGoalOut(BaseModel):
    id: int
    category: str
    monthly_limit: float

    class Config:
        from_attributes = True


class BudgetProgressOut(BaseModel):
    id: int
    category: str
    monthly_limit: float
    spent: float
    percent_used: float
    status: str          # "safe" | "warning" | "exceeded"

    class Config:
        from_attributes = True
