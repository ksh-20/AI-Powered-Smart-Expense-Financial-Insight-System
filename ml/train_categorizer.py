import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB
import joblib

df=pd.read_csv("sample_data/expenses.csv")

model=Pipeline([
    ("tfidf",TfidfVectorizer()),
    ("clf",MultinomialNB())
])

model.fit(df["description"],df["category"])

joblib.dump(model,"saved_models/categorizer.pkl")

print("Model trained")