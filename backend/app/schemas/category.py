from pydantic import BaseModel


class CategorySuggestOut(BaseModel):
    category: str
    confidence: str     # "high" | "medium" | "low"
    source: str         # "learned" | "keyword" | "fallback"
