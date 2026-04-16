from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_current_user
from app.schemas.auth import UserPublic
from app.schemas.workspace import (
    WorkspacePreferences,
    WorkspacePreferencesUpdate,
    WorkspaceProfile,
    WorkspaceProfileUpdate,
    WorkspaceResponse,
)
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/workspace", tags=["workspace"])


@router.get("", response_model=WorkspaceResponse)
def get_workspace(current_user: UserPublic = Depends(get_current_user)) -> WorkspaceResponse:
    try:
        return WorkspaceService.get_workspace(current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/profile", response_model=WorkspaceProfile)
def update_profile(
    payload: WorkspaceProfileUpdate,
    current_user: UserPublic = Depends(get_current_user),
) -> WorkspaceProfile:
    try:
        return WorkspaceService.update_profile(current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/preferences", response_model=WorkspacePreferences)
def update_preferences(
    payload: WorkspacePreferencesUpdate,
    current_user: UserPublic = Depends(get_current_user),
) -> WorkspacePreferences:
    try:
        return WorkspaceService.update_preferences(current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
