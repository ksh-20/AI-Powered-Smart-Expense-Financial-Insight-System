from fastapi import HTTPException
from app.models.expense import Expense
from app.ai.categorizer import learn_from_expense


def create_expense(db, data, user_id):
    expense = Expense(**data.dict(), user_id=user_id)
    db.add(expense)
    db.commit()
    db.refresh(expense)

    # Auto-learn: store this description → category mapping for the user
    learn_from_expense(expense.description, expense.category, db, user_id)

    return expense


def update_expense(db, expense_id, data, user_id):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)

    # Auto-learn: reinforce updated description → category mapping
    learn_from_expense(expense.description, expense.category, db, user_id)

    return expense


def delete_expense(db, expense_id, user_id):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}