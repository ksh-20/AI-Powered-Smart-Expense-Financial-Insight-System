def financial_chat(message:str):
    msg=message.lower()

    if "save" in msg:
        return "Track recurring subscriptions and set monthly budgets."

    if "invest" in msg:
        return "Consider SIPs and diversified index funds."

    return "Monitor category-wise expenses regularly."