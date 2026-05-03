from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.users.models import Language, Level

EmailField = EmailStr


class UserCreate(BaseModel):
    name: str = Field(max_length=120)
    email: EmailField
    password: str = Field(min_length=8)
    device_id: str = Field(max_length=128)
    lang: Language | str
    level: Level | str = Level.A1


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    email: EmailField | None = None
    lang: Language | str | None = None
    level: Level | str | None = None
    password: str | None = None


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailField
    lang: Language
    level: Level
    created_at: datetime


class UserExport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailField
    lang: Language
    level: Level
    created_at: datetime


class UserResponse(BaseModel):
    user: UserPublic
