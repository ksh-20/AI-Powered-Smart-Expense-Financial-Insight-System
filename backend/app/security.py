from datetime import datetime,timedelta
from jose import jwt
from passlib.context import CryptContext
from app.config import settings

pwd=CryptContext(schemes=["bcrypt"])

def hash_password(password:str):
    return pwd.hash(password)

def verify_password(password,hashed):
    return pwd.verify(password,hashed)

def create_token(data:dict):
    payload=data.copy()
    payload["exp"]=datetime.utcnow()+timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload,settings.SECRET_KEY,algorithm=settings.ALGORITHM)