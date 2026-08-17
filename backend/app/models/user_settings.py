from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from app.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Display preferences
    currency = Column(String, default="INR")
    date_format = Column(String, default="DD/MM/YYYY")
    theme = Column(String, default="dark")

    # Budget
    monthly_budget = Column(Float, default=0.0)

    # Category default for new expenses
    default_category = Column(String, default="Other")

    # Notifications
    notifications_enabled = Column(Boolean, default=True)
    anomaly_alerts = Column(Boolean, default=True)
    budget_warnings = Column(Boolean, default=True)
