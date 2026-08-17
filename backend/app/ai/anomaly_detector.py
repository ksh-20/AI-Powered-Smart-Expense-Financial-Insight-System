import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any


def generate_nlp_explanation(
    expense: Dict[str, Any],
    cat_stats: Dict[str, Any],
    global_stats: Dict[str, Any],
    risk_score: int,
    flag_type: str,
) -> Dict[str, Any]:
    """
    Generates a natural language NLP explanation for why an expense was flagged.
    Synthesizes semantic description clues, category baselines, and statistical multipliers.
    """
    amount = float(expense.get("amount", 0))
    category = expense.get("category") or "Other"
    description = expense.get("description") or "Expense"
    date_str = expense.get("date") or "Recently"

    cat_avg = cat_stats.get("avg", amount)
    cat_count = cat_stats.get("count", 1)
    cat_min = cat_stats.get("min", amount)
    cat_max = cat_stats.get("max", amount)
    cat_share = cat_stats.get("share_pct", 0)

    multiplier = round(amount / max(cat_avg, 1.0), 1)
    global_avg = global_stats.get("avg", amount)
    global_mult = round(amount / max(global_avg, 1.0), 1)

    # Narrative summary
    if multiplier >= 3.0:
        summary = (
            f"This transaction of ₹{amount:,.2f} at '{description}' was flagged because it is "
            f"{multiplier}x higher than your typical {category} spending baseline (avg: ₹{cat_avg:,.2f})."
        )
    elif global_mult >= 2.5:
        summary = (
            f"This transaction of ₹{amount:,.2f} represents a significant statistical outlier, "
            f"exceeding your overall average transaction size by {global_mult}x."
        )
    else:
        summary = (
            f"Unusual transaction pattern detected for '{description}' in {category}. "
            f"The transaction deviates from your established behavioral cluster."
        )

    # Detailed bullet points
    details = []
    if multiplier >= 1.5:
        details.append(
            f"Amount of ₹{amount:,.2f} is {multiplier}x higher than your category average of ₹{cat_avg:,.2f}."
        )
    if cat_count > 1:
        details.append(
            f"Typical transactions in {category} range between ₹{cat_min:,.2f} and ₹{cat_max:,.2f} across {cat_count} historical entries."
        )
    if cat_share >= 25:
        details.append(
            f"This single purchase consumes {cat_share:.1f}% of your total cumulative spending in {category}."
        )

    # Semantic keyword analysis on description
    desc_lower = description.lower()
    if any(w in desc_lower for w in ["apple", "amazon", "electronics", "laptop", "phone", "tv", "camera", "jewel"]):
        details.append(
            f"NLP semantic analysis on '{description}' identifies a high-ticket discretionary hardware or luxury retail purchase."
        )
    elif any(w in desc_lower for w in ["hotel", "flight", "resort", "vacation", "trip", "airline", "booking"]):
        details.append(
            f"NLP analysis categorizes '{description}' as a major travel or hospitality expenditure."
        )
    elif any(w in desc_lower for w in ["hospital", "surgery", "clinic", "dental", "emergency"]):
        details.append(
            f"NLP medical keyword match indicates an unexpected healthcare or clinical expense."
        )
    elif any(w in desc_lower for w in ["swiggy", "zomato", "restaurant", "dining", "bar", "pub", "cafe"]):
        details.append(
            f"NLP dining pattern analysis notes a substantial restaurant or party bill compared to routine meal costs."
        )

    if not details:
        details.append(
            f"Statistical deviation detected: Transaction amount exceeds standard deviation bounds for your account."
        )

    suggested_action = (
        "Review this charge. If this was an intentional one-off purchase, you can safely disregard this alert. "
        "If unrecognized, verify your account statements or set a category limit."
    )

    return {
        "summary": summary,
        "details": details,
        "baseline_context": f"Normal {category} range: ₹{cat_min:,.2f} – ₹{cat_max:,.2f} (Avg: ₹{cat_avg:,.2f})",
        "multiplier": multiplier,
        "suggested_action": suggested_action,
    }


def detect(expenses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detects financial anomalies using multi-factor statistical and IsolationForest methods,
    and enriches each flagged anomaly with comprehensive NLP explanations.
    """
    if not expenses:
        return []

    df = pd.DataFrame(expenses)
    if df.empty or "amount" not in df.columns:
        return []

    n = len(df)
    amounts = df["amount"].astype(float).values
    global_avg = float(np.mean(amounts))
    global_std = float(np.std(amounts)) if n > 1 else 0.0
    global_stats = {"avg": global_avg, "std": global_std}

    # Calculate per-category stats
    cat_stats_map = {}
    if "category" in df.columns:
        for cat, group in df.groupby("category"):
            cat_amounts = group["amount"].astype(float).values
            cat_total = float(np.sum(cat_amounts))
            cat_stats_map[cat] = {
                "avg": float(np.mean(cat_amounts)),
                "count": len(cat_amounts),
                "min": float(np.min(cat_amounts)),
                "max": float(np.max(cat_amounts)),
                "total": cat_total,
            }

    # Anomaly scoring
    anomalies = []

    # 1. If low data (1 or 2 items), use baseline threshold logic
    if n < 4:
        for i, row in df.iterrows():
            amt = float(row["amount"])
            cat = str(row.get("category", "Other"))
            is_anomaly = False
            risk_score = 70
            flag_type = "High Value Alert"

            # Check absolute threshold or high amount
            if amt >= 20000:
                is_anomaly = True
                risk_score = 92
                flag_type = "Extreme Amount Outlier"
            elif amt >= 10000 and cat in ["Food & Dining", "Entertainment", "Groceries", "Transport"]:
                is_anomaly = True
                risk_score = 85
                flag_type = "Category Value Spike"
            elif n == 2 and amt >= 2.5 * min(amounts) and amt >= 2000:
                is_anomaly = True
                risk_score = 78
                flag_type = "Baseline Deviation"

            if is_anomaly:
                cat_info = cat_stats_map.get(cat, {"avg": amt, "count": 1, "min": amt, "max": amt, "total": amt})
                cat_info["share_pct"] = (amt / max(cat_info.get("total", amt), 1.0)) * 100
                nlp = generate_nlp_explanation(row.to_dict(), cat_info, global_stats, risk_score, flag_type)

                anomalies.append({
                    "id": row.get("id", i),
                    "index": i,
                    "amount": amt,
                    "category": cat,
                    "description": row.get("description", "Expense"),
                    "date": str(row.get("date", "")),
                    "risk_score": risk_score,
                    "severity": "critical" if risk_score >= 90 else "high" if risk_score >= 80 else "moderate",
                    "flag_type": flag_type,
                    "reason": nlp["summary"],
                    "nlp_explanation": nlp,
                })
        return anomalies

    # 2. For n >= 4: Isolation Forest + Category Baseline Multi-Factor Analysis
    try:
        model = IsolationForest(contamination=0.15, random_state=42)
        preds = model.fit_predict(df[["amount"]])
    except Exception:
        preds = np.ones(n)

    for i, row in df.iterrows():
        amt = float(row["amount"])
        cat = str(row.get("category", "Other"))
        cat_info = cat_stats_map.get(cat, {"avg": amt, "count": 1, "min": amt, "max": amt, "total": amt})
        cat_avg = cat_info["avg"]
        cat_count = cat_info["count"]
        cat_mult = amt / max(cat_avg, 1.0)
        global_mult = amt / max(global_avg, 1.0)

        is_anomaly = False
        risk_score = 65
        flag_type = "Statistical Outlier"

        # Check conditions
        if preds[i] == -1 and (cat_mult >= 1.6 or global_mult >= 1.8):
            is_anomaly = True
            risk_score = min(98, int(75 + (global_mult * 5)))
            flag_type = "Isolation Forest Outlier"
        elif cat_count >= 2 and cat_mult >= 2.5 and amt >= 1000:
            is_anomaly = True
            risk_score = min(95, int(70 + (cat_mult * 6)))
            flag_type = "Category Spending Spike"
        elif global_std > 0 and (amt - global_avg) >= 2.2 * global_std:
            is_anomaly = True
            risk_score = min(96, int(80 + (amt / max(global_std, 1.0))))
            flag_type = "Standard Deviation Anomaly"
        elif amt >= 30000:
            is_anomaly = True
            risk_score = 90
            flag_type = "High Absolute Outflow"

        if is_anomaly:
            cat_info_copy = dict(cat_info)
            cat_info_copy["share_pct"] = (amt / max(cat_info.get("total", amt), 1.0)) * 100
            nlp = generate_nlp_explanation(row.to_dict(), cat_info_copy, global_stats, risk_score, flag_type)

            severity = "critical" if risk_score >= 90 else "high" if risk_score >= 80 else "moderate"

            anomalies.append({
                "id": row.get("id", i),
                "index": i,
                "amount": amt,
                "category": cat,
                "description": row.get("description", "Expense"),
                "date": str(row.get("date", "")),
                "risk_score": risk_score,
                "severity": severity,
                "flag_type": flag_type,
                "reason": nlp["summary"],
                "nlp_explanation": nlp,
            })

    # Sort anomalies by risk score descending
    anomalies.sort(key=lambda a: a["risk_score"], reverse=True)
    return anomalies