import pandas as pd
from PyPDF2 import PdfReader

def parse_csv(path):
    return pd.read_csv(path)

def parse_pdf(path):

    reader=PdfReader(path)

    text=""

    for page in reader.pages:
        text+=page.extract_text()

    return text