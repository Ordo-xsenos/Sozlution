from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.users.schemas import EmailField
from app.users.schemas import UserPublic


class SessionCreate(BaseModel):
    mode: Literal["login", "register"] = "register"
    name: str | None = Field(default=None, max_length=120)
    email: EmailField
    password: str = Field(min_length=8)
    lang: str
    device_id: str = Field(max_length=128)

    @model_validator(mode="after")
    def validate_mode_payload(self) -> "SessionCreate":
        if self.mode == "register" and not self.name:
            raise ValueError("name обязателен для регистрации")
        return self


class SessionResponse(BaseModel):
    user: UserPublic
    session_token: str


class PasswordResetRequestIn(BaseModel):
    email: EmailField


class PasswordResetConfirmIn(BaseModel):
    token: str = Field(min_length=1)
    password: str = Field(min_length=8)
