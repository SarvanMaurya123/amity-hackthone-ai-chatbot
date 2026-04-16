from datetime import datetime, timezone
from bson import ObjectId
import logging
from typing import Any
from uuid import uuid4

from app.db.mongodb import get_database


logger = logging.getLogger("conversation_repository")


# -----------------------------
# REPOSITORY
# -----------------------------
class ConversationRepository:

    @staticmethod
    def get_collection():
        return get_database()["conversations"]

    # -----------------------------
    # CREATE CONVERSATION
    # -----------------------------
    @staticmethod
    def create_conversation(*, user_id: str, title: str) -> dict:

        now = datetime.now(timezone.utc)

        document = {
            "user_id": user_id,
            "title": title,
            "messages": [],
            "pinned": False,
            "created_at": now,
            "updated_at": now,
        }

        try:
            result = ConversationRepository.get_collection().insert_one(document)
            document["id"] = str(result.inserted_id)

            logger.info(f"[CONV CREATED] user={user_id}")

            return document

        except Exception as e:
            logger.error(f"[CREATE ERROR] {str(e)}")
            raise

    # -----------------------------
    # LIST CONVERSATIONS (OPTIMIZED)
    # -----------------------------
    @staticmethod
    def list_conversations(user_id: str, limit: int = 50, skip: int = 0) -> list[dict]:

        try:
            cursor = (
                ConversationRepository.get_collection()
                .find({"user_id": user_id})
                .sort([("pinned", -1), ("updated_at", -1)])
                .skip(skip)
                .limit(limit)
            )

            return [ConversationRepository._serialize(doc) for doc in cursor]

        except Exception as e:
            logger.error(f"[LIST ERROR] {str(e)}")
            return []

    # -----------------------------
    # FIND BY ID
    # -----------------------------
    @staticmethod
    def find_by_id(*, user_id: str, conversation_id: str) -> dict | None:

        if not ObjectId.is_valid(conversation_id):
            return None

        try:
            document = ConversationRepository.get_collection().find_one(
                {"_id": ObjectId(conversation_id), "user_id": user_id}
            )

            return ConversationRepository._serialize(document)

        except Exception as e:
            logger.error(f"[FIND ERROR] {str(e)}")
            return None

    # -----------------------------
    # UPDATE CONVERSATION
    # -----------------------------
    @staticmethod
    def update_conversation(
        *,
        user_id: str,
        conversation_id: str,
        fields: dict
    ) -> dict | None:

        if not ObjectId.is_valid(conversation_id):
            return None

        try:
            update_fields = {
                **fields,
                "updated_at": datetime.now(timezone.utc)
            }

            ConversationRepository.get_collection().update_one(
                {"_id": ObjectId(conversation_id), "user_id": user_id},
                {"$set": update_fields},
            )

            return ConversationRepository.find_by_id(
                user_id=user_id,
                conversation_id=conversation_id
            )

        except Exception as e:
            logger.error(f"[UPDATE ERROR] {str(e)}")
            return None

    # -----------------------------
    # ADD MESSAGE (SAFE + CONTROLLED)
    # -----------------------------
    @staticmethod
    def add_message(
        *,
        user_id: str,
        conversation_id: str,
        role: str,
        content: str,
        is_streaming: bool,
        metadata: dict | None = None,
    ) -> dict | None:

        if not ObjectId.is_valid(conversation_id):
            return None

        try:
            message = {
                "id": uuid4().hex,
                "role": role,
                "content": content[:5000],  # safety limit
                "timestamp": datetime.now(timezone.utc),
                "is_streaming": is_streaming,
                "metadata": metadata or {},
            }

            existing = ConversationRepository.get_collection().find_one(
                {"_id": ObjectId(conversation_id), "user_id": user_id},
                {"messages": 1},
            )
            if not existing:
                return None

            update_ops: dict[str, Any] = {
                "$push": {
                    "messages": {
                        "$each": [message],
                        "$slice": -200,   # keep last 200 messages only
                    }
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc)
                },
            }

            # auto-title only for first user message
            if role == "user" and not existing.get("messages"):
                update_ops["$set"]["title"] = (
                    content[:60] + ("..." if len(content) > 60 else "")
                )

            ConversationRepository.get_collection().update_one(
                {"_id": ObjectId(conversation_id), "user_id": user_id},
                update_ops,
            )

            return ConversationRepository.find_by_id(
                user_id=user_id,
                conversation_id=conversation_id
            )

        except Exception as e:
            logger.error(f"[ADD MESSAGE ERROR] {str(e)}")
            return None

    # -----------------------------
    # DELETE SINGLE
    # -----------------------------
    @staticmethod
    def delete_conversation(*, user_id: str, conversation_id: str) -> bool:

        if not ObjectId.is_valid(conversation_id):
            return False

        try:
            result = ConversationRepository.get_collection().delete_one(
                {"_id": ObjectId(conversation_id), "user_id": user_id}
            )

            return result.deleted_count > 0

        except Exception as e:
            logger.error(f"[DELETE ERROR] {str(e)}")
            return False

    # -----------------------------
    # DELETE ALL
    # -----------------------------
    @staticmethod
    def delete_all_conversations(*, user_id: str) -> int:

        try:
            result = ConversationRepository.get_collection().delete_many(
                {"user_id": user_id}
            )

            return result.deleted_count

        except Exception as e:
            logger.error(f"[DELETE ALL ERROR] {str(e)}")
            return 0

    # -----------------------------
    # SERIALIZER (SAFE)
    # -----------------------------
    @staticmethod
    def _serialize(document: dict | None) -> dict | None:

        if not document:
            return None

        document["id"] = str(document.pop("_id"))
        return document
