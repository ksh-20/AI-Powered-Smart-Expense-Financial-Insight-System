from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base,engine
from app.models import *  #to import all models

from app.routers import (
    auth,
    expenses,
    analytics,
    forecast,
    anomaly,
    chatbot
)

Base.metadata.create_all(bind=engine)

app=FastAPI(title="AI Finance System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(analytics.router)
app.include_router(forecast.router)
app.include_router(anomaly.router)
app.include_router(chatbot.router)

@app.get("/")
def root():
    return {"message":"AI Finance API Running"}