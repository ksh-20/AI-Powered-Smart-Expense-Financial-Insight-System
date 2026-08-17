from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import get_db
from app.dependencies import get_current_user
from app.models.expense import Expense
from app.cache import cache_get, cache_set, user_cache_key

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

CACHE_PREFIX = "analytics"


@router.get("/")
def analytics(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # ── Try cache first ──────────────────────────────────────────────────────
    key = user_cache_key(CACHE_PREFIX, user.id)
    cached = cache_get(key)
    if cached is not None:
        return cached

    # ── DB query: fetch all user expenses ────────────────────────────────────
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.date.asc(), Expense.id.asc())
        .all()
    )

    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    if not expenses:
        result = {
            "total": 0.0,
            "count": 0,
            "categories": [],
            "monthly_trend": [],
            "day_of_week": [
                {"day": d, "day_num": i, "amount": 0.0, "count": 0, "avg": 0.0}
                for i, d in enumerate(day_names)
            ],
            "daily_trend": [],
            "summary": {
                "avg_transaction": 0.0,
                "max_transaction": None,
                "top_category": None,
                "weekend_total": 0.0,
                "weekday_total": 0.0,
                "weekend_percent": 0.0,
                "weekday_percent": 0.0,
                "active_days": 0,
                "daily_average": 0.0,
                "mom_change_pct": None,
            },
            "interpretations": [],
            "raw_expenses": [],
        }
        cache_set(key, result)
        return result

    total = round(sum(e.amount for e in expenses), 2)
    count = len(expenses)

    # ── 1. Categories Aggregation ────────────────────────────────────────────
    cat_dict = {}
    for e in expenses:
        cat = e.category or "Other"
        if cat not in cat_dict:
            cat_dict[cat] = {"total": 0.0, "count": 0, "amounts": []}
        cat_dict[cat]["total"] += e.amount
        cat_dict[cat]["count"] += 1
        cat_dict[cat]["amounts"].append(e.amount)

    categories = []
    for cat, info in cat_dict.items():
        cat_total = round(info["total"], 2)
        cat_count = info["count"]
        pct = round((cat_total / total) * 100, 1) if total > 0 else 0.0
        avg_val = round(cat_total / cat_count, 2) if cat_count > 0 else 0.0
        max_val = round(max(info["amounts"]), 2)
        min_val = round(min(info["amounts"]), 2)
        categories.append({
            "name": cat,
            "value": cat_total,
            "count": cat_count,
            "percent": pct,
            "avg": avg_val,
            "max": max_val,
            "min": min_val,
        })
    categories.sort(key=lambda x: x["value"], reverse=True)

    # ── 2. Monthly Trend ─────────────────────────────────────────────────────
    month_dict = {}
    for e in expenses:
        if not e.date:
            continue
        m_str = e.date.strftime("%Y-%m")
        if m_str not in month_dict:
            month_dict[m_str] = {"amount": 0.0, "count": 0}
        month_dict[m_str]["amount"] += e.amount
        month_dict[m_str]["count"] += 1

    sorted_months = sorted(month_dict.keys())
    monthly_trend = []
    for m in sorted_months:
        amt = round(month_dict[m]["amount"], 2)
        cnt = month_dict[m]["count"]
        dt = datetime.strptime(m, "%Y-%m")
        m_name = dt.strftime("%b %Y")
        monthly_trend.append({
            "month": m,
            "name": m_name,
            "amount": amt,
            "count": cnt,
            "avg": round(amt / cnt, 2) if cnt > 0 else 0.0,
        })

    # ── 3. Day of Week Breakdown ─────────────────────────────────────────────
    dow_dict = {i: {"amount": 0.0, "count": 0} for i in range(7)}
    for e in expenses:
        if not e.date:
            continue
        dow = e.date.weekday()  # 0=Monday, 6=Sunday
        dow_dict[dow]["amount"] += e.amount
        dow_dict[dow]["count"] += 1

    day_of_week = []
    for i in range(7):
        amt = round(dow_dict[i]["amount"], 2)
        cnt = dow_dict[i]["count"]
        day_of_week.append({
            "day": day_names[i],
            "day_num": i,
            "amount": amt,
            "count": cnt,
            "avg": round(amt / cnt, 2) if cnt > 0 else 0.0,
        })

    # ── 4. Daily Trend ───────────────────────────────────────────────────────
    daily_dict = {}
    for e in expenses:
        if not e.date:
            continue
        d_str = e.date.strftime("%Y-%m-%d")
        if d_str not in daily_dict:
            daily_dict[d_str] = {"amount": 0.0, "count": 0}
        daily_dict[d_str]["amount"] += e.amount
        daily_dict[d_str]["count"] += 1

    daily_trend = [
        {"date": d, "amount": round(info["amount"], 2), "count": info["count"]}
        for d, info in sorted(daily_dict.items())
    ]

    # ── 5. Summary KPIs ──────────────────────────────────────────────────────
    max_exp = max(expenses, key=lambda x: x.amount)
    max_transaction = {
        "amount": round(max_exp.amount, 2),
        "category": max_exp.category or "Other",
        "description": max_exp.description or "",
        "date": str(max_exp.date) if max_exp.date else "",
    }
    top_cat = categories[0] if categories else None
    top_category = (
        {"name": top_cat["name"], "amount": top_cat["value"], "percent": top_cat["percent"]}
        if top_cat
        else None
    )

    weekend_total = round(dow_dict[5]["amount"] + dow_dict[6]["amount"], 2)
    weekday_total = round(sum(dow_dict[i]["amount"] for i in range(5)), 2)
    weekend_percent = round((weekend_total / total) * 100, 1) if total > 0 else 0.0
    weekday_percent = round((weekday_total / total) * 100, 1) if total > 0 else 0.0
    active_days = len(daily_dict)
    daily_average = round(total / max(active_days, 1), 2)

    mom_change_pct = None
    if len(monthly_trend) >= 2:
        latest_m = monthly_trend[-1]["amount"]
        prev_m = monthly_trend[-2]["amount"]
        if prev_m > 0:
            mom_change_pct = round(((latest_m - prev_m) / prev_m) * 100, 1)

    summary = {
        "avg_transaction": round(total / count, 2) if count > 0 else 0.0,
        "max_transaction": max_transaction,
        "top_category": top_category,
        "weekend_total": weekend_total,
        "weekday_total": weekday_total,
        "weekend_percent": weekend_percent,
        "weekday_percent": weekday_percent,
        "active_days": active_days,
        "daily_average": daily_average,
        "mom_change_pct": mom_change_pct,
    }

    # ── 6. Automated Interpretations & AI Insights ───────────────────────────
    interpretations = []

    # A. Concentration analysis
    if categories:
        top_c = categories[0]
        if top_c["percent"] >= 40:
            interpretations.append({
                "type": "warning",
                "tag": "High Concentration",
                "title": f"Heavy Concentration in {top_c['name']}",
                "text": f"{top_c['name']} accounts for {top_c['percent']}% of your total spending. Consider creating targeted monthly limits for this category.",
            })
        else:
            interpretations.append({
                "type": "info",
                "tag": "Lead Outflow",
                "title": f"Top Expense: {top_c['name']}",
                "text": f"{top_c['name']} is your highest category ({top_c['percent']}% of spending across {top_c['count']} transactions).",
            })

        # Pareto check
        cum_pct = 0.0
        top_cats = []
        for c in categories:
            cum_pct += c["percent"]
            top_cats.append(c["name"])
            if cum_pct >= 70:
                break
        if len(top_cats) <= 2 and len(categories) >= 3:
            interpretations.append({
                "type": "tip",
                "tag": "Pareto 80/20 Rule",
                "title": "Primary Outflow Drivers",
                "text": f"Just {len(top_cats)} categories ({', '.join(top_cats)}) drive {round(cum_pct, 1)}% of your overall expenditures.",
            })

    # B. Weekend vs Weekday Rhythm
    if total > 0:
        weekend_daily_avg = weekend_total / 2.0
        weekday_daily_avg = weekday_total / 5.0
        if weekend_daily_avg > weekday_daily_avg * 1.25 and weekend_total > 0:
            ratio = round(weekend_daily_avg / max(weekday_daily_avg, 0.01), 1)
            interpretations.append({
                "type": "info",
                "tag": "Weekend Spike",
                "title": "Elevated Weekend Spending",
                "text": f"Your average daily spending on weekends is {ratio}x higher than weekdays. Peak outflows cluster around Saturday & Sunday.",
            })
        elif weekday_daily_avg > weekend_daily_avg * 1.25 and weekday_total > 0:
            interpretations.append({
                "type": "info",
                "tag": "Weekday Regular",
                "title": "Weekday Routine Driven",
                "text": f"{weekday_percent}% of expenses occur during Monday-Friday workdays, showing strong routine-driven spending patterns.",
            })

    # C. MoM Trend
    if mom_change_pct is not None:
        if mom_change_pct > 10:
            interpretations.append({
                "type": "warning",
                "tag": "Spending Surge",
                "title": "Month-over-Month Increase",
                "text": f"Expenditures this month are +{mom_change_pct}% higher than the prior month. Monitor discretionary categories closely.",
            })
        elif mom_change_pct < -10:
            interpretations.append({
                "type": "success",
                "tag": "Spend Reduction",
                "title": "Positive Budget Control",
                "text": f"Spending decreased by {abs(mom_change_pct)}% compared to last month. Excellent financial discipline!",
            })

    # D. Single Large Outlier
    if max_transaction and total > 0:
        single_share = round((max_transaction["amount"] / total) * 100, 1)
        if single_share >= 20 and count >= 3:
            interpretations.append({
                "type": "tip",
                "tag": "Key Outlier",
                "title": "Largest Single Expense",
                "text": f"A single expense of {max_transaction['amount']} in {max_transaction['category']} ('{max_transaction['description'] or 'Expense'}') made up {single_share}% of all spending.",
            })

    # ── 7. Raw Expenses for real-time frontend filtering ─────────────────────
    raw_expenses = [
        {
            "id": e.id,
            "amount": e.amount,
            "category": e.category or "Other",
            "description": e.description or "",
            "date": str(e.date) if e.date else "",
        }
        for e in expenses
    ]

    result = {
        "total": total,
        "count": count,
        "categories": categories,
        "monthly_trend": monthly_trend,
        "day_of_week": day_of_week,
        "daily_trend": daily_trend,
        "summary": summary,
        "interpretations": interpretations,
        "raw_expenses": raw_expenses,
    }

    # ── Populate cache ────────────────────────────────────────────────────────
    cache_set(key, result)

    return result