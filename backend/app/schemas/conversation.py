from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ConversationMessageCreate(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=12000)
    is_streaming: bool = False


class ConversationMessage(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime
    is_streaming: bool = False
    metadata: dict[str, Any] | None = None


class ConversationCreate(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=120)


class ConversationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    pinned: bool | None = None


class ConversationResponse(BaseModel):
    id: str
    title: str
    messages: list[ConversationMessage]
    created_at: datetime
    updated_at: datetime
    pinned: bool = False


class ConversationListResponse(BaseModel):
    conversations: list[ConversationResponse]
