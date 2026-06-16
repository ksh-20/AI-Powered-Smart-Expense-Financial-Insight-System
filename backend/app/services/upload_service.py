import pandas as pd
import os
import re
from datetime import datetime, date

from app.models.expense import Expense
from app.models.statement import Statement
from app.ai.categorizer import predict_category

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def parse_date_str(date_str: str):
    """Try multiple date formats and return a date object."""
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d",
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
    Extract transactions from a PDF bank statement.
    Looks for lines containing a date + amount pair.
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


async def process_statement(file, db, user_id):
    path = f"{UPLOAD_DIR}/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    statement = Statement(file_name=file.filename, user_id=user_id)
    db.add(statement)

    transactions = []

    if file.filename.lower().endswith(".csv"):
        df = pd.read_csv(path)
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

    elif file.filename.lower().endswith(".pdf"):
        transactions = extract_pdf_transactions(path)

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
        inserted += 1

    db.commit()

    return {
        "message": "Statement uploaded successfully",
        "file": file.filename,
        "transactions_imported": inserted,
    }