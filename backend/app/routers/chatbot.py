from fastapi import APIRouter
from app.schemas.chatbot import ChatRequest
from app.ai.chatbot_engine import financial_chat

router=APIRouter(prefix="/api/chatbot",tags=["Chatbot"])

@router.post("/")
def chatbot(data:ChatRequest):
    return {"response":financial_chat(data.message)}