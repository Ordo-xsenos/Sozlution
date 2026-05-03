from typing import Sequence, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.ielts.models import IELTSWord, IELTSWritingTask, IELTSWritingAttempt, IELTSMockTest, IELTSStats
from app.ielts.repository import (
    ielts_word_repository,
    ielts_writing_task_repository,
    ielts_writing_attempt_repository,
    ielts_mock_test_repository,
    ielts_mock_test_attempt_repository,
    ielts_stats_repository
)
from app.ai.service import AIService


class IELTSService:
    def __init__(self, ai_service: AIService | None = None):
        self.ai_service = ai_service or AIService()

    async def get_vocabulary(self, db: AsyncSession, *, limit: int = 10) -> Sequence[IELTSWord]:
        return await ielts_word_repository.get_daily(db, limit=limit)

    async def get_writing_tasks(self, db: AsyncSession, *, task_type: str) -> IELTSWritingTask | None:
        return await ielts_writing_task_repository.get_random_by_type(db, type=task_type)

    async def evaluate_writing(self, db: AsyncSession, *, user_id: str, task_id: str, content: str) -> dict[str, Any]:
        task = await ielts_writing_task_repository.get(db, task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Writing task not found")

        evaluation = await self.ai_service.evaluate_ielts_writing(task_prompt=task.prompt, content=content)
        
        await ielts_writing_attempt_repository.create(
            db,
            obj_in={
                "user_id": user_id,
                "task_id": task_id,
                "content": content,
                "overall_band": evaluation["overall_band"],
                "criteria": evaluation["criteria"],
                "suggestions": evaluation["improvement_suggestions"],
            }
        )

        # Update stats
        stats = await self.get_or_create_stats(db, user_id=user_id)
        stats.writing_tasks_completed += 1
        # Update estimated band (simple average for now)
        attempts = await ielts_writing_attempt_repository.list_by_user(db, user_id=user_id)
        if attempts:
            stats.estimated_band = sum(a.overall_band for a in attempts) / len(attempts)
        
        db.add(stats)
        await db.commit()

        return evaluation

    async def list_mock_tests(self, db: AsyncSession) -> Sequence[IELTSMockTest]:
        return await ielts_mock_test_repository.get_multi(db)

    async def get_mock_test(self, db: AsyncSession, *, test_id: str) -> IELTSMockTest:
        test = await ielts_mock_test_repository.get_with_details(db, test_id=test_id)
        if not test:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found")
        return test

    async def submit_mock_test(self, db: AsyncSession, *, user_id: str, test_id: str, answers: dict[str, str]) -> dict[str, Any]:
        test = await self.get_mock_test(db, test_id=test_id)
        
        correct_count = 0
        total_questions = 0
        
        for section in test.sections:
            for question in section.questions:
                total_questions += 1
                user_answer = answers.get(question.id)
                if user_answer and user_answer.strip().lower() == question.correct_answer.strip().lower():
                    correct_count += 1
        
        # Simple band score calculation (IELTS Reading/Listening standard varies, using a simplified scale)
        band_score = self._calculate_band_score(correct_count, total_questions)
        
        await ielts_mock_test_attempt_repository.create(
            db,
            obj_in={
                "user_id": user_id,
                "test_id": test_id,
                "answers": answers,
                "correct_count": correct_count,
                "total_questions": total_questions,
                "band_score": band_score,
            }
        )

        # Update stats
        stats = await self.get_or_create_stats(db, user_id=user_id)
        stats.mock_tests_count += 1
        db.add(stats)
        await db.commit()

        return {
            "correct_count": correct_count,
            "total_questions": total_questions,
            "band_score": band_score
        }

    def _calculate_band_score(self, correct: int, total: int) -> float:
        if total == 0: return 0.0
        percentage = correct / total
        if percentage >= 0.9: return 9.0
        if percentage >= 0.85: return 8.5
        if percentage >= 0.8: return 8.0
        if percentage >= 0.75: return 7.5
        if percentage >= 0.7: return 7.0
        if percentage >= 0.65: return 6.5
        if percentage >= 0.6: return 6.0
        if percentage >= 0.5: return 5.5
        if percentage >= 0.4: return 5.0
        return 4.0

    async def get_or_create_stats(self, db: AsyncSession, *, user_id: str) -> IELTSStats:
        stats = await ielts_stats_repository.get_by_user_id(db, user_id=user_id)
        if not stats:
            stats = await ielts_stats_repository.create(db, obj_in={"user_id": user_id})
        return stats
