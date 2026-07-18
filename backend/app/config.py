# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL:str
    SECRET_KEY:str
    ALGORITHM:str="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:int=1440

    GEMINI_API_KEY:str
    CELERY_BROKER_URL:str="redis://localhost:6379/0"
    REDIS_URL:str="redis://localhost:6379/1"       # Separate DB index for cache
    CACHE_TTL_SECONDS:int=300                       # 5-minute default TTL

    class Config:
        env_file=".env"

settings=Settings()