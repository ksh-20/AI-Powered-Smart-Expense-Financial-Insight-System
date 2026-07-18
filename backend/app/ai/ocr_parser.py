import json
import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List

from app.config import settings

class TransactionItem(BaseModel):
    date: str = Field(description="Date of transaction in YYYY-MM-DD format. If no year is specified, default to 2026.")
    amount: float = Field(description="Transaction amount (spent / debit). Must be a positive float number. Ignore credit/deposits.")
    description: str = Field(description="A clean, descriptive name of the transaction merchant or service.")

class TransactionList(BaseModel):
    transactions: List[TransactionItem]

def extract_transactions_via_gemini(filepath: str) -> list:
    """
    Extracts structured transactions from statements/receipts (PDF, PNG, JPG) using Gemini 3.5 Flash.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        raise ValueError("GEMINI_API_KEY is not configured in .env file. Unable to use OCR scanning features.")

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Statement file not found: {filepath}")

    # Determine mime-type
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        mime_type = "application/pdf"
    elif ext in [".png"]:
        mime_type = "image/png"
    elif ext in [".jpg", ".jpeg"]:
        mime_type = "image/jpeg"
    else:
        raise ValueError(f"Unsupported file format for Gemini OCR: {ext}")

    # Read bytes
    with open(filepath, "rb") as f:
        file_bytes = f.read()

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    prompt = (
        "Extract all expense (debit/spending) transactions from this document. "
        "For each transaction, extract the date, the positive float amount, and the description. "
        "Ignore credit/deposit entries. Return a valid JSON list matching the schema."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type
                ),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TransactionList,
                temperature=0.1
            )
        )
        
        raw_text = response.text
        data = json.loads(raw_text)
        # Gemini may wrap output differently depending on schema; handle both forms
        if isinstance(data, list):
            return data
        return data.get("transactions", [])

    except Exception as e:
        print(f"Gemini OCR parsing failed for {filepath}: {e}")
        raise e
