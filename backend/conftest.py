import asyncio
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.ai.dependencies import ai_service
from app.core.config import settings
from app.db.session import dispose_db, get_sessionmaker, init_db
from app.main import app
from app.study.models import DayResult, Stats, StudyPlan, TestQuestion, Word
from app.users.models import User
from app.ielts.models import IELTSWord, IELTSWritingTask, IELTSWritingAttempt, IELTSMockTest, IELTSMockTestSection, IELTSMockTestQuestion, IELTSMockTestAttempt, IELTSStats


def run(coro):
    return asyncio.run(coro)


async def _cleanup_tables() -> None:
    await dispose_db()
    await init_db()
    sessionmaker = await get_sessionmaker()
    async with sessionmaker() as session:
        models = (
            IELTSWritingAttempt,
            IELTSMockTestAttempt,
            IELTSMockTestQuestion,
            IELTSMockTestSection,
            IELTSMockTest,
            IELTSWritingTask,
            IELTSWord,
            IELTSStats,
            DayResult,
            Stats,
            StudyPlan,
            TestQuestion,
            Word,
            User,
        )
        for model in models:
            await session.execute(delete(model))
        await session.commit()


@pytest.fixture(autouse=True)
def isolated_db(tmp_path, monkeypatch):
    db_file = Path(tmp_path) / "test.sqlite3"
    
    # Use the DSN from settings if available (Docker environment), otherwise fallback to local dev default
    default_dsn = settings.POSTGRES_DSN or "postgresql://sozlution:sozlution@127.0.0.1:54329/sozlution_test"
    
    test_postgres_dsn = os.getenv(
        "TEST_POSTGRES_DSN",
        default_dsn,
    )
    monkeypatch.setattr(settings, "POSTGRES_DSN", test_postgres_dsn)
    monkeypatch.setattr(settings, "ENABLE_SQLITE_FALLBACK", False)
    monkeypatch.setattr(settings, "SQLITE_DATABASE_URI", f"sqlite+aiosqlite:///{db_file}")
    run(dispose_db())
    run(_cleanup_tables())
    yield
    run(_cleanup_tables())
    run(dispose_db())


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def mock_ai(monkeypatch):
    monkeypatch.setattr(ai_service, "chat", lambda **kwargs: "stubbed-ai-chat")
    monkeypatch.setattr(
        ai_service,
        "word_assist",
        lambda **kwargs: {"translation": "перевод", "description": "краткое описание"},
    )


@pytest.fixture
def seeded_words(client):
    async def _seed():
        sessionmaker = await get_sessionmaker()
        async with sessionmaker() as session:
            words = []
            for index in range(1, 41):
                words.append(
                    Word(
                        id=f"dict-{index}",
                        en=f"word{index}",
                        ru=f"слово{index}",
                        uz=f"soz{index}",
                        locale_data={
                            "russian_translate": f"слово{index}",
                            "uzbek_translate": f"soz{index}",
                            "russian_description": f"описание {index}",
                            "uzbek_description": f"tavsif {index}",
                        },
                        level_tag="A1",
                    )
                )
            session.add_all(words)
            await session.commit()

    run(_seed())


@pytest.fixture
def registered_user(client):
    response = client.post(
        "/api/v1/session",
        json={
            "mode": "register",
            "name": "alice",
            "email": "alice@example.com",
            "password": "password123",
            "lang": "ru",
            "device_id": "device-1",
        },
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['session_token']}"}


@pytest.fixture
def reset_tables():
    run(_cleanup_tables())
