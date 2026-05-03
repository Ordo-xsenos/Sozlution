from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_sessionmaker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    sessionmaker = await get_sessionmaker()
    async with sessionmaker() as session:
        yield session
