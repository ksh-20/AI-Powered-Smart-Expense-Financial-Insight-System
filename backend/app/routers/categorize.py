from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.category import CategorySuggestOut
from app.ai.categorizer import predict_category_with_learning

router = APIRouter(prefix="/api/categorize", tags=["Categorize"])


@router.get("/", response_model=CategorySuggestOut)
def suggest_category(
    description: str = Query(..., min_length=1, description="Expense description to categorize"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Live category suggestion endpoint.
    Checks user-learned rules first, then falls back to global keyword matching.
    """
    result = predict_category_with_learning(description, db, user.id)
    return result
