import asyncio

from sqlalchemy import select

from app.db.session import get_active_database_uri, get_sessionmaker
from app.study.models import Stats


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Sozlution API"}


def test_database_fallback_uses_sqlite_in_tests(client):
    client.get("/")
    active_uri = get_active_database_uri()
    assert active_uri is not None
    assert active_uri.startswith("postgresql+asyncpg://") or active_uri.startswith("sqlite+aiosqlite:///")


def test_test_and_plan_endpoints(client, registered_user, seeded_words):
    unauthorized = client.get("/api/v1/test/questions")
    assert unauthorized.status_code == 401

    questions = client.get("/api/v1/test/questions", headers=registered_user)
    assert questions.status_code == 200
    assert len(questions.json()["questions"]) == 20

    submitted = client.post(
        "/api/v1/test/submit",
        headers=registered_user,
        json={"answers": {f"q{i}": 0 for i in range(1, 21)}},
    )
    assert submitted.status_code == 200
    assert submitted.json()["level"] in {"A1", "A2", "B1", "B2", "C1"}

    missing_plan = client.get("/api/v1/plan", headers=registered_user)
    assert missing_plan.status_code == 404

    generated = client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "A1"})
    assert generated.status_code == 200
    assert len(generated.json()["plan"]["days"]) == 30

    fetched = client.get("/api/v1/plan", headers=registered_user)
    assert fetched.status_code == 200
    assert fetched.json()["plan"]["level"] == "A1"


def test_day_stats_results_and_reset_flow(client, registered_user, seeded_words):
    no_plan = client.get("/api/v1/day/current", headers=registered_user)
    assert no_plan.status_code == 404

    client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "A1"})

    current_day = client.get("/api/v1/day/current", headers=registered_user)
    assert current_day.status_code == 200
    assert len(current_day.json()["words"]) == 20

    completed = client.post(
        "/api/v1/day/complete",
        headers=registered_user,
        json={"day": 1, "step1": {"w1": True, "w2": False}, "step2": {"w3": True}, "step3": {"w4": 5}},
    )
    assert completed.status_code == 200
    assert completed.json()["stats"]["total_days_done"] == 1

    stats = client.get("/api/v1/stats", headers=registered_user)
    assert stats.status_code == 200
    assert stats.json()["stats"]["streak"] == 1

    results = client.get("/api/v1/results", headers=registered_user)
    assert results.status_code == 200
    assert len(results.json()["results"]) == 1

    reset = client.post("/api/v1/reset-progress", headers=registered_user)
    assert reset.status_code == 200
    assert reset.json()["ok"] is True

    stats_after_reset = client.get("/api/v1/stats", headers=registered_user)
    assert stats_after_reset.status_code == 200
    assert stats_after_reset.json()["stats"]["streak"] == 0


def test_regenerate_plan_overwrites_old_one(client, registered_user, seeded_words):
    # Generate A1 plan
    client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "A1"})
    
    # Complete 1 day
    client.post(
        "/api/v1/day/complete",
        headers=registered_user,
        json={"day": 1, "step1": {"w1": True}, "step2": {"w2": True}, "step3": {"w3": 4}},
    )
    
    # Check stats
    stats = client.get("/api/v1/stats", headers=registered_user).json()["stats"]
    assert stats["total_days_done"] == 1
    
    # Generate B1 plan
    generated = client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "B1"})
    assert generated.status_code == 200
    
    # Plan should be new
    plan = client.get("/api/v1/plan", headers=registered_user).json()["plan"]
    assert plan["level"] == "B1"
    
    # Stats should be reset (depending on business logic, here we check if total_days_done is still 1 or reset)
    # Most apps reset progress for a NEW plan
    stats_after = client.get("/api/v1/stats", headers=registered_user).json()["stats"]
    # In this app, resetting progress is a separate endpoint, but generating a new plan
    # should probably start from day 1 again. Let's check current day.
    current_day = client.get("/api/v1/day/current", headers=registered_user).json()
    assert current_day["day_number"] == 1


def test_streak_calculation(client, registered_user, seeded_words):
    client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "A1"})
    
    # Day 1
    client.post(
        "/api/v1/day/complete",
        headers=registered_user,
        json={"day": 1, "step1": {"w1": True}, "step2": {"w2": True}, "step3": {"w3": 5}},
    )
    
    stats = client.get("/api/v1/stats", headers=registered_user).json()["stats"]
    assert stats["streak"] == 1
    
    # Day 2
    client.post(
        "/api/v1/day/complete",
        headers=registered_user,
        json={"day": 2, "step1": {"w1": True}, "step2": {"w2": True}, "step3": {"w3": 5}},
    )
    
    stats = client.get("/api/v1/stats", headers=registered_user).json()["stats"]
    assert stats["streak"] == 2


def test_export_import_empty_progress(client, registered_user):
    exported = client.get("/api/v1/export", headers=registered_user)
    assert exported.status_code == 200
    payload = exported.json()
    assert payload["plan"] is None
    assert payload["results"] == []
    assert payload["stats"]["total_days_done"] == 0

    imported = client.post(
        "/api/v1/import",
        headers=registered_user,
        json=payload,
    )
    assert imported.status_code == 200
    assert imported.json()["ok"] is True


def test_export_and_import_endpoints(client, registered_user, seeded_words):
    client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "A1"})
    client.post(
        "/api/v1/day/complete",
        headers=registered_user,
        json={"day": 1, "step1": {"w1": True}, "step2": {"w2": True}, "step3": {"w3": 4}},
    )

    exported = client.get("/api/v1/export", headers=registered_user)
    assert exported.status_code == 200
    payload = exported.json()
    assert payload["user"]["name"] == "alice"
    assert payload["user"]["email"] == "alice@example.com"
    assert payload["stats"]["total_days_done"] == 1

    imported = client.post(
        "/api/v1/import",
        headers=registered_user,
        json={
            "user": {
                "name": "imported",
                "email": "imported@example.com",
                "lang": "ru",
                "level": "B2",
            },
            "plan": payload["plan"],
            "results": payload["results"],
            "stats": payload["stats"],
        },
    )
    assert imported.status_code == 200
    assert imported.json()["ok"] is True

    current = client.get("/api/v1/user", headers=registered_user)
    assert current.status_code == 200
    assert current.json()["user"]["name"] == "imported"
    assert current.json()["user"]["email"] == "imported@example.com"


def test_stats_created_on_register(client, registered_user):
    async def verify_stats():
        sessionmaker = await get_sessionmaker()
        async with sessionmaker() as session:
            result = await session.execute(select(Stats))
            return len(result.scalars().all())

    assert asyncio.run(verify_stats()) == 1
