from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import CRUDBase
from app.users.models import User
from app.users.schemas import UserCreate, UserUpdate


class UserRepository(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_name(self, db: AsyncSession, *, name: str) -> User | None:
        result = await db.execute(select(User).where(User.name == name).order_by(User.created_at.desc()))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, *, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email).order_by(User.created_at.desc()))
        return result.scalars().first()

    async def get_by_device_id(self, db: AsyncSession, *, device_id: str) -> User | None:
        result = await db.execute(select(User).where(User.device_id == device_id))
        return result.scalars().first()


user_repository = UserRepository(User)
