import dict_hash
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.study.models import StudyPlan, Word
from app.study.repository import study_plan_repository, word_repository

class PlanService:
    async def build_30_day_plan(self, db: AsyncSession, *, level: str) -> list[dict]:
        daily_words = 20
        pool = await word_repository.list_for_level(db, level=level, limit=700)
        if len(pool) < daily_words:
            pool = await word_repository.list_dictionary_words(db, limit=700)
        if len(pool) < daily_words:
            pool = await word_repository.list_all(db, limit=700)
        if not pool:
            return []

        word_ids = [item.id for item in pool]
        total = len(word_ids)
        days = []
        for day in range(1, 31):
            start = ((day - 1) * daily_words) % total
            today_words = [word_ids[(start + offset) % total] for offset in range(daily_words)]
            days.append(
                {
                    "day": day,
                    "status": "current" if day == 1 else "locked",
                    "word_ids": today_words,
                    "sections": {"s1": today_words[:7], "s2": today_words[7:14], "s3": today_words[14:20]},
                    "snippets": [{"sentence": f"Example sentence for {today_words[0]}", "word_id": today_words[0]}],
                }
            )
        return days

    async def generate_plan(self, db: AsyncSession, *, user_id: str, level: str) -> StudyPlan:
        days = await self.build_30_day_plan(db, level=level)
        if not days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="В базе данных нет слов для создания плана. Пожалуйста, запустите импорт слов."
            )
            
        existing = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        payload = {"level": level, "month_index": 0, "start_date": datetime.now(timezone.utc), "days": days}
        if existing is None:
            return await study_plan_repository.create(db, obj_in={"user_id": user_id, **payload})
        return await study_plan_repository.update(db, db_obj=existing, obj_in=payload)

    async def get_plan(self, db: AsyncSession, *, user_id: str, error_if_none: bool = True) -> StudyPlan | None:
        plan = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        if plan is None and error_if_none:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Учебный план не найден")
        return plan

    async def get_current_day_data(self, db: AsyncSession, *, user_id: str, default_level: str = "A1") -> tuple[dict, list[Word]]:
        plan = await self.get_plan(db, user_id=user_id, error_if_none=False)
        
        # Если плана нет, генерируем его автоматически
        if plan is None:
            plan = await self.generate_plan(db, user_id=user_id, level=default_level)
            
        if not plan.days:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="В вашем плане нет дней обучения.")

        day = next((item for item in plan.days if item.get("status") == "current"), None)
        if day is None:
            day = plan.days[0]
            
        word_ids = day.get("word_ids", [])[:20]
        if not word_ids:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="В текущем дне нет слов для изучения.")

        words = await word_repository.get_many_by_ids(db, word_ids=word_ids)
        words_by_id = {word.id: word for word in words}
        return day, [words_by_id[word_id] for word_id in word_ids if word_id in words_by_id]

    async def advance_plan(self, db: AsyncSession, *, user_id: str, completed_day: int) -> StudyPlan | None:
        plan = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        if plan is not None and plan.days:
            for day_obj in plan.days:
                if day_obj.get("day") == completed_day:
                    day_obj["status"] = "completed"
                if day_obj.get("day") == completed_day + 1 and day_obj.get("status") == "locked":
                    day_obj["status"] = "current"
            return await study_plan_repository.update(db, db_obj=plan, obj_in={"days": plan.days})
        return None

    async def remove_plan(self, db: AsyncSession, *, user_id: str) -> None:
        plan = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        if plan is not None:
            await study_plan_repository.remove(db, obj_id=plan.id)
