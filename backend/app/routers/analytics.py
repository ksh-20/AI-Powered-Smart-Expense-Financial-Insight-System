from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.cache import cache_get, cache_set, user_cache_key

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

CACHE_PREFIX = "analytics"


@router.get("/")
def analytics(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # ── Try cache first ──────────────────────────────────────────────────────
    key = user_cache_key(CACHE_PREFIX, user.id)
    cached = cache_get(key)
    if cached is not None:
        return cached

    # ── DB query ─────────────────────────────────────────────────────────────
    total = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user.id
    ).scalar() or 0

    count = db.query(func.count(Expense.id)).filter(
        Expense.user_id == user.id
    ).scalar() or 0

    categories = db.query(
        Expense.category,
        func.sum(Expense.amount),
        func.count(Expense.id),
    ).filter(
        Expense.user_id == user.id
    ).group_by(Expense.category).all()

    result = {
        "total": total,
        "count": count,
        "categories": [{"name": c, "value": v, "count": n} for c, v, n in categories],
    }

    # ── Populate cache ────────────────────────────────────────────────────────
    cache_set(key, result)

    return result