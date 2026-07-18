from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.budget import BudgetGoalCreate, BudgetGoalUpdate, BudgetGoalOut, BudgetProgressOut
from app.services.budget_service import (
    list_goals, get_goal, upsert_goal, update_goal, delete_goal, get_progress
)

router = APIRouter(prefix="/api/budget", tags=["Budget Goals"])


@router.get("/progress", response_model=List[BudgetProgressOut])
def budget_progress(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get all budget goals with current-month spending and percent used."""
    return get_progress(db, user.id)


@router.get("/", response_model=List[BudgetGoalOut])
def read_goals(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return list_goals(db, user.id)


@router.post("/", response_model=BudgetGoalOut)
def create_goal(
    data: BudgetGoalCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return upsert_goal(db, data, user.id)


@router.put("/{goal_id}", response_model=BudgetGoalOut)
def edit_goal(
    goal_id: int,
    data: BudgetGoalUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return update_goal(db, goal_id, data, user.id)


@router.delete("/{goal_id}")
def remove_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return delete_goal(db, goal_id, user.id)
