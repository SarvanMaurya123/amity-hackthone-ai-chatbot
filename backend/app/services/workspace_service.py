import logging
from typing import Any

from app.repositories.conversation_repository import ConversationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.workspace import (
    WorkspaceInfoItem,
    WorkspacePreferences,
    WorkspacePreferencesUpdate,
    WorkspaceProfile,
    WorkspaceProfileUpdate,
    WorkspaceResource,
    WorkspaceResponse,
    WorkspaceStats,
)

logger = logging.getLogger("workspace")


# -----------------------------
# STATS CALCULATOR (SEPARATION OF CONCERN)
# -----------------------------
class WorkspaceStatsCalculator:

    @staticmethod
    def calculate(conversations: list[dict]) -> WorkspaceStats:

        total_messages = sum(len(c.get("messages", [])) for c in conversations)
        pinned_sessions = sum(1 for c in conversations if c.get("pinned"))

        storage_usage = max(1, (total_messages * 2) // 10)

        return WorkspaceStats(
            saved_sessions=len(conversations),
            reviewed_messages=total_messages,
            pinned_sessions=pinned_sessions,
            storage_usage=f"{storage_usage} MB",
        )


# -----------------------------
# WORKSPACE SERVICE
# -----------------------------
class WorkspaceService:

    # -----------------------------
    # GET WORKSPACE DASHBOARD
    # -----------------------------
    @staticmethod
    def get_workspace(user_id: str) -> WorkspaceResponse:

        try:
            user = UserRepository.find_by_id(user_id)

            if not user:
                raise ValueError("User not found")

            conversations = ConversationRepository.list_conversations(user_id)

            stats = WorkspaceStatsCalculator.calculate(conversations)

            preferences = WorkspacePreferences(
                calm_theme=user.get("preferences", {}).get("calm_theme", True),
                annotation_sounds=user.get("preferences", {}).get("annotation_sounds", True),
                auto_save_review_sessions=user.get("preferences", {}).get(
                    "auto_save_review_sessions", True
                ),
            )

            logger.info(f"[WORKSPACE] user={user_id} sessions={len(conversations)}")

            return WorkspaceResponse(
                profile=WorkspaceProfile(
                    full_name=user["full_name"],
                    email=user["email"],
                    organization=user.get("organization"),
                ),
                preferences=preferences,
                stats=stats,
                account_items=WorkspaceService._build_account_items(user),
                privacy_items=WorkspaceService._build_privacy_items(),
                dataset_items=WorkspaceService._build_dataset_items(stats),
                resources=WorkspaceService._build_resources(),
            )

        except Exception as e:
            logger.error(f"[WORKSPACE ERROR] {str(e)}")
            raise

    # -----------------------------
    # UPDATE PROFILE
    # -----------------------------
    @staticmethod
    def update_profile(user_id: str, payload: WorkspaceProfileUpdate) -> WorkspaceProfile:

        user = UserRepository.update_user(
            user_id=user_id,
            fields={
                "full_name": payload.full_name,
                "organization": payload.organization,
            },
        )

        if not user:
            raise ValueError("User not found")

        return WorkspaceProfile(
            full_name=user["full_name"],
            email=user["email"],
            organization=user.get("organization"),
        )

    # -----------------------------
    # UPDATE PREFERENCES
    # -----------------------------
    @staticmethod
    def update_preferences(
        user_id: str,
        payload: WorkspacePreferencesUpdate
    ) -> WorkspacePreferences:

        updates = payload.model_dump(exclude_none=True)

        user = UserRepository.update_nested_fields(
            user_id=user_id,
            prefix="preferences",
            fields=updates,
        )

        if not user:
            raise ValueError("User not found")

        pref = user.get("preferences", {})

        return WorkspacePreferences(
            calm_theme=pref.get("calm_theme", True),
            annotation_sounds=pref.get("annotation_sounds", True),
            auto_save_review_sessions=pref.get("auto_save_review_sessions", True),
        )

    # -----------------------------
    # UI BUILDERS (CLEAN + SCALABLE)
    # -----------------------------
    @staticmethod
    def _build_account_items(user: dict) -> list[WorkspaceInfoItem]:
        return [
            WorkspaceInfoItem(
                key="workspace_profile",
                label="Workspace Profile",
                description=f"{user['full_name']} | {user.get('organization') or 'Independent workspace'}",
                value="Editable",
            ),
            WorkspaceInfoItem(
                key="primary_contact",
                label="Primary Contact",
                description=user["email"],
                value="Verified",
            ),
            WorkspaceInfoItem(
                key="authentication",
                label="Authentication",
                description="JWT-backed authenticated workspace access.",
                value="Active",
            ),
        ]

    @staticmethod
    def _build_privacy_items() -> list[WorkspaceInfoItem]:
        return [
            WorkspaceInfoItem(
                key="protected_session",
                label="Protected Session",
                description="Secure API access for workspace data.",
                value="Active",
            ),
            WorkspaceInfoItem(
                key="notification_rules",
                label="Notification Rules",
                description="Real-time workspace activity alerts.",
                value="Enabled",
            ),
            WorkspaceInfoItem(
                key="sensitive_data_controls",
                label="Sensitive Data Controls",
                description="User-scoped conversation access control.",
                value="Scoped",
            ),
        ]

    @staticmethod
    def _build_dataset_items(stats: WorkspaceStats) -> list[WorkspaceInfoItem]:
        return [
            WorkspaceInfoItem(
                key="storage_usage",
                label="Storage Usage",
                description="Estimated MongoDB storage footprint.",
                value=stats.storage_usage,
            ),
            WorkspaceInfoItem(
                key="saved_sessions",
                label="Saved Sessions",
                description="Stored conversation sessions.",
                value=str(stats.saved_sessions),
            ),
            WorkspaceInfoItem(
                key="reviewed_messages",
                label="Reviewed Messages",
                description="Total messages processed in workspace.",
                value=str(stats.reviewed_messages),
            ),
        ]

    @staticmethod
    def _build_resources() -> list[WorkspaceResource]:
        return [
            WorkspaceResource(
                title="Annotation Guide",
                description="Labeling standards for dataset quality.",
                href="#annotation-guide",
            ),
            WorkspaceResource(
                title="Review FAQ",
                description="Guidelines for workspace usage.",
                href="#review-faq",
            ),
            WorkspaceResource(
                title="Safety Policy",
                description="Mental health content safety rules.",
                href="#safety-policy",
            ),
        ]