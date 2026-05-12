from fastapi import Depends,HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt,JWTError
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token:str=Depends(oauth2_scheme),db:Session=Depends(get_db)):
    try:
        payload=jwt.decode(token,settings.SECRET_KEY,algorithms=[settings.ALGORITHM])
        user=db.query(User).filter(User.email==payload["sub"]).first()
        if not user:
            raise HTTPException(401,"Invalid token")
        return user
    except JWTError:
        raise HTTPException(401,"Invalid token")