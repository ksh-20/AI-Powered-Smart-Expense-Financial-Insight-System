from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class CategoryRule(Base):
    """
    Stores user-specific description→category learned mappings.
    The 'keyword' field holds the normalized (lowercased, stripped) description.
    times_used tracks how confident the mapping has become over time.
    """
    __tablename__ = "category_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    keyword = Column(String, nullable=False)   # normalised description snippet
    category = Column(String, nullable=False)
    times_used = Column(Integer, default=1)
    last_used_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
