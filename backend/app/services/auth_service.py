from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, UserPublic, UserRegisterRequest


class UserAlreadyExistsError(ValueError):
    pass


class InvalidCredentialsError(ValueError):
    pass


class AuthService:
    @staticmethod
    def register(payload: UserRegisterRequest) -> AuthResponse:
        existing_user = UserRepository.find_by_email(payload.email)
        if existing_user is not None:
            raise UserAlreadyExistsError("An account with this email already exists")

        user = UserRepository.create_user(
            email=payload.email,
            full_name=payload.full_name,
            organization=payload.organization,
            password_hash=hash_password(payload.password),
        )
        token = create_access_token(user["id"])
        return AuthResponse(access_token=token, user=AuthService._build_user_response(user))

    @staticmethod
    def login(payload: LoginRequest) -> AuthResponse:
        user = UserRepository.find_by_email(payload.email)
        if user is None or not verify_password(payload.password, user["password_hash"]):
            raise InvalidCredentialsError("Invalid email or password")

        token = create_access_token(user["id"])
        return AuthResponse(access_token=token, user=AuthService._build_user_response(user))

    @staticmethod
    def get_user_by_id(user_id: str) -> dict | None:
        return UserRepository.find_by_id(user_id)

    @staticmethod
    def _build_user_response(user: dict) -> UserPublic:
        return UserPublic(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            organization=user.get("organization"),
        )
