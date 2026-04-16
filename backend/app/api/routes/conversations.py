from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies.auth import get_current_user
from app.schemas.auth import UserPublic
from app.schemas.conversation import (
    ConversationCreate,
    ConversationListResponse,
    ConversationMessageCreate,
    ConversationResponse,
    ConversationUpdate,
)
from app.services.conversation_service import ConversationNotFoundError, ConversationService

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=ConversationListResponse)
def list_conversations(current_user: UserPublic = Depends(get_current_user)) -> ConversationListResponse:
    return ConversationService.list_for_user(current_user.id)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate,
    current_user: UserPublic = Depends(get_current_user),
) -> ConversationResponse:
    return ConversationService.create_for_user(current_user.id, payload)


@router.patch("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    current_user: UserPublic = Depends(get_current_user),
) -> ConversationResponse:
    try:
        return ConversationService.update_for_user(current_user.id, conversation_id, payload)
    except ConversationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{conversation_id}/messages", response_model=ConversationResponse)
def add_message(
    conversation_id: str,
    payload: ConversationMessageCreate,
    current_user: UserPublic = Depends(get_current_user),
) -> ConversationResponse:
    try:
        return ConversationService.add_message_for_user(current_user.id, conversation_id, payload)
    except ConversationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    current_user: UserPublic = Depends(get_current_user),
) -> Response:
    try:
        ConversationService.delete_for_user(current_user.id, conversation_id)
    except ConversationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_conversations(current_user: UserPublic = Depends(get_current_user)) -> Response:
    ConversationService.clear_for_user(current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
