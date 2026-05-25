from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.study.models import Stats
from app.study.repository import stats_repository, day_result_repository

class StatsService:
    async def get_or_create_stats(self, db: AsyncSession, *, user_id: str) -> Stats:
        stats = await stats_repository.get_by_user_id(db, user_id=user_id)
        if stats is not None:
            return stats
        return await stats_repository.create(
            db,
            obj_in={
                "user_id": user_id,
                "streak": 0,
                "total_words_learned": 0,
                "total_days_done": 0,
                "avg_accuracy": 0.0,
                "last_activity_date": None,
            },
        )

    async def update_stats_after_day(self, db: AsyncSession, *, user_id: str) -> Stats:
        stats = await self.get_or_create_stats(db, user_id=user_id)
        all_results, _ = await day_result_repository.list_by_user(db, user_id=user_id)
        
        return await stats_repository.update(
            db,
            db_obj=stats,
            obj_in={
                "streak": len(all_results),
                "total_words_learned": len(all_results) * 20,
                "total_days_done": len(all_results),
                "avg_accuracy": sum(item.accuracy for item in all_results) / len(all_results) if all_results else 0.0,
                "last_activity_date": date.today(),
            },
        )

    async def reset_stats(self, db: AsyncSession, *, user_id: str) -> Stats:
        stats = await self.get_or_create_stats(db, user_id=user_id)
        return await stats_repository.update(
            db,
            db_obj=stats,
            obj_in={
                "streak": 0, 
                "total_words_learned": 0, 
                "total_days_done": 0, 
                "avg_accuracy": 0.0, 
                "last_activity_date": None
            },
        )
