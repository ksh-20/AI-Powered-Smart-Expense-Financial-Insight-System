from app.ai.anomaly_detector import detect

def detect_anomalies(expenses):
    data=[{"amount":e.amount} for e in expenses]
    return detect(data)