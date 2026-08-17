from google import genai
from google.genai import types
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are an AI-powered financial assistant.

Your responsibilities:
- Help users reduce expenses
- Suggest budgeting strategies
- Explain spending behavior
- Give investment and saving tips
- Provide concise and practical financial advice

Rules:
- Keep answers concise but detailed
- Be practical
- Avoid generic responses
- Use bullet points when helpful
"""

def financial_chat(message: str):
    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT
            )
        )
        return response.text
        
    except Exception as e:
        return f"An error occurred: {str(e)}"