import pandas as pd
import os

from app.models.expense import Expense
from app.models.statement import Statement
from app.ai.categorizer import predict_category

UPLOAD_DIR="uploads"

os.makedirs(UPLOAD_DIR,exist_ok=True)

async def process_statement(file,db,user_id):

    path=f"{UPLOAD_DIR}/{file.filename}"

    with open(path,"wb") as f:
        f.write(await file.read())

    statement=Statement(
        file_name=file.filename,
        user_id=user_id
    )

    db.add(statement)

    if file.filename.endswith(".csv"):

        df=pd.read_csv(path)

        for _,row in df.iterrows():

            category=predict_category(
                str(row.get("description",""))
            )

            expense=Expense(
                amount=float(row.get("amount",0)),
                category=category,
                description=row.get("description",""),
                date=row.get("date"),
                user_id=user_id
            )

            db.add(expense)

    db.commit()

    return {"message":"Statement uploaded"}