from sklearn.ensemble import IsolationForest
import pandas as pd

def detect(expenses):
    df=pd.DataFrame(expenses)

    if df.empty:
        return []

    model=IsolationForest(contamination=0.1)
    preds=model.fit_predict(df[["amount"]])

    anomalies=[]
    for i,p in enumerate(preds):
        if p==-1:
            anomalies.append({
                "index":i,
                "amount":df.iloc[i]["amount"]
            })

    return anomalies