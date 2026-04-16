from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app_name: str
    mongodb_connected: bool
    api_prefix: str


class ChatHealthResponse(BaseModel):
    status: str
    primary_model_ready: bool
    llm_configured: bool
