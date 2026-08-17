from sqlalchemy import Column,Integer,Float,String,ForeignKey
from app.database import Base

class Anomaly(Base):
    __tablename__="anomalies"

    id=Column(Integer,primary_key=True)
    transaction_id=Column(Integer)
    risk_score=Column(Float)
    reason=Column(String)
    user_id=Column(Integer,ForeignKey("users.id"))