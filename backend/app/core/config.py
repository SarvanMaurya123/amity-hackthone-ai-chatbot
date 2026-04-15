from functools import lru_cache
from os import getenv
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Settings:
    app_name: str = getenv("APP_NAME", "MindSupport Auth API")
    api_v1_prefix: str = getenv("API_V1_PREFIX", "/api/v1")
    mongo_url: str = getenv("MONGO_URL", "mongodb://localhost:27017")
    mongo_db_name: str = getenv("MONGO_DB_NAME", "mindsupport")
    jwt_secret_key: str = getenv("JWT_SECRET_KEY", "change-me-in-production")
    jwt_algorithm: str = getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    cors_origins: list[str] = [
        origin.strip()
        for origin in getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
