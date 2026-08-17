from pydantic import BaseModel
from typing import List

class CategoryData(BaseModel):
    name:str
    value:float

class AnalyticsResponse(BaseModel):
    total:float
    categories:List[CategoryData]