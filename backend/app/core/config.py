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
    mistral_api_key: str = getenv("MISTRAL_API_KEY", "")
    llm_model_name: str = getenv("LLM_MODEL_NAME", "mistral-small-latest")
    primary_classifier_model_path: Path = BASE_DIR / getenv(
        "PRIMARY_CLASSIFIER_MODEL_PATH", "models/production_mental_health_model.pkl"
    )
    primary_label_encoder_path: Path = BASE_DIR / getenv(
        "PRIMARY_LABEL_ENCODER_PATH", "models/production_label_encoder.joblib"
    )
    binary_classifier_model_path: Path = BASE_DIR / getenv(
        "BINARY_CLASSIFIER_MODEL_PATH", "models/binary_conversation_classifier.pkl"
    )
    binary_label_encoder_path: Path = BASE_DIR / getenv(
        "BINARY_LABEL_ENCODER_PATH", "models/binary_encoder.joblib"
    )
    tertiary_classifier_model_path: Path = BASE_DIR / getenv(
        "TERTIARY_CLASSIFIER_MODEL_PATH", "models/multiclass_all_labels_classifier.pkl"
    )
    tertiary_label_encoder_path: Path = BASE_DIR / getenv(
        "TERTIARY_LABEL_ENCODER_PATH", "models/multiclass_encoder.joblib"
    )

    @property
    def has_valid_mistral_api_key(self) -> bool:
        key = self.mistral_api_key.strip()
        if not key:
            return False
        invalid_placeholders = {
            "your-mistral-api-key",
            "replace-with-your-mistral-api-key",
            "your_api_key_here",
        }
        return key.lower() not in invalid_placeholders


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
