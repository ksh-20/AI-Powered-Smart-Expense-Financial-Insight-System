from fastapi import APIRouter,Depends,HTTPException
from fastapi.security import OAuth2PasswordRequestForm
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
def login(form_data:OAuth2PasswordRequestForm=Depends(), db:Session=Depends(get_db)):
    user=db.query(User).filter(User.email==form_data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token=create_token({"sub":user.email})

    return {"access_token":token, "token_type":"bearer"}