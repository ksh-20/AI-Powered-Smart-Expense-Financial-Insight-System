import pandas as pd
import numpy as np
from datetime import datetime
import calendar


def forecast_expenses(expenses: list) -> dict:
    """
    Accepts historical expenses data (list of dicts containing 'amount', 'date', and optional 'category').
    Groups them by calendar month, runs trend-aware & calendar-weighted forecasting,
    and returns both historical monthly spend, dynamic 3-month forecast with confidence intervals, and telemetry.
    """
    if not expenses:
        return {
            "historical": [],
            "forecast": [],
            "summary": {
                "last_actual_spend": 0.0,
                "next_month_projected": 0.0,
                "three_month_projected_total": 0.0,
                "avg_projected_monthly": 0.0,
                "trend_direction": "neutral",
                "projected_mom_growth_pct": 0.0,
            },
        }

    df = pd.DataFrame(expenses)

    # Ensure amount is numeric and clean
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)

    # Ensure date column is parsed
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    if df.empty:
        return {
            "historical": [],
            "forecast": [],
            "summary": {
                "last_actual_spend": 0.0,
                "next_month_projected": 0.0,
                "three_month_projected_total": 0.0,
                "avg_projected_monthly": 0.0,
                "trend_direction": "neutral",
                "projected_mom_growth_pct": 0.0,
            },
        }

    # Group by calendar month
    df["month"] = df["date"].dt.to_period("M")
    monthly = df.groupby("month")["amount"].sum().reset_index().sort_values("month")
    monthly["month_str"] = monthly["month"].astype(str)

    historical = [
        {"month": row["month_str"], "amount": round(float(row["amount"]), 2)}
        for _, row in monthly.iterrows()
    ]

    total_spend = float(df["amount"].sum())
    last_period = monthly["month"].iloc[-1]
    last_amount = float(monthly["amount"].iloc[-1])

    # Classify essential vs discretionary categories for realistic volatility modeling
    essential_cats = {
        "Utilities",
        "Groceries",
        "Healthcare",
        "Education",
        "Rent",
        "Bills",
        "Insurance",
        "Housing",
    }
    if "category" in df.columns:
        df["is_essential"] = df["category"].apply(
            lambda c: str(c) in essential_cats
        )
        essential_spend = float(df[df["is_essential"]]["amount"].sum())
    else:
        essential_spend = total_spend * 0.40

    discretionary_spend = max(0.0, total_spend - essential_spend)

    # Ratio of essential to total
    essential_ratio = essential_spend / max(total_spend, 1.0)
    discretionary_ratio = 1.0 - essential_ratio

    # Calculate monthly trend rate based on historical depth
    if len(historical) >= 2:
        amounts = monthly["amount"].values
        n = len(amounts)
        x = np.arange(n)
        # Linear slope
        slope, _ = np.polyfit(x, amounts, 1)
        mean_amt = max(float(amounts.mean()), 1.0)
        # Damped trend rate per month
        trend_rate = float(slope / mean_amt)
        # Clamp to realistic monthly trend boundaries [-12%, +12%]
        trend_rate = float(np.clip(trend_rate, -0.12, 0.12))
    else:
        # Default mild 1.5% economic baseline drift
        trend_rate = 0.015

    forecast = []

    # Generate 3-month dynamic forecast
    for i in range(1, 4):
        next_month = last_period + i
        year = int(next_month.year)
        month_num = int(next_month.month)

        # Calendar month length adjustment (e.g. 31 vs 30 vs 28 days)
        days_in_month = calendar.monthrange(year, month_num)[1]
        days_factor = days_in_month / 30.4375

        # Weekend count factor in the target month (more weekends = higher discretionary leisure/shopping)
        num_weekends = sum(
            1
            for day in range(1, days_in_month + 1)
            if datetime(year, month_num, day).weekday() >= 5
        )
        weekend_factor = 1.0 + ((num_weekends - 8.7) * 0.012)

        # Seasonal calendar factors (festive / holiday / quarter cycles)
        if month_num in [10, 11, 12]:  # Q4 festive / shopping season
            seasonal_multiplier = 1.035 + (0.015 * (month_num - 9))
        elif month_num in [1, 2]:  # Post-holiday austerity
            seasonal_multiplier = 0.965
        elif month_num in [6, 7]:  # Mid-year vacations
            seasonal_multiplier = 1.02
        else:
            seasonal_multiplier = 1.0 + (0.008 * (i - 1))

        # Model recurring essential outflow (very stable, slight inflation)
        projected_essential = (
            last_amount * essential_ratio * (1.0 + (0.004 * i)) * days_factor
        )

        # Model discretionary lifestyle outflow (trend + weekend elasticity + seasonality)
        projected_discretionary = (
            last_amount
            * discretionary_ratio
            * (1.0 + (trend_rate * i))
            * seasonal_multiplier
            * days_factor
            * weekend_factor
        )

        predicted_amount = max(
            0.0, float(projected_essential + projected_discretionary)
        )

        # Confidence intervals (expanding uncertainty corridor with time horizon)
        variance_margin = 0.06 + (0.03 * i)  # ±9%, ±12%, ±15%
        lower_bound = round(max(0.0, predicted_amount * (1.0 - variance_margin)), 2)
        upper_bound = round(predicted_amount * (1.0 + variance_margin), 2)

        mom_change = round(
            ((predicted_amount - last_amount) / max(last_amount, 1.0)) * 100, 1
        )

        forecast.append(
            {
                "month": str(next_month),
                "amount": round(predicted_amount, 2),
                "lower_bound": lower_bound,
                "upper_bound": upper_bound,
                "days_in_month": days_in_month,
                "projected_change_pct": mom_change,
            }
        )

    three_month_total = round(sum(f["amount"] for f in forecast), 2)
    avg_projected = round(three_month_total / 3.0, 2)
    next_month_amt = forecast[0]["amount"]
    mom_growth = round(
        ((next_month_amt - last_amount) / max(last_amount, 1.0)) * 100, 1
    )

    trend_dir = (
        "increasing"
        if mom_growth > 1.5
        else "decreasing"
        if mom_growth < -1.5
        else "stable"
    )

    return {
        "historical": historical,
        "forecast": forecast,
        "summary": {
            "last_actual_spend": round(last_amount, 2),
            "next_month_projected": next_month_amt,
            "three_month_projected_total": three_month_total,
            "avg_projected_monthly": avg_projected,
            "trend_direction": trend_dir,
            "projected_mom_growth_pct": mom_growth,
        },
    }