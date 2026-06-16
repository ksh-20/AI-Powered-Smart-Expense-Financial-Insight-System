import re

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