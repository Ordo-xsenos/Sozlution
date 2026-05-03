from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import CRUDBase
from app.study.models import DayResult, Stats, StudyPlan, TestQuestion, Word


class WordRepository(CRUDBase[Word, object, object]):
    async def get_by_en(self, db: AsyncSession, en: str) -> Word | None:
        result = await db.execute(select(Word).where(Word.en == en))
        return result.scalars().first()

    async def get_by_en_ci(self, db: AsyncSession, en: str) -> Word | None:
        normalized = en.strip().casefold()
        if not normalized:
            return None
        result = await db.execute(select(Word).where(func.lower(Word.en) == normalized))
        return result.scalars().first()

    async def get_many_by_ids(self, db: AsyncSession, *, word_ids: list[str]) -> list[Word]:
        if not word_ids:
            return []
        result = await db.execute(select(Word).where(Word.id.in_(word_ids)))
        return list(result.scalars().all())

    async def list_for_level(self, db: AsyncSession, *, level: str, limit: int = 700) -> list[Word]:
        result = await db.execute(
            select(Word).where(Word.id.like("dict-%"), Word.level_tag == level).order_by(Word.id).limit(limit)
        )
        return list(result.scalars().all())

    async def list_dictionary_words(self, db: AsyncSession, *, limit: int = 700) -> list[Word]:
        result = await db.execute(select(Word).where(Word.id.like("dict-%")).order_by(Word.id).limit(limit))
        return list(result.scalars().all())

    async def list_all(self, db: AsyncSession, *, limit: int = 700) -> list[Word]:
        result = await db.execute(select(Word).order_by(Word.id).limit(limit))
        return list(result.scalars().all())


class TestQuestionRepository(CRUDBase[TestQuestion, object, object]):
    async def list_first(self, db: AsyncSession, *, limit: int = 20) -> list[TestQuestion]:
        result = await db.execute(select(TestQuestion).order_by(TestQuestion.id).limit(limit))
        return list(result.scalars().all())


class StudyPlanRepository(CRUDBase[StudyPlan, object, object]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: str) -> StudyPlan | None:
        result = await db.execute(select(StudyPlan).where(StudyPlan.user_id == user_id))
        return result.scalars().first()


class DayResultRepository(CRUDBase[DayResult, object, object]):
    async def get_by_user_and_day(self, db: AsyncSession, *, user_id: str, day: int) -> DayResult | None:
        result = await db.execute(select(DayResult).where(DayResult.user_id == user_id, DayResult.day == day))
        return result.scalars().first()

    async def list_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[list[DayResult], int]:
        # Получить total count
        count_result = await db.execute(
            select(func.count()).select_from(DayResult).where(DayResult.user_id == user_id)
        )
        total = count_result.scalar_one()

        # Получить данные с пагинацией
        result = await db.execute(
            select(DayResult)
            .where(DayResult.user_id == user_id)
            .order_by(DayResult.day)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def delete_by_user(self, db: AsyncSession, *, user_id: str) -> None:
        result = await db.execute(select(DayResult).where(DayResult.user_id == user_id))
        for item in result.scalars().all():
            await db.delete(item)
        await db.commit()


class StatsRepository(CRUDBase[Stats, object, object]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: str) -> Stats | None:
        result = await db.execute(select(Stats).where(Stats.user_id == user_id))
        return result.scalars().first()


word_repository = WordRepository(Word)
test_question_repository = TestQuestionRepository(TestQuestion)
study_plan_repository = StudyPlanRepository(StudyPlan)
day_result_repository = DayResultRepository(DayResult)
stats_repository = StatsRepository(Stats)
