from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_current_user
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    UserPublic,
    UserRegisterRequest,
)
from app.services.auth_service import AuthService, InvalidCredentialsError, UserAlreadyExistsError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest) -> AuthResponse:
    try:
        return AuthService.register(payload)
    except UserAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/login", response_model=AuthResponse)
def login_user(payload: LoginRequest) -> AuthResponse:
    try:
        return AuthService.login(payload)
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.get("/me", response_model=UserPublic)
def read_current_user(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return current_user
