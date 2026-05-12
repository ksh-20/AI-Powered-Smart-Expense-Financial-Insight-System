from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import SignupSchema,LoginSchema
from app.models.user import User
from app.security import hash_password,verify_password,create_token

router=APIRouter(prefix="/api/auth",tags=["Auth"])

@router.post("/signup")
def signup(data:SignupSchema,db:Session=Depends(get_db)):
    exists=db.query(User).filter(User.email==data.email).first()

    if exists:
        raise HTTPException(400,"Email exists")

    user=User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)
    )

    db.add(user)
    db.commit()

    return {"message":"User created"}

@router.post("/login")
def login(data:LoginSchema,db:Session=Depends(get_db)):
    user=db.query(User).filter(User.email==data.email).first()

    if not user or not verify_password(data.password,user.password):
        raise HTTPException(401,"Invalid credentials")

    token=create_token({"sub":user.email})

    return {"access_token":token}