import math
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified
from app.study.models import StudyPlan, Word
from app.study.repository import day_result_repository, study_plan_repository, word_repository


# 90 kunlik o'quv rejasi konstantalari.
LEVEL_TARGET_NEW_WORDS = 600
SCHEDULED_DAYS = 90
FULL_RATE_DAYS = 60
FULL_NEW_PER_DAY = 7
TAIL_NEW_PER_DAY = 6
SESSION_TARGET_WORDS = 20
CARRYOVER_FRACTION = 0.20
MAX_REVIEW_WORDS = 13
BACKLOG_REDUCED_THRESHOLD = 40
BACKLOG_PAUSED_THRESHOLD = 80
REDUCED_NEW_PER_DAY = 3
CLEANUP_WORDS_PER_DAY = 20
MASTERY_CORRECT_DAYS = 2


def scheduled_new_quota(day_number: int) -> int:
    if day_number <= FULL_RATE_DAYS:
        return FULL_NEW_PER_DAY
    return TAIL_NEW_PER_DAY


def days_payload(days: list[dict]) -> list[dict]:
    # SQLAlchemy plain JSON ustunlardagi joyida (in-place) o'zgarishlarni
    # kuzatmaydi, shuning uchun har doim yangi nusxa uzatamiz.
    return [dict(day) for day in days]


def introduced_word_ids(days: list[dict]) -> list[str]:
    # Faqat boshlangan (current/completed) kunlarning yangi so'zlari
    # "tanishtirilgan" hisoblanadi; kelasi locked kunlar kirmaydi.
    return [
        wid
        for day in days
        if day.get("status") in ("current", "completed")
        for wid in day.get("new_word_ids", [])
    ]


def completed_word_ids(days: list[dict]) -> list[str]:
    return [
        wid
        for day in days
        if day.get("status") == "completed"
        for wid in day.get("new_word_ids", [])
    ]


def adaptive_new_quota(scheduled_quota: int, backlog_size: int) -> int:
    if backlog_size >= BACKLOG_PAUSED_THRESHOLD:
        return 0
    if backlog_size >= BACKLOG_REDUCED_THRESHOLD:
        return min(scheduled_quota, REDUCED_NEW_PER_DAY)
    return scheduled_quota


def carryover_quota(backlog_size: int, room: int) -> int:
    if backlog_size <= 0 or room <= 0:
        return 0
    quota = int(math.ceil(backlog_size * CARRYOVER_FRACTION))
    return max(1, min(quota, MAX_REVIEW_WORDS, room))


class PlanService:
    async def level_target_word_ids(self, db: AsyncSession, *, level: str) -> list[str]:
        pool = await word_repository.list_for_level(db, level=level, limit=LEVEL_TARGET_NEW_WORDS)
        if len(pool) < SESSION_TARGET_WORDS:
            pool = await word_repository.list_dictionary_words(db, limit=LEVEL_TARGET_NEW_WORDS)
        if len(pool) < SESSION_TARGET_WORDS:
            pool = await word_repository.list_all(db, limit=LEVEL_TARGET_NEW_WORDS)
        if not pool:
            return []
        return [item.id for item in pool[:LEVEL_TARGET_NEW_WORDS]]

    async def build_90_day_plan(self, db: AsyncSession, *, level: str) -> tuple[list[dict], list[str]]:
        target_ids = await self.level_target_word_ids(db, level=level)
        if not target_ids:
            return [], []

        days = []
        cursor = 0
        for day in range(1, SCHEDULED_DAYS + 1):
            quota = scheduled_new_quota(day)
            new_ids = target_ids[cursor:cursor + quota]
            cursor += len(new_ids)
            days.append(
                {
                    "day": day,
                    "status": "current" if day == 1 else "locked",
                    "word_ids": list(new_ids),
                    "new_word_ids": list(new_ids),
                    "target_new_words": len(target_ids),
                    "sections": {
                        "s1": new_ids[:3],
                        "s2": new_ids[3:5],
                        "s3": new_ids[5:],
                    },
                    "snippets": (
                        [{"sentence": f"Example sentence for {new_ids[0]}", "word_id": new_ids[0]}]
                        if new_ids
                        else []
                    ),
                }
            )
        return days, target_ids

    # Kept for backwards compatibility; new plans are 90 days.
    async def build_30_day_plan(self, db: AsyncSession, *, level: str) -> list[dict]:
        days, _ = await self.build_90_day_plan(db, level=level)
        return days

    async def generate_plan(self, db: AsyncSession, *, user_id: str, level: str) -> StudyPlan:
        days, _ = await self.build_90_day_plan(db, level=level)
        if not days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="В базе данных нет слов для создания плана. Пожалуйста, запустите импорт слов."
            )

        existing = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        payload = {"level": level, "month_index": 0, "start_date": datetime.now(timezone.utc), "days": days}
        if existing is None:
            return await study_plan_repository.create(db, obj_in={"user_id": user_id, **payload})
        flag_modified(existing, "days")
        return await study_plan_repository.update(db, db_obj=existing, obj_in=payload)

    async def get_plan(self, db: AsyncSession, *, user_id: str, error_if_none: bool = True) -> StudyPlan | None:
        plan = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        if plan is None and error_if_none:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Учебный план не найден")
        return plan

    async def word_progress(
        self, db: AsyncSession, *, user_id: str, target_ids: list[str]
    ) -> tuple[dict[str, set[int]], dict[str, list[int]]]:
        correct_days: dict[str, set[int]] = {}
        failed_days: dict[str, list[int]] = {}
        results, _ = await day_result_repository.list_by_user(db, user_id=user_id, skip=0, limit=10000)
        wanted = set(target_ids)
        for result in results:
            for step in (result.step1 or {}, result.step2 or {}):
                for word_id, ok in step.items():
                    if word_id not in wanted:
                        continue
                    if ok:
                        correct_days.setdefault(word_id, set()).add(result.day)
                    else:
                        failed_days.setdefault(word_id, []).append(result.day)
        return correct_days, failed_days

    def backlog_word_ids(
        self,
        *,
        introduced_ids: list[str],
        correct_days: dict[str, set[int]],
        failed_days: dict[str, list[int]],
        current_new_ids: list[str] | None = None,
    ) -> list[str]:
        current_new = set(current_new_ids or [])
        backlog: list[tuple[int, str]] = []
        for word_id in introduced_ids:
            correct = correct_days.get(word_id, set())
            if len(correct) >= MASTERY_CORRECT_DAYS:
                continue
            fails = failed_days.get(word_id, [])
            if fails:
                backlog.append((max(fails), word_id))
            elif not correct and word_id not in current_new:
                # Oldingi kunlarda ko'rib chiqilgan, lekin biror marta ham
                # javob berilmagan so'zlar ham o'rganilmagan hisoblanadi.
                backlog.append((0, word_id))
        backlog.sort(key=lambda item: (item[0], item[1]))
        return [word_id for _, word_id in backlog]

    def compose_session(
        self,
        *,
        new_ids: list[str],
        backlog_ids: list[str],
        weak_ids: list[str],
    ) -> list[str]:
        quota = adaptive_new_quota(len(new_ids), len(backlog_ids))
        session_ids = list(new_ids[:quota])
        room = SESSION_TARGET_WORDS - len(session_ids)
        carry = carryover_quota(len(backlog_ids), room)
        session_ids.extend(backlog_ids[:carry])
        room = SESSION_TARGET_WORDS - len(session_ids)
        if room > 0:
            seen = set(session_ids)
            for word_id in weak_ids:
                if word_id in seen:
                    continue
                session_ids.append(word_id)
                seen.add(word_id)
                if len(session_ids) >= SESSION_TARGET_WORDS:
                    break
        return session_ids

    async def refresh_current_day(
        self, db: AsyncSession, *, plan: StudyPlan, target_ids: list[str]
    ) -> tuple[dict, StudyPlan]:
        # Legacy 30-day plans have no new_word_ids: treat their scheduled words as new.
        for day in plan.days:
            if not day.get("new_word_ids") and day.get("word_ids"):
                day["new_word_ids"] = list(day.get("word_ids", []))
        correct_days, failed_days = await self.word_progress(db, user_id=plan.user_id, target_ids=target_ids)
        current = next((item for item in plan.days if item.get("status") == "current"), None)
        if current is None:
            introduced = introduced_word_ids(plan.days)
            backlog = self.backlog_word_ids(
                introduced_ids=introduced,
                correct_days=correct_days,
                failed_days=failed_days,
                current_new_ids=[],
            )
            if len(introduced) >= len(target_ids) and not backlog and target_ids:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daraja yakunlandi.")
            current = self.append_next_day(plan, introduced=introduced, target_ids=target_ids)

        introduced = introduced_word_ids(plan.days)
        backlog = self.backlog_word_ids(
            introduced_ids=introduced,
            correct_days=correct_days,
            failed_days=failed_days,
            current_new_ids=current.get("new_word_ids", []),
        )

        new_ids = list(current.get("new_word_ids", []))
        backlog_set = set(backlog)
        weak = [
            wid for wid in introduced
            if wid not in set(new_ids)
            and wid not in backlog_set
            and len(correct_days.get(wid, set())) < MASTERY_CORRECT_DAYS
        ]
        session_ids = self.compose_session(new_ids=new_ids, backlog_ids=backlog, weak_ids=weak)
        if not session_ids:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="В текущем дне нет слов для изучения.")
        current["word_ids"] = session_ids
        flag_modified(plan, "days")
        plan = await study_plan_repository.update(db, db_obj=plan, obj_in={"days": days_payload(plan.days)})
        current = next((item for item in plan.days if item.get("status") == "current"), plan.days[0])
        return current, plan

    def append_next_day(
        self, plan: StudyPlan, *, introduced: list[str], target_ids: list[str]
    ) -> dict:
        day_number = max([item.get("day", 0) for item in plan.days] + [0]) + 1
        for item in plan.days:
            if item.get("status") == "current":
                item["status"] = "completed"
        if len(introduced) >= len(target_ids):
            new_ids: list[str] = []
            cleanup = True
        else:
            new_ids = target_ids[len(introduced):len(introduced) + scheduled_new_quota(day_number)]
            cleanup = False
        next_day = {
            "day": day_number,
            "status": "current",
            "word_ids": [],
            "new_word_ids": list(new_ids),
            "target_new_words": len(target_ids),
            "sections": {
                "s1": new_ids[:3],
                "s2": new_ids[3:5],
                "s3": new_ids[5:],
            },
            "snippets": (
                [{"sentence": f"Example sentence for {new_ids[0]}", "word_id": new_ids[0]}]
                if new_ids
                else []
            ),
            "cleanup": cleanup,
        }
        plan.days.append(next_day)
        return next_day

    async def get_current_day_data(self, db: AsyncSession, *, user_id: str, default_level: str = "A1") -> tuple[dict, list[Word]]:
        plan = await self.get_plan(db, user_id=user_id, error_if_none=False)

        # Если плана нет, генерируем его автоматически
        if plan is None:
            plan = await self.generate_plan(db, user_id=user_id, level=default_level)

        if not plan.days:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="В вашем плане нет дней обучения.")

        target_ids = await self.level_target_word_ids(db, level=plan.level)
        if not target_ids:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="В текущем дне нет слов для изучения.")

        current, _ = await self.refresh_current_day(db, plan=plan, target_ids=target_ids)
        words = await word_repository.get_many_by_ids(db, word_ids=current.get("word_ids", [])[:SESSION_TARGET_WORDS])
        words_by_id = {word.id: word for word in words}
        ordered = [words_by_id[word_id] for word_id in current.get("word_ids", []) if word_id in words_by_id]
        if not ordered:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="В текущем дне нет слов для изучения.")
        return current, ordered

    async def advance_plan(self, db: AsyncSession, *, user_id: str, completed_day: int) -> StudyPlan | None:
        plan = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        if plan is None or not plan.days:
            return None
        for day_obj in plan.days:
            if day_obj.get("day") == completed_day:
                day_obj["status"] = "completed"

        target_ids = await self.level_target_word_ids(db, level=plan.level)
        for day_obj in plan.days:
            if not day_obj.get("new_word_ids") and day_obj.get("word_ids"):
                day_obj["new_word_ids"] = list(day_obj.get("word_ids", []))
        introduced = introduced_word_ids(plan.days)
        correct_days, failed_days = await self.word_progress(db, user_id=user_id, target_ids=target_ids)
        backlog = self.backlog_word_ids(
            introduced_ids=introduced,
            correct_days=correct_days,
            failed_days=failed_days,
            current_new_ids=[],
        )
        if len(introduced) >= len(target_ids) and not backlog and target_ids:
            flag_modified(plan, "days")
            plan = await study_plan_repository.update(db, db_obj=plan, obj_in={"days": days_payload(plan.days)})
            return plan

        nxt = next((item for item in plan.days if item.get("status") == "locked"), None)
        if nxt is None:
            nxt = self.append_next_day(plan, introduced=introduced, target_ids=target_ids)
        else:
            nxt["status"] = "current"
        flag_modified(plan, "days")
        return await study_plan_repository.update(db, db_obj=plan, obj_in={"days": days_payload(plan.days)})

    async def remove_plan(self, db: AsyncSession, *, user_id: str) -> None:
        plan = await study_plan_repository.get_by_user_id(db, user_id=user_id)
        if plan is not None:
            await study_plan_repository.remove(db, obj_id=plan.id)
