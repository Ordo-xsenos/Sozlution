import pytest
from app.ielts.models import IELTSWritingTask
from app.db.session import get_sessionmaker


@pytest.fixture
def seeded_task():
    async def _seed():
        session_maker = await get_sessionmaker()
        async with session_maker() as session:
            task = IELTSWritingTask(
                id="task-1",
                title="Test Task",
                prompt="Test Prompt",
                type="task2",
                min_words=250,
                time_limit=40
            )
            session.add(task)
            await session.commit()
    return _seed


def test_get_vocabulary(client, registered_user):
    response = client.get("/api/v1/ielts-mode/vocabulary", headers=registered_user)
    assert response.status_code == 200
    data = response.json()
    assert "words" in data
    assert isinstance(data["words"], list)


def test_get_writing_tasks(client, registered_user, seeded_task):
    import asyncio
    asyncio.run(seeded_task())
    response = client.get("/api/v1/ielts-mode/writing/tasks?type=task2", headers=registered_user)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "prompt" in data
    assert "time_limit" in data


def test_list_mock_tests(client, registered_user):
    response = client.get("/api/v1/ielts-mode/mock-tests", headers=registered_user)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_stats(client, registered_user):
    response = client.get("/api/v1/ielts-mode/stats", headers=registered_user)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_band" in data
    assert "target_band" in data
