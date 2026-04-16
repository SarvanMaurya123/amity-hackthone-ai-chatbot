from datetime import datetime, timezone

from app.db.mongodb import get_database


class EmotionalMemoryRepository:
    @staticmethod
    def get_collection():
        return get_database()["emotional_memories"]

    @staticmethod
    def find_by_user_id(user_id: str) -> dict | None:
        return EmotionalMemoryRepository.get_collection().find_one({"user_id": user_id})

    @staticmethod
    def upsert_user_memory(
        *,
        user_id: str,
        snapshot: dict,
        summary: dict,
    ) -> dict:
        now = datetime.now(timezone.utc)
        EmotionalMemoryRepository.get_collection().update_one(
            {"user_id": user_id},
            {
                "$push": {
                    "recent_snapshots": {
                        "$each": [snapshot],
                        "$slice": -12,
                    }
                },
                "$set": {
                    "summary": summary,
                    "updated_at": now,
                },
                "$setOnInsert": {
                    "user_id": user_id,
                    "created_at": now,
                },
            },
            upsert=True,
        )
        return EmotionalMemoryRepository.find_by_user_id(user_id) or {}
