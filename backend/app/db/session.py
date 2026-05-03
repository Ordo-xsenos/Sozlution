import asyncio
import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.base import Base


logger = logging.getLogger(__name__)

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None
_active_database_uri: str | None = None
_init_lock = asyncio.Lock()


def _normalize_database_uri(uri: str) -> str:
    if uri.startswith("postgres://"):
        return uri.replace("postgres://", "postgresql+asyncpg://", 1)
    if uri.startswith("postgresql://"):
        return uri.replace("postgresql://", "postgresql+asyncpg://", 1)
    return uri


def _create_engine(uri: str) -> AsyncEngine:
    connect_args = {"check_same_thread": False} if uri.startswith("sqlite") else {}
    kwargs = {"connect_args": connect_args}
    if not uri.startswith("sqlite"):
        # Asyncpg connections are event-loop bound. NullPool avoids reusing
        # a connection created in one loop from another loop during tests.
        kwargs["poolclass"] = NullPool
    return create_async_engine(uri, **kwargs)


async def _probe_and_prepare(engine: AsyncEngine) -> None:
    async with engine.begin() as connection:
        await connection.execute(text("SELECT 1"))
        await connection.run_sync(Base.metadata.create_all)


async def init_db() -> async_sessionmaker[AsyncSession]:
    global _engine, _sessionmaker, _active_database_uri

    if _sessionmaker is not None:
        return _sessionmaker

    async with _init_lock:
        if _sessionmaker is not None:
            return _sessionmaker

        last_error: Exception | None = None
        for raw_uri in settings.get_database_candidates():
            uri = _normalize_database_uri(raw_uri)
            engine: AsyncEngine | None = None
            try:
                engine = _create_engine(uri)
                await asyncio.wait_for(_probe_and_prepare(engine), timeout=5)
                _engine = engine
                _sessionmaker = async_sessionmaker(
                    bind=engine,
                    class_=AsyncSession,
                    autocommit=False,
                    autoflush=False,
                    expire_on_commit=False,
                )
                _active_database_uri = uri
                return _sessionmaker
            except Exception as exc:
                last_error = exc
                logger.warning("Database candidate failed: %s", uri, exc_info=exc)
                if engine is not None:
                    await engine.dispose()

        raise RuntimeError("Failed to initialize database connection") from last_error


async def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    return await init_db()


async def dispose_db() -> None:
    global _engine, _sessionmaker, _active_database_uri
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _sessionmaker = None
    _active_database_uri = None


def get_active_database_uri() -> str | None:
    return _active_database_uri
