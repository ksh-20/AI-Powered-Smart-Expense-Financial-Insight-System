from app.models.user_settings import UserSettings


def get_settings(db, user_id: int) -> UserSettings:
    """Get user settings, creating defaults if they don't exist yet."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db, user_id: int, data) -> UserSettings:
    """Partially update user settings."""
    settings = get_settings(db, user_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
