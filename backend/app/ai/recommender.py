def generate_recommendations(total,category_data):
    rec=[]

    if total>50000:
        rec.append("High monthly spending detected.")

    for c,v in category_data.items():
        if v>10000:
            rec.append(f"Reduce spending on {c}")

    return rec