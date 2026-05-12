from app.models.expense import Expense

def create_expense(db,data,user_id):
    expense=Expense(**data.dict(),user_id=user_id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense