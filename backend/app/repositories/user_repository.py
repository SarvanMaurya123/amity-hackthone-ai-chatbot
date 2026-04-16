from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_users_collection


class UserRepository:
    @staticmethod
    def get_collection():
        return get_users_collection()

    @staticmethod
    def create_user(
        *,
        email: str,
        full_name: str,
        organization: str | None,
        password_hash: str,
    ) -> dict[str, Any]:
        document = {
            "email": email.lower().strip(),
            "full_name": full_name,
            "organization": organization,
            "password_hash": password_hash,
            "preferences": {
                "calm_theme": True,
                "annotation_sounds": True,
                "auto_save_review_sessions": True,
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        try:
            result = UserRepository.get_collection().insert_one(document)
        except DuplicateKeyError as exc:
            raise ValueError("Email already exists") from exc

        return UserRepository._serialize({**document, "_id": result.inserted_id}) or {}

    @staticmethod
    def find_by_email(email: str) -> dict[str, Any] | None:
        document = UserRepository.get_collection().find_one({"email": email.lower().strip()})
        return UserRepository._serialize(document)

    @staticmethod
    def find_by_id(user_id: str) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None

        document = UserRepository.get_collection().find_one({"_id": ObjectId(user_id)})
        return UserRepository._serialize(document)

    @staticmethod
    def update_user(*, user_id: str, fields: dict[str, Any]) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None

        UserRepository.get_collection().update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    **fields,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return UserRepository.find_by_id(user_id)

    @staticmethod
    def update_nested_fields(*, user_id: str, prefix: str, fields: dict[str, Any]) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None

        update_fields = {f"{prefix}.{key}": value for key, value in fields.items()}
        UserRepository.get_collection().update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    **update_fields,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return UserRepository.find_by_id(user_id)

    @staticmethod
    def _serialize(document: dict[str, Any] | None) -> dict[str, Any] | None:
        if not document:
            return None

        serialized = {**document}
        serialized["id"] = str(document["_id"])
        serialized.pop("_id", None)
        return serialized
