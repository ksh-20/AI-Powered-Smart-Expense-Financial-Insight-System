from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class BudgetGoal(Base):
    __tablename__ = "budget_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
