from app.ai.chatbot_engine import financial_chat

def get_chat_response(message:str):
    return financial_chat(message)