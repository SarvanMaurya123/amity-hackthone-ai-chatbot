from pydantic import BaseModel, EmailStr, Field


class WorkspacePreferenceToggle(BaseModel):
    key: str
    label: str
    description: str
    enabled: bool


class WorkspaceInfoItem(BaseModel):
    key: str
    label: str
    description: str
    value: str


class WorkspaceResource(BaseModel):
    title: str
    description: str
    href: str


class WorkspaceProfile(BaseModel):
    full_name: str
    email: EmailStr
    organization: str | None = None


class WorkspaceProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    organization: str | None = Field(default=None, max_length=120)


class WorkspacePreferences(BaseModel):
    calm_theme: bool = True
    annotation_sounds: bool = True
    auto_save_review_sessions: bool = True


class WorkspacePreferencesUpdate(BaseModel):
    calm_theme: bool | None = None
    annotation_sounds: bool | None = None
    auto_save_review_sessions: bool | None = None


class WorkspaceStats(BaseModel):
    saved_sessions: int
    reviewed_messages: int
    pinned_sessions: int
    storage_usage: str


class WorkspaceResponse(BaseModel):
    profile: WorkspaceProfile
    preferences: WorkspacePreferences
    stats: WorkspaceStats
    account_items: list[WorkspaceInfoItem]
    privacy_items: list[WorkspaceInfoItem]
    dataset_items: list[WorkspaceInfoItem]
    resources: list[WorkspaceResource]
