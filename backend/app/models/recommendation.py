from sqlalchemy import Column,Integer,String,ForeignKey
from app.database import Base

class Recommendation(Base):
    __tablename__="recommendations"

    id=Column(Integer,primary_key=True)
    content=Column(String)
    user_id=Column(Integer,ForeignKey("users.id"))