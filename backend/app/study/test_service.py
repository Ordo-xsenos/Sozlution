import random
import re
from sqlalchemy.ext.asyncio import AsyncSession
from app.study.repository import test_question_repository, word_repository
from app.users.models import Level, User

def map_score_to_level(score: int) -> Level:
    if score >= 18:
        return Level.C1
    if score >= 15:
        return Level.B2
    if score >= 11:
        return Level.B1
    if score >= 7:
        return Level.A2
    return Level.A1

class TestService:
    async def ensure_test_questions_seeded(self, db: AsyncSession) -> None:
        existing = await test_question_repository.list_first(db, limit=20)
        refresh_needed = len(existing) < 20 or any(
            re.fullmatch(r"word\s+\d+", (item.en or "").strip().lower()) for item in existing
        )
        if not refresh_needed:
            return

        words = await word_repository.list_all(db, limit=500)
        if len(words) < 20:
            return

        sample = words[:20]
        ru_pool = [word.ru for word in words if word.ru]
        uz_pool = [word.uz for word in words if word.uz]
        for index, word in enumerate(sample, start=1):
            ru_correct = word.ru
            uz_correct = word.uz
            ru_distractors = [value for value in ru_pool if value != ru_correct][:60]
            uz_distractors = [value for value in uz_pool if value != uz_correct][:60]
            random.shuffle(ru_distractors)
            random.shuffle(uz_distractors)
            ru_options = [ru_correct, *ru_distractors[:3]]
            uz_options = [uz_correct, *uz_distractors[:3]]
            random.shuffle(ru_options)
            random.shuffle(uz_options)
            payload = {
                "en": word.en,
                "options": {"uz": uz_options, "ru": ru_options},
                "correct_index": ru_options.index(ru_correct),
            }
            existing_question = await test_question_repository.get(db, f"q{index}")
            if existing_question is None:
                await test_question_repository.create(db, obj_in={"id": f"q{index}", **payload})
            else:
                await test_question_repository.update(db, db_obj=existing_question, obj_in=payload)

    async def get_test_questions(self, db: AsyncSession):
        await self.ensure_test_questions_seeded(db)
        return await test_question_repository.list_first(db, limit=20)

    async def submit_test(self, db: AsyncSession, *, user: User, answers: dict[str, int]) -> tuple[int, Level]:
        await self.ensure_test_questions_seeded(db)
        questions = await test_question_repository.list_first(db, limit=20)
        score = 0
        for question in questions:
            if str(answers.get(question.id, -1)) == str(question.correct_index):
                score += 1
        level = map_score_to_level(score)
        user.level = level.value
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return score, level
