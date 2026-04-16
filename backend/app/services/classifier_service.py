from functools import lru_cache
from pathlib import Path
import logging
import time
from typing import Any

import joblib
import numpy as np

from app.core.config import settings


logger = logging.getLogger("classifier")


# -----------------------------
# CLASSIFIER SERVICE
# -----------------------------
class ClassifierService:

    def __init__(self, model_path: Path, encoder_path: Path) -> None:

        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        if not encoder_path.exists():
            raise FileNotFoundError(f"Encoder not found: {encoder_path}")

        self.model = joblib.load(model_path)
        self.encoder = joblib.load(encoder_path)

    # -----------------------------
    # PREDICTION CORE
    # -----------------------------
    def predict(self, text: str) -> dict[str, Any]:

        start = time.time()

        try:
            # -----------------------------
            # INPUT SAFETY
            # -----------------------------
            if not text or not text.strip():
                return {
                    "label": "unknown",
                    "confidence": 0.0,
                }

            text = text.strip()

            # -----------------------------
            # MODEL PREDICTION
            # -----------------------------
            prediction = self.model.predict([text])[0]
            label = self.encoder.inverse_transform([prediction])[0]

            confidence = 1.0

            # -----------------------------
            # PROBABILITY SCORE (IF AVAILABLE)
            # -----------------------------
            if hasattr(self.model, "predict_proba"):
                probabilities = self.model.predict_proba([text])[0]
                confidence = float(np.max(probabilities))

            duration = round(time.time() - start, 4)

            # -----------------------------
            # LOGGING (IMPORTANT FOR PRODUCTION)
            # -----------------------------
            logger.info(
                f"[CLASSIFIER] label={label} confidence={confidence} time={duration}s"
            )

            return {
                "label": str(label),
                "confidence": round(confidence, 4),
            }

        except Exception as e:
            logger.error(f"[CLASSIFIER ERROR] {str(e)}")

            # SAFE FALLBACK (CRITICAL FOR SYSTEM STABILITY)
            return {
                "label": "fallback",
                "confidence": 0.0,
            }


# -----------------------------
# PRIMARY MODEL
# -----------------------------
@lru_cache
def get_primary_classifier() -> ClassifierService:
    return ClassifierService(
        model_path=settings.primary_classifier_model_path,
        encoder_path=settings.primary_label_encoder_path,
    )


# -----------------------------
# BINARY MODEL
# -----------------------------
@lru_cache
def get_binary_classifier() -> ClassifierService:
    return ClassifierService(
        model_path=settings.binary_classifier_model_path,
        encoder_path=settings.binary_label_encoder_path,
    )


# -----------------------------
# TERTIARY MODEL
# -----------------------------
@lru_cache
def get_tertiary_classifier() -> ClassifierService:
    return ClassifierService(
        model_path=settings.tertiary_classifier_model_path,
        encoder_path=settings.tertiary_label_encoder_path,
    )
