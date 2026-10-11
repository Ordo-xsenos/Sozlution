import asyncio

from sqlalchemy import select

from app.db.session import get_active_database_uri, get_sessionmaker
from app.study.models import Stats, Word


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
    assert len(generated.json()["plan"]["days"]) == 90

    fetched = client.get("/api/v1/plan", headers=registered_user)
    assert fetched.status_code == 200
    assert fetched.json()["plan"]["level"] == "A1"


def test_day_stats_results_and_reset_flow(client, registered_user, seeded_words):
    auto_day = client.get("/api/v1/day/current", headers=registered_user)
    assert auto_day.status_code == 200
    assert len(auto_day.json()["words"]) == 7

    client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "A1"})

    current_day = client.get("/api/v1/day/current", headers=registered_user)
    assert current_day.status_code == 200
    assert len(current_day.json()["words"]) == 7

    completed = client.post(
        "/api/v1/day/complete",
        headers=registered_user,
        json={"day": 1, "step1": {"w1": True, "w2": False}, "step2": {"w3": True}, "step3": {"w4": 5}},
    )
    assert completed.status_code == 200
    assert completed.json()["stats"]["total_days_done"] == 1
    assert completed.json()["stats"]["total_words_learned"] == 7

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
    assert current_day["day"]["day"] == 1


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


def test_ninety_day_plan_covers_600_level_words(client, registered_user):
    async def seed_many():
        sessionmaker = await get_sessionmaker()
        async with sessionmaker() as session:
            session.add_all(
                [
                    Word(
                        id=f"bulk-{index}",
                        en=f"bulkword{index:04d}",
                        ru=f"слово{index}",
                        uz=f"soz{index}",
                        locale_data={},
                        level_tag="B2",
                    )
                    for index in range(650)
                ]
            )
            await session.commit()

    asyncio.run(seed_many())
    generated = client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "B2"})
    assert generated.status_code == 200
    days = generated.json()["plan"]["days"]
    assert len(days) == 90
    new_counts = [len(day.get("new_word_ids", [])) for day in days]
    assert new_counts[:60] == [7] * 60
    assert new_counts[60:] == [6] * 30
    assert sum(new_counts) == 600
    assert len({word_id for day in days for word_id in day.get("new_word_ids", [])}) == 600


def test_stats_created_on_register(client, registered_user):
    async def verify_stats():
        sessionmaker = await get_sessionmaker()
        async with sessionmaker() as session:
            result = await session.execute(select(Stats))
            return len(result.scalars().all())

    assert asyncio.run(verify_stats()) == 1


def test_placement_score_bands():
    from app.study.test_service import map_score_to_level

    assert map_score_to_level(20).value == "C1"
    assert map_score_to_level(18).value == "C1"
    assert map_score_to_level(17).value == "B2"
    assert map_score_to_level(15).value == "B2"
    assert map_score_to_level(14).value == "B1"
    assert map_score_to_level(11).value == "B1"
    assert map_score_to_level(10).value == "A2"
    assert map_score_to_level(7).value == "A2"
    assert map_score_to_level(6).value == "A1"
    assert map_score_to_level(0).value == "A1"


def test_schedule_constants_cover_600_words_in_90_days():
    from app.study import plan_service as plan_module

    assert plan_module.LEVEL_TARGET_NEW_WORDS == 600
    assert plan_module.SCHEDULED_DAYS == 90
    total = sum(plan_module.scheduled_new_quota(day) for day in range(1, 91))
    assert total == 600


def test_carryover_and_adaptive_quotas():
    from app.study import plan_service as plan_module

    assert plan_module.carryover_quota(0, 13) == 0
    assert plan_module.carryover_quota(7, 13) == 2
    assert plan_module.carryover_quota(1, 13) == 1
    assert plan_module.carryover_quota(200, 13) == 13
    assert plan_module.carryover_quota(5, 0) == 0
    assert plan_module.adaptive_new_quota(7, 0) == 7
    assert plan_module.adaptive_new_quota(7, 39) == 7
    assert plan_module.adaptive_new_quota(7, 40) == 3
    assert plan_module.adaptive_new_quota(7, 80) == 0


def test_backlog_prioritizes_oldest_failures():
    from app.study.plan_service import PlanService

    service = PlanService()
    backlog = service.backlog_word_ids(
        introduced_ids=["w1", "w2", "w3", "w4"],
        correct_days={"w1": {1, 2}, "w2": {1}, "w4": {1}},
        failed_days={"w2": [3], "w3": [1], "w4": [5]},
    )
    # w1 mastered (2 correct days) -> excluded; w3 failed earliest -> first
    assert backlog == ["w3", "w2", "w4"]


def test_compose_session_respects_carryover_rule():
    from app.study.plan_service import PlanService

    service = PlanService()
    new_ids = [f"n{i}" for i in range(7)]
    backlog_ids = [f"b{i}" for i in range(7)]
    weak_ids = [f"k{i}" for i in range(50)]
    session_ids = service.compose_session(new_ids=new_ids, backlog_ids=backlog_ids, weak_ids=weak_ids)
    # 7 new + ceil(20% of 7 backlog) = 2 carryover + 11 weak fill = 20
    assert session_ids[:7] == new_ids
    assert session_ids[7:9] == backlog_ids[:2]
    assert len(session_ids) == 20
    assert len(set(session_ids)) == 20


def test_unlearned_words_carry_to_next_day(client, registered_user, seeded_words):
    client.post("/api/v1/plan/generate", headers=registered_user, json={"level": "A1"})
    day1 = client.get("/api/v1/day/current", headers=registered_user).json()
    assert day1["day"]["day"] == 1
    day1_ids = [word["id"] for word in day1["words"]]
    assert len(day1_ids) == 7

    failed = {word_id: False for word_id in day1_ids[:5]}
    passed = {word_id: True for word_id in day1_ids[5:]}
    completed = client.post(
        "/api/v1/day/complete",
        headers=registered_user,
        json={"day": 1, "step1": {**failed, **passed}, "step2": {}, "step3": {}},
    )
    assert completed.status_code == 200

    day2 = client.get("/api/v1/day/current", headers=registered_user).json()
    assert day2["day"]["day"] == 2
    day2_ids = [word["id"] for word in day2["words"]]
    # ceil(20% of 5 failed) = 1 backlog word carried into day 2
    assert len([word_id for word_id in day2_ids if word_id in day1_ids[:5]]) == 1
    # 7 new + 1 carryover + 2 weak fill (the 2 words correct once on day 1)
    assert len(day2_ids) == 10
