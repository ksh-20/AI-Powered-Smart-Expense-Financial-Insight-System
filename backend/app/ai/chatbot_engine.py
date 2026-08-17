from google import genai
from google.genai import types
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT_TEMPLATE = """
You are FinAI, an expert AI financial advisor and intelligent expense intelligence assistant.

USER'S CURRENT FINANCIAL TELEMETRY CONTEXT:
{user_context}

YOUR CORE OBJECTIVES:
1. Provide personalized, mathematically grounded advice using the user's actual data when relevant.
2. Help users eliminate wasteful spending, optimize their 50/30/20 lifestyle ratio, and accelerate savings.
3. Explain spending anomalies and behavioral spending rhythms clearly.
4. Give concrete, actionable steps rather than generic platitudes.
5. Format your answers cleanly with bullet points, bold key figures, and concise paragraphs.
"""


def financial_chat(message: str, user_context: str = ""):
    try:
        context_str = user_context or "No active expense data recorded yet."
        system_instruction = SYSTEM_PROMPT_TEMPLATE.format(
            user_context=context_str
        )

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            ),
        )
        return response.text

    except Exception as e:
        return f"I am your FinAI financial assistant. (Advisory engine note: {str(e)})"