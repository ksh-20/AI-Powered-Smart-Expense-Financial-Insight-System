from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Statement(Base):
    __tablename__ = "uploaded_statements"

    id = Column(Integer, primary_key=True)
    file_name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    transactions_imported = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())