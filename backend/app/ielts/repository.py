from typing import Sequence
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import CRUDBase
from app.ielts.models import IELTSWord, IELTSWritingTask, IELTSWritingAttempt, IELTSMockTest, IELTSMockTestSection, IELTSMockTestQuestion, IELTSMockTestAttempt, IELTSStats


class IELTSWordRepository(CRUDBase[IELTSWord, object, object]):
    async def get_daily(self, db: AsyncSession, *, limit: int = 10) -> Sequence[IELTSWord]:
        result = await db.execute(select(IELTSWord).order_by(func.random()).limit(limit))
        return result.scalars().all()


class IELTSWritingTaskRepository(CRUDBase[IELTSWritingTask, object, object]):
    async def get_random_by_type(self, db: AsyncSession, *, type: str) -> IELTSWritingTask | None:
        result = await db.execute(
            select(IELTSWritingTask).where(IELTSWritingTask.type == type).order_by(func.random()).limit(1)
        )
        return result.scalar_one_or_none()


class IELTSWritingAttemptRepository(CRUDBase[IELTSWritingAttempt, object, object]):
    async def list_by_user(self, db: AsyncSession, *, user_id: str) -> Sequence[IELTSWritingAttempt]:
        result = await db.execute(
            select(IELTSWritingAttempt).where(IELTSWritingAttempt.user_id == user_id).order_by(IELTSWritingAttempt.created_at.desc())
        )
        return result.scalars().all()


class IELTSMockTestRepository(CRUDBase[IELTSMockTest, object, object]):
    async def get_with_details(self, db: AsyncSession, *, test_id: str) -> IELTSMockTest | None:
        result = await db.execute(
            select(IELTSMockTest)
            .where(IELTSMockTest.id == test_id)
            .options(
                selectinload(IELTSMockTest.sections).selectinload(IELTSMockTestSection.questions)
            )
        )
        return result.scalar_one_or_none()


class IELTSMockTestAttemptRepository(CRUDBase[IELTSMockTestAttempt, object, object]):
    async def list_by_user(self, db: AsyncSession, *, user_id: str) -> Sequence[IELTSMockTestAttempt]:
        result = await db.execute(
            select(IELTSMockTestAttempt).where(IELTSMockTestAttempt.user_id == user_id).order_by(IELTSMockTestAttempt.created_at.desc())
        )
        return result.scalars().all()


class IELTSStatsRepository(CRUDBase[IELTSStats, object, object]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: str) -> IELTSStats | None:
        result = await db.execute(select(IELTSStats).where(IELTSStats.user_id == user_id))
        return result.scalar_one_or_none()


ielts_word_repository = IELTSWordRepository(IELTSWord)
ielts_writing_task_repository = IELTSWritingTaskRepository(IELTSWritingTask)
ielts_writing_attempt_repository = IELTSWritingAttemptRepository(IELTSWritingAttempt)
ielts_mock_test_repository = IELTSMockTestRepository(IELTSMockTest)
ielts_mock_test_attempt_repository = IELTSMockTestAttemptRepository(IELTSMockTestAttempt)
ielts_stats_repository = IELTSStatsRepository(IELTSStats)
