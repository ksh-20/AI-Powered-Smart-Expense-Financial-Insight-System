from sqlalchemy import Column,Integer,Float,String,ForeignKey
from app.database import Base

class Forecast(Base):
    __tablename__="forecasts"

    id=Column(Integer,primary_key=True)
    month=Column(String)
    predicted_amount=Column(Float)
    category=Column(String)
    user_id=Column(Integer,ForeignKey("users.id"))