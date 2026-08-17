import re
from typing import Optional

# Keyword → category mapping (case-insensitive)
CATEGORY_KEYWORDS = {
    "Food & Dining": [
        "restaurant", "cafe", "coffee", "food", "dining", "eat", "pizza",
        "burger", "swiggy", "zomato", "dominos", "kfc", "mcdonalds", "hotel",
        "biryani", "dhaba", "canteen", "mess", "snack", "bakery", "juice",
    ],
    "Transport": [
        "uber", "ola", "taxi", "cab", "auto", "bus", "metro", "train",
        "flight", "airline", "petrol", "diesel", "fuel", "toll", "parking",
        "rapido", "irctc", "railway", "transport",
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa", "snapdeal",
        "mall", "shop", "store", "purchase", "buy", "order", "retail",
        "clothes", "shirt", "shoes", "fashion",
    ],
    "Entertainment": [
        "netflix", "prime", "hotstar", "spotify", "youtube", "cinema",
        "movie", "theatre", "game", "gaming", "subscription", "entertainment",
        "disney", "zee5", "sony",
    ],
    "Healthcare": [
        "hospital", "clinic", "doctor", "medical", "pharmacy", "medicine",
        "health", "apollo", "pharma", "lab", "diagnostic", "test", "insurance",
    ],
    "Utilities": [
        "electricity", "water", "gas", "wifi", "internet", "broadband",
        "mobile", "recharge", "bill", "utility", "jio", "airtel", "bsnl",
        "vodafone", "vi ", "postpaid", "prepaid",
    ],
    "Education": [
        "school", "college", "university", "course", "tuition", "fee",
        "book", "library", "exam", "udemy", "coursera", "education",
    ],
    "Travel": [
        "hotel", "resort", "travel", "trip", "vacation", "holiday",
        "booking", "makemytrip", "goibibo", "yatra", "oyo", "airbnb",
    ],
    "Groceries": [
        "grocery", "grocer", "supermarket", "bigbasket", "blinkit", "zepto",
        "dmart", "reliance", "more ", "vegetables", "fruits", "milk",
    ],
}


def predict_category(description: str) -> str:
    """
    Predict expense category from description using keyword matching.
    Falls back to 'Other' if no keyword matches.
    """
    if not description:
        return "Other"

    text = description.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw.strip()) + r"\b", text):
                return category

    return "Other"


def predict_category_with_learning(
    description: str, db, user_id: int
) -> dict:
    """
    Enhanced prediction that first checks the user's learned rules,
    then falls back to global keyword matching.

    Returns:
        dict with keys: category, confidence, source
            source: "learned" | "keyword" | "fallback"
    """
    if not description:
        return {"category": "Other", "confidence": "low", "source": "fallback"}

    from app.models.category_rule import CategoryRule

    text = description.lower().strip()

    # 1. Check user-learned rules — prefer rules with more usage (higher confidence)
    rules = (
        db.query(CategoryRule)
        .filter(CategoryRule.user_id == user_id)
        .order_by(CategoryRule.times_used.desc())
        .all()
    )

    best_match: Optional[CategoryRule] = None
    for rule in rules:
        kw = rule.keyword.lower().strip()
        # substring match on the learned keyword within the new description
        if kw and kw in text:
            best_match = rule
            break

    if best_match:
        confidence = "high" if best_match.times_used >= 3 else "medium"
        return {
            "category": best_match.category,
            "confidence": confidence,
            "source": "learned",
        }

    # 2. Fall back to global keyword matching
    category = predict_category(description)
    if category != "Other":
        return {"category": category, "confidence": "medium", "source": "keyword"}

    return {"category": "Other", "confidence": "low", "source": "fallback"}


def learn_from_expense(description: str, category: str, db, user_id: int) -> None:
    """
    Store or reinforce a description→category mapping for this user.
    Called automatically whenever an expense is created or updated.
    """
    if not description or not category or category == "Other":
        return

    from app.models.category_rule import CategoryRule
    from sqlalchemy.sql import func as sqlfunc

    keyword = description.lower().strip()

    existing = (
        db.query(CategoryRule)
        .filter(
            CategoryRule.user_id == user_id,
            CategoryRule.keyword == keyword,
        )
        .first()
    )

    if existing:
        existing.category = category   # update in case user corrected it
        existing.times_used += 1
        existing.last_used_at = sqlfunc.now()
    else:
        rule = CategoryRule(user_id=user_id, keyword=keyword, category=category)
        db.add(rule)

    db.commit()