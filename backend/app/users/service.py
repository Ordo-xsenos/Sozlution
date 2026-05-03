import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.users.models import User
from app.users.repository import UserRepository, user_repository
from app.users.schemas import UserCreate, UserUpdate


def _enum_value(value):
    return value.value if hasattr(value, "value") else value


class UserService:
    def __init__(self, repository: UserRepository = user_repository):
        self.repository = repository

    async def get_by_id(self, db: AsyncSession, *, user_id: str) -> User | None:
        return await self.repository.get(db, user_id)

    async def get_by_name(self, db: AsyncSession, *, name: str) -> User | None:
        return await self.repository.get_by_name(db, name=name)

    async def get_by_email(self, db: AsyncSession, *, email: str) -> User | None:
        return await self.repository.get_by_email(db, email=email)

    async def create_user(self, db: AsyncSession, *, user_in: UserCreate) -> User:
        if await self.repository.get_by_name(db, name=user_in.name):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь уже существует")
        if await self.repository.get_by_email(db, email=user_in.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь с таким email уже существует")

        device_id = user_in.device_id
        if await self.repository.get_by_device_id(db, device_id=device_id):
            device_id = f"{device_id}-{uuid.uuid4().hex[:8]}"

        payload = user_in.model_dump(exclude={"password"})
        payload["lang"] = _enum_value(payload["lang"])
        payload["level"] = _enum_value(payload["level"])
        payload["device_id"] = device_id
        payload["password_hash"] = get_password_hash(user_in.password)
        return await self.repository.create(db, obj_in=payload)

    async def update_user(self, db: AsyncSession, *, user: User, user_in: UserUpdate) -> User:
        payload = user_in.model_dump(exclude_unset=True)
        password = payload.pop("password", None)
        email = payload.get("email")
        if email:
            existing = await self.repository.get_by_email(db, email=email)
            if existing is not None and existing.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Пользователь с таким email уже существует",
                )
        if "lang" in payload:
            payload["lang"] = _enum_value(payload["lang"])
        if "level" in payload:
            payload["level"] = _enum_value(payload["level"])
        if password:
            payload["password_hash"] = get_password_hash(password)
        return await self.repository.update(db, db_obj=user, obj_in=payload)

    async def update_language(self, db: AsyncSession, *, user: User, lang: str) -> User:
        return await self.repository.update(db, db_obj=user, obj_in={"lang": _enum_value(lang)})
