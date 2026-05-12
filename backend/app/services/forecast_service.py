from app.ai.predictor import forecast_expenses

def generate_forecast(expenses):
    data=[{"amount":e.amount} for e in expenses]
    return forecast_expenses(data)