from pydantic import BaseModel, EmailStr, Field, field_validator


def validate_bcrypt_password_length(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password cannot be longer than 72 bytes")
    return password


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=120)
    organization: str | None = Field(default=None, max_length=120)

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        return validate_bcrypt_password_length(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        return validate_bcrypt_password_length(value)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    organization: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class TokenPayload(BaseModel):
    sub: str
    email: EmailStr
    full_name: str
    organization: str | None = None
