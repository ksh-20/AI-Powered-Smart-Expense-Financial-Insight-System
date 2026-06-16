from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.settings import SettingsOut, SettingsUpdate
from app.services.settings_service import get_settings, update_settings

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("/", response_model=SettingsOut)
def read_settings(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_settings(db, user.id)


@router.put("/", response_model=SettingsOut)
def write_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return update_settings(db, user.id, data)
