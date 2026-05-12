from sqlalchemy import func
from app.models.expense import Expense

def calculate_summary(db,user_id):
    total=db.query(func.sum(Expense.amount)).filter(
        Expense.user_id==user_id
    ).scalar() or 0

    categories=db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).group_by(Expense.category).all()

    return {
        "total":total,
        "categories":[
            {"name":c,"value":float(v)}
            for c,v in categories
        ]
    }