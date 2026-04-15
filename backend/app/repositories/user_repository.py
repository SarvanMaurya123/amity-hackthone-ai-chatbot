from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_users_collection


class UserRepository:
    @staticmethod
    def create_user(*, email: str, full_name: str, organization: str | None, password_hash: str) -> dict:
        document = {
            "email": email.lower(),
            "full_name": full_name,
            "organization": organization,
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        try:
            result = get_users_collection().insert_one(document)
        except DuplicateKeyError as exc:
            raise ValueError("An account with this email already exists") from exc

        document["id"] = str(result.inserted_id)
        return document

    @staticmethod
    def find_by_email(email: str) -> dict | None:
        document = get_users_collection().find_one({"email": email.lower()})
        return UserRepository._serialize(document)

    @staticmethod
    def find_by_id(user_id: str) -> dict | None:
        if not ObjectId.is_valid(user_id):
            return None
        document = get_users_collection().find_one({"_id": ObjectId(user_id)})
        return UserRepository._serialize(document)

    @staticmethod
    def _serialize(document: dict | None) -> dict | None:
        if document is None:
            return None
        document["id"] = str(document.pop("_id"))
        return document
