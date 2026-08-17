from sqlalchemy import Column,Integer,String,ForeignKey
from app.database import Base

class ChatHistory(Base):
    __tablename__="chatbot_history"

    id=Column(Integer,primary_key=True)
    question=Column(String)
    response=Column(String)
    user_id=Column(Integer,ForeignKey("users.id"))