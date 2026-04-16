from app.repositories.conversation_repository import ConversationRepository
from app.schemas.conversation import (
    ConversationCreate,
    ConversationListResponse,
    ConversationMessageCreate,
    ConversationResponse,
    ConversationUpdate,
)


class ConversationNotFoundError(Exception):
    pass


class ConversationService:
    @staticmethod
    def list_for_user(user_id: str) -> ConversationListResponse:
        conversations = ConversationRepository.list_conversations(user_id)
        return ConversationListResponse(
            conversations=[ConversationResponse(**conversation) for conversation in conversations]
        )

    @staticmethod
    def create_for_user(user_id: str, payload: ConversationCreate) -> ConversationResponse:
        conversation = ConversationRepository.create_conversation(user_id=user_id, title=payload.title)
        return ConversationResponse(**conversation)

    @staticmethod
    def update_for_user(user_id: str, conversation_id: str, payload: ConversationUpdate) -> ConversationResponse:
        fields = payload.model_dump(exclude_none=True)
        conversation = ConversationRepository.update_conversation(
            user_id=user_id,
            conversation_id=conversation_id,
            fields=fields,
        )
        if not conversation:
            raise ConversationNotFoundError("Conversation not found")
        return ConversationResponse(**conversation)

    @staticmethod
    def add_message_for_user(
        user_id: str,
        conversation_id: str,
        payload: ConversationMessageCreate,
        metadata: dict | None = None,
    ) -> ConversationResponse:
        conversation = ConversationRepository.add_message(
            user_id=user_id,
            conversation_id=conversation_id,
            role=payload.role,
            content=payload.content,
            is_streaming=payload.is_streaming,
            metadata=metadata,
        )
        if not conversation:
            raise ConversationNotFoundError("Conversation not found")
        return ConversationResponse(**conversation)

    @staticmethod
    def get_for_user(user_id: str, conversation_id: str) -> ConversationResponse:
        conversation = ConversationRepository.find_by_id(
            user_id=user_id,
            conversation_id=conversation_id,
        )
        if not conversation:
            raise ConversationNotFoundError("Conversation not found")
        return ConversationResponse(**conversation)

    @staticmethod
    def delete_for_user(user_id: str, conversation_id: str) -> None:
        deleted = ConversationRepository.delete_conversation(
            user_id=user_id,
            conversation_id=conversation_id,
        )
        if not deleted:
            raise ConversationNotFoundError("Conversation not found")

    @staticmethod
    def clear_for_user(user_id: str) -> int:
        return ConversationRepository.delete_all_conversations(user_id=user_id)
