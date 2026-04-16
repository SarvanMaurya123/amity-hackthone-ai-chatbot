from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.conversation import ConversationResponse


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: str | None = Field(default=None, max_length=120)


class ModelPrediction(BaseModel):
    label: str
    confidence: float


class ChatResponse(BaseModel):
    reply: str
    answer: str
    source: Literal["pkl_model", "llm", "rule_based"]
    language: str
    detected_language: str
    language_style: str
    primary_prediction: ModelPrediction
    secondary_prediction: ModelPrediction | None = None
    tertiary_prediction: ModelPrediction | None = None
    model_used: str
    used_fallback: bool = False
    conversation: ConversationResponse
