from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.schemas.auth import UserPublic
from app.services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserPublic:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    payload = decode_access_token(credentials.credentials)
    subject = payload.get("sub") if payload else None
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = AuthService.get_user_by_id(subject)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return UserPublic(
        id=str(user["id"]),
        email=user["email"],
        full_name=user["full_name"],
        organization=user.get("organization"),
    )
