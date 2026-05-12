import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing

def forecast_expenses(expenses):
    df=pd.DataFrame(expenses)
    if df.empty:
        return []

    series=df["amount"]
    model=ExponentialSmoothing(series).fit()
    pred=model.forecast(3)

    return pred.tolist()