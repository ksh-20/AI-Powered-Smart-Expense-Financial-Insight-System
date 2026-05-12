from sqlalchemy import Column,Integer,String,ForeignKey
from app.database import Base

class Statement(Base):
    __tablename__="uploaded_statements"

    id=Column(Integer,primary_key=True)
    file_name=Column(String)
    user_id=Column(Integer,ForeignKey("users.id"))