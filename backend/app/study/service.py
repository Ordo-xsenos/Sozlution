from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.study.models import DayResult, Stats, StudyPlan, Word
from app.study.repository import (
    day_result_repository,
    stats_repository,
    study_plan_repository,
    word_repository,
)
from app.study.schemas import DayCompleteIn, ImportIn
from app.study.stats_service import StatsService
from app.study.plan_service import PlanService
from app.study.test_service import TestService
from app.users.models import Level, User


def parse_datetime_value(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, str) and value:
        normalized = value.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)
    return datetime.now(timezone.utc)


def parse_date_value(value):
    if isinstance(value, date):
        return value
    if isinstance(value, str) and value:
        return date.fromisoformat(value)
    return None


class StudyService:
    def __init__(
        self, 
        stats_service: StatsService | None = None, 
        plan_service: PlanService | None = None,
        test_service: TestService | None = None
    ):
        self.stats_service = stats_service or StatsService()
        self.plan_service = plan_service or PlanService()
        self.test_service = test_service or TestService()

    async def get_or_create_stats(self, db: AsyncSession, *, user_id: str) -> Stats:
        return await self.stats_service.get_or_create_stats(db, user_id=user_id)

    async def get_test_questions(self, db: AsyncSession):
        return await self.test_service.get_test_questions(db)

    async def submit_test(self, db: AsyncSession, *, user: User, answers: dict[str, int]) -> tuple[int, Level]:
        return await self.test_service.submit_test(db, user=user, answers=answers)

    async def generate_plan(self, db: AsyncSession, *, user: User, level: str) -> StudyPlan:
        return await self.plan_service.generate_plan(db, user_id=user.id, level=level)

    async def get_plan(self, db: AsyncSession, *, user_id: str) -> StudyPlan:
        return await self.plan_service.get_plan(db, user_id=user_id)

    async def get_current_day(self, db: AsyncSession, *, user: User) -> tuple[dict, list[Word]]:
        return await self.plan_service.get_current_day_data(db, user_id=user.id, default_level=user.level)

    async def complete_day(self, db: AsyncSession, *, user: User, payload: DayCompleteIn):
        step1_correct = sum(1 for ok in payload.step1.values() if ok)
        step2_correct = sum(1 for ok in payload.step2.values() if ok)
        total_checks = max(1, len(payload.step1) + len(payload.step2))
        accuracy = ((step1_correct + step2_correct) / float(total_checks)) * 100.0
        result_payload = {"step1": payload.step1, "step2": payload.step2, "step3": payload.step3, "accuracy": accuracy}
        
        result = await day_result_repository.get_by_user_and_day(db, user_id=user.id, day=payload.day)
        if result is None:
            result = await day_result_repository.create(db, obj_in={"user_id": user.id, "day": payload.day, **result_payload})
        else:
            result = await day_result_repository.update(db, db_obj=result, obj_in=result_payload)

        stats = await self.stats_service.update_stats_after_day(db, user_id=user.id)
        plan = await self.plan_service.advance_plan(db, user_id=user.id, completed_day=payload.day)
        
        return result, stats, plan

    async def get_results(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[list[DayResult], int]:
        return await day_result_repository.list_by_user(
            db, user_id=user_id, skip=skip, limit=limit
        )

    async def export_data(self, db: AsyncSession, *, user: User) -> dict:
        return {
            "user": user,
            "plan": await self.plan_service.get_plan(db, user_id=user.id),
            "results": await self.get_results(db, user_id=user.id),
            "stats": await self.get_or_create_stats(db, user_id=user.id),
        }

    async def import_data(self, db: AsyncSession, *, user: User, payload: ImportIn) -> None:
        incoming_user = payload.user
        user.name = incoming_user.get("name", user.name)
        user.email = incoming_user.get("email", user.email)
        user.lang = incoming_user.get("lang", user.lang)
        user.level = incoming_user.get("level", user.level)
        db.add(user)
        await db.commit()
        await db.refresh(user)

        if payload.plan:
            plan_payload = {
                "level": payload.plan.get("level", user.level),
                "month_index": payload.plan.get("month_index", 0),
                "start_date": parse_datetime_value(payload.plan.get("start_date")),
                "days": payload.plan.get("days", []),
            }
            existing_plan = await study_plan_repository.get_by_user_id(db, user_id=user.id)
            if existing_plan is None:
                await study_plan_repository.create(db, obj_in={"user_id": user.id, **plan_payload})
            else:
                await study_plan_repository.update(db, db_obj=existing_plan, obj_in=plan_payload)

        await day_result_repository.delete_by_user(db, user_id=user.id)
        for item in payload.results:
            await day_result_repository.create(
                db,
                obj_in={
                    "user_id": user.id,
                    "day": item.get("day", 1),
                    "step1": item.get("step1", {}),
                    "step2": item.get("step2", {}),
                    "step3": item.get("step3", {}),
                    "accuracy": item.get("accuracy", 0.0),
                },
            )

        # Синхронизация статистики после импорта
        await self.stats_service.get_or_create_stats(db, user_id=user.id)
        await stats_repository.update(
            db,
            db_obj=await self.stats_service.get_or_create_stats(db, user_id=user.id),
            obj_in={
                "streak": payload.stats.get("streak", 0),
                "total_words_learned": payload.stats.get("total_words_learned", 0),
                "total_days_done": payload.stats.get("total_days_done", 0),
                "avg_accuracy": payload.stats.get("avg_accuracy", 0.0),
                "last_activity_date": parse_date_value(payload.stats.get("last_activity_date")),
            },
        )

    async def reset_progress(self, db: AsyncSession, *, user: User) -> None:
        user.level = Level.A1.value
        db.add(user)
        await db.commit()
        await db.refresh(user)
        await self.plan_service.remove_plan(db, user_id=user.id)
        await day_result_repository.delete_by_user(db, user_id=user.id)
        await self.stats_service.reset_stats(db, user_id=user.id)

    async def update_word_assist(self, db: AsyncSession, *, word_id: str, lang: str, translation: str, description: str) -> None:
        if not word_id:
            return
        word = await word_repository.get(db, word_id)
        if word is None:
            return
        locale_data = dict(word.locale_data or {})
        if lang == "ru":
            locale_data["russian_translate"] = translation
            locale_data["russian_description"] = description
            word.ru = translation
        else:
            locale_data["uzbek_translate"] = translation
            locale_data["uzbek_description"] = description
            word.uz = translation
        word.locale_data = locale_data
        db.add(word)
        await db.commit()
        await db.refresh(word)
