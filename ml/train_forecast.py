import pandas as pd
import joblib

from statsmodels.tsa.holtwinters import ExponentialSmoothing

df=pd.read_csv("sample_data/expenses.csv")

series=df["amount"]

model=ExponentialSmoothing(series).fit()

joblib.dump(model,"saved_models/forecast.pkl")

print("Forecast model saved")