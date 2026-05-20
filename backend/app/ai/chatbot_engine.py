from transformers import pipeline

generator=pipeline(
    "text2text-generation",
    model="google/flan-t5-base"
)

SYSTEM_PROMPT="""
You are a financial AI assistant.
Give concise financial advice.
Help users save money.
Explain overspending.
Suggest budgeting strategies.
"""

def financial_chat(message:str):

    prompt=f"""
    {SYSTEM_PROMPT}

    User: {message}

    Assistant:
    """

    result=generator(
        prompt,
        max_length=128,
        do_sample=True,
        temperature=0.7
    )

    return result[0]["generated_text"]