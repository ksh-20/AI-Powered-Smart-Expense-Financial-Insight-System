from datetime import datetime

def serialize_expense(expense):
    return {
        "id":expense.id,
        "amount":expense.amount,
        "category":expense.category,
        "description":expense.description,
        "date":str(expense.date)
    }

def current_month():
    return datetime.now().strftime("%Y-%m")