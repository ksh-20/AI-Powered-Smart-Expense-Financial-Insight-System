import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest

df=pd.read_csv("sample_data/expenses.csv")

model=IsolationForest(contamination=0.1)

model.fit(df[["amount"]])

joblib.dump(model,"saved_models/anomaly.pkl")

print("Anomaly model saved")