from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.api.dependencies.auth import get_current_user
from app.core.config import settings
from app.schemas.auth import UserPublic
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.health import ChatHealthResponse
from app.services.chat_service import get_chat_service

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger("chat_api")


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def create_chat_response(
    payload: ChatRequest,
    current_user: UserPublic = Depends(get_current_user),
) -> ChatResponse:
    try:
        service = get_chat_service()
        return service.generate_reply(
            user_id=current_user.id,
            message=payload.message.strip(),
            conversation_id=payload.conversation_id,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to generate AI response")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI response",
        ) from exc


@router.get("/health", response_model=ChatHealthResponse, status_code=status.HTTP_200_OK)
def chat_health(_: UserPublic = Depends(get_current_user)) -> ChatHealthResponse:
    return ChatHealthResponse(
        status="ok",
        primary_model_ready=True,
        llm_configured=settings.has_valid_mistral_api_key,
    )
