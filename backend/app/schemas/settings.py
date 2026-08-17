from pydantic import BaseModel
from typing import Optional


class SettingsOut(BaseModel):
    currency: str
    date_format: str
    theme: str
    monthly_budget: float
    default_category: str
    notifications_enabled: bool
    anomaly_alerts: bool
    budget_warnings: bool

    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    currency: Optional[str] = None
    date_format: Optional[str] = None
    theme: Optional[str] = None
    monthly_budget: Optional[float] = None
    default_category: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    anomaly_alerts: Optional[bool] = None
    budget_warnings: Optional[bool] = None
