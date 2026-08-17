import pandas as pd
import os
import re
from datetime import datetime, date

from app.models.expense import Expense
from app.models.statement import Statement
from app.ai.categorizer import predict_category, learn_from_expense
from app.ai.ocr_parser import extract_transactions_via_gemini
from app.cache import invalidate_user_caches

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def parse_date_str(date_str: str):
    """Try multiple date formats and return a date object."""
    formats = [
        "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y",
        "%d/%m/%y", "%d-%m-%y",
        "%d %b %Y", "%d %B %Y",
        "%b %d, %Y", "%B %d, %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    return None


def extract_pdf_transactions(path: str):
    """
    Extract transactions from a PDF bank statement using PyPDF2.
    Used as a fallback for digital text-based PDFs.
    """
    try:
        import PyPDF2
    except ImportError:
        return []

    transactions = []

    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        pages_text = [page.extract_text() or "" for page in reader.pages]
    full_text = "\n".join(pages_text)

    # Regex patterns
    date_pattern = re.compile(
        r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}"
        r"|\d{4}[\/\-]\d{2}[\/\-]\d{2}"
        r"|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}"
        r"|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4})",
        re.IGNORECASE,
    )
    amount_pattern = re.compile(r"[\d,]+\.\d{2}")

    lines = full_text.split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        date_match = date_pattern.search(line)
        if not date_match:
            continue

        amounts = amount_pattern.findall(line)
        if not amounts:
            continue

        parsed_date = parse_date_str(date_match.group(0))
        if not parsed_date:
            continue

        # Use the last monetary amount on the line (debit column)
        amount_str = amounts[-1].replace(",", "")
        try:
            amount = float(amount_str)
        except ValueError:
            continue

        if amount <= 0:
            continue

        # Description: text between end of date match and last amount occurrence
        desc_start = date_match.end()
        last_amount_pos = line.rfind(amounts[-1])
        description = line[desc_start:last_amount_pos].strip()
        description = re.sub(r"\s{2,}", " ", description)  # collapse whitespace

        if not description:
            description = "Bank Transaction"

        transactions.append({
            "date": parsed_date,
            "amount": amount,
            "description": description,
        })

    return transactions


async def save_and_create_statement_record(file, db, user_id) -> tuple:
    """
    Save statement file to disk and record standard metadata with pending status.
    """
    path = os.path.join(UPLOAD_DIR, file.filename)
    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)

    statement = Statement(
        file_name=file.filename,
        user_id=user_id,
        status="pending",
        transactions_imported=0
    )
    db.add(statement)
    db.commit()
    db.refresh(statement)
    return statement, path


def run_statement_processing_sync(statement_id: int, user_id: int, filepath: str, db) -> None:
    """
    Synchronous processing logic run within Celery background tasks.
    Updates statement tracking status and parses transaction details via pandas or Gemini OCR.
    """
    statement = db.query(Statement).filter(Statement.id == statement_id).first()
    if not statement:
        return

    statement.status = "processing"
    db.commit()

    try:
        transactions = []
        ext = os.path.splitext(filepath)[1].lower()

        if ext == ".csv":
            df = pd.read_csv(filepath)
            for _, row in df.iterrows():
                description = str(row.get("description", ""))
                try:
                    amount = float(row.get("amount", 0))
                except (ValueError, TypeError):
                    continue
                raw_date = row.get("date")
                parsed_date = parse_date_str(str(raw_date)) if raw_date else date.today()
                transactions.append({
                    "date": parsed_date or date.today(),
                    "amount": amount,
                    "description": description,
                })

        elif ext in [".png", ".jpg", ".jpeg"]:
            # Extract transactions from images using Gemini OCR
            ocr_txns = extract_transactions_via_gemini(filepath)
            for txn in ocr_txns:
                transactions.append({
                    "date": parse_date_str(txn["date"]) or date.today(),
                    "amount": txn["amount"],
                    "description": txn["description"]
                })

        elif ext == ".pdf":
            # Attempt Gemini multimodal parsing first (ideal for scanned statements)
            try:
                ocr_txns = extract_transactions_via_gemini(filepath)
                for txn in ocr_txns:
                    transactions.append({
                        "date": parse_date_str(txn["date"]) or date.today(),
                        "amount": txn["amount"],
                        "description": txn["description"]
                    })
            except Exception as e:
                # Fall back to standard textual regex parse
                print(f"Gemini OCR parsing failed or unconfigured, falling back to local extractor: {e}")
                transactions = extract_pdf_transactions(filepath)
        else:
            raise ValueError(f"Unsupported statement format: {ext}")

        inserted = 0
        for txn in transactions:
            if txn["amount"] <= 0:
                continue
            
            category = predict_category(txn["description"])
            expense = Expense(
                amount=txn["amount"],
                category=category,
                description=txn["description"],
                date=txn["date"],
                user_id=user_id,
            )
            db.add(expense)
            # Train category auto-learning system
            learn_from_expense(txn["description"], category, db, user_id)
            inserted += 1

        statement.status = "completed"
        statement.transactions_imported = inserted
        db.commit()

        # Bust per-user caches so analytics and expense list return fresh data
        invalidate_user_caches(user_id, "expenses", "analytics")

    except Exception as e:
        db.rollback()
        statement.status = "failed"
        statement.error_message = str(e)
        db.commit()
        raise e