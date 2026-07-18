import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from datetime import datetime

def forecast_expenses(expenses: list) -> dict:
    """
    Accepts historical expenses data (list of dicts containing 'amount' and 'date').
    Groups them by calendar month, runs Holt-Winters Exponential Smoothing forecasting,
    and returns both historical monthly spend and the 3-month forecast.
    """
    if not expenses:
        return {"historical": [], "forecast": []}

    df = pd.DataFrame(expenses)
    
    # Ensure date column is parsed
    df["date"] = pd.to_datetime(df["date"])
    
    # Group by calendar month
    df["month"] = df["date"].dt.to_period("M")
    monthly = df.groupby("month")["amount"].sum().reset_index()
    monthly = monthly.sort_values("month")
    
    # Format monthly data as string
    monthly["month_str"] = monthly["month"].astype(str)
    
    historical = [
        {"month": row["month_str"], "amount": round(float(row["amount"]), 2)}
        for _, row in monthly.iterrows()
    ]
    
    forecast = []
    # statsmodels Holt-Winters requires at least 2 data points (or more depending on seasonality)
    if len(historical) >= 2:
        try:
            series = monthly.set_index("month")["amount"]
            # Fit simple Exponential Smoothing model
            model = ExponentialSmoothing(series.values, initialization_method="estimated").fit()
            pred = model.forecast(3)
            
            last_period = monthly["month"].iloc[-1]
            for i in range(1, 4):
                next_month = last_period + i
                forecast.append({
                    "month": str(next_month),
                    "amount": round(max(0.0, float(pred[i-1])), 2)
                })
        except Exception as e:
            # Fallback to mean if statsmodels fails to fit
            print(f"Statsmodels fitting failed, using fallback: {e}")
            avg_spend = monthly["amount"].mean()
            last_period = monthly["month"].iloc[-1]
            for i in range(1, 4):
                next_month = last_period + i
                forecast.append({
                    "month": str(next_month),
                    "amount": round(float(avg_spend), 2)
                })
    else:
        # Fallback for single data point or low history
        avg_spend = monthly["amount"].mean() if len(historical) == 1 else 0.0
        last_month_str = historical[-1]["month"] if len(historical) == 1 else datetime.now().strftime("%Y-%m")
        
        last_date = pd.to_datetime(last_month_str + "-01")
        for i in range(1, 4):
            next_date = last_date + pd.DateOffset(months=i)
            forecast.append({
                "month": next_date.strftime("%Y-%m"),
                "amount": round(float(avg_spend), 2)
            })

    return {
        "historical": historical,
        "forecast": forecast
    }