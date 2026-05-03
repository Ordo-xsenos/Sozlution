from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.dependencies.get_db import get_db
from app.study.dependencies import get_study_service
from app.study.repository import word_repository
from app.study.schemas import (
    DayCompleteIn,
    DayResultOut,
    ExportOut,
    ImportIn,
    OkOut,
    PlanGenerateIn,
    StatsOut,
    StudyPlanOut,
    TestQuestionOut,
    TestSubmitIn,
    TestSubmitOut,
    WordAudioOut,
    WordOut,
)
from app.study.service import StudyService
from app.users.models import User


router = APIRouter(tags=["study"])


def _public_audio_url(audio_path: str | None) -> str | None:
    if not audio_path:
        return None
    normalized = audio_path.strip().lstrip("/")
    return f"/{normalized}"


def _resolve_audio_file_path(audio_path: str) -> Path:
    raw = audio_path.strip()
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio path is empty")

    candidate = Path(raw)
    if not candidate.is_absolute():
        candidate = Path.cwd() / raw.lstrip("/")

    resolved = candidate.resolve()
    static_root = (Path.cwd() / "static").resolve()
    try:
        resolved.relative_to(static_root)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audio path") from exc

    return resolved


def serialize_word(word) -> WordOut:
    locale_data = word.locale_data or {}
    return WordOut(
        id=word.id,
        en=word.en,
        uz=locale_data.get("uzbek_translate") or word.uz,
        ru=locale_data.get("russian_translate") or word.ru,
        ru_description=locale_data.get("russian_description") or word.ru,
        uz_description=locale_data.get("uzbek_description") or word.uz,
        locale_data=locale_data,
        level_tag=word.level_tag,
        audio_url=_public_audio_url(word.audio_path),
    )


@router.get("/words/{en}/audio", response_model=WordAudioOut)
async def get_word_audio_metadata(
    en: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    word = await word_repository.get_by_en_ci(db, en=en)
    if word is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    if not word.audio_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio not generated yet")

    return WordAudioOut(
        id=word.id,
        en=word.en,
        audio_path=word.audio_path,
        audio_url=_public_audio_url(word.audio_path),
    )


@router.get("/words/{en}/audio/file")
async def get_word_audio_file(
    en: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    word = await word_repository.get_by_en_ci(db, en=en)
    if word is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    if not word.audio_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio not generated yet")

    file_path = _resolve_audio_file_path(word.audio_path)
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio file missing on disk")

    return FileResponse(
        path=str(file_path),
        media_type="audio/mpeg",
        filename=file_path.name,
    )


@router.get("/test/questions")
async def get_test_questions(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    questions = await service.get_test_questions(db)
    return {"questions": [TestQuestionOut.model_validate(item) for item in questions]}


@router.post("/test/submit", response_model=TestSubmitOut)
async def submit_test(
    payload: TestSubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    score, level = await service.submit_test(db, user=current_user, answers=payload.answers)
    return TestSubmitOut(score=score, level=level)


@router.post("/plan/generate")
async def generate_plan(
    payload: PlanGenerateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    plan = await service.generate_plan(db, user=current_user, level=payload.level.value)
    return {"plan": StudyPlanOut.model_validate(plan)}


@router.get("/plan")
async def get_plan(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    plan = await service.get_plan(db, user_id=current_user.id)
    return {"plan": StudyPlanOut.model_validate(plan)}


@router.get("/day/current")
async def get_day_current(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    day, words = await service.get_current_day(db, user=current_user)
    return {"day": day, "words": [serialize_word(word) for word in words]}


@router.post("/day/complete")
async def complete_day(
    payload: DayCompleteIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    result, stats, plan = await service.complete_day(db, user=current_user, payload=payload)
    return {"result": DayResultOut.model_validate(result), "stats": StatsOut.model_validate(stats), "plan": StudyPlanOut.model_validate(plan) if plan else None}


@router.get("/stats", response_model=StatsOut)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    stats = await service.get_or_create_stats(db, user_id=current_user.id)
    return stats


@router.get("/results")
async def get_results(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    results, total = await service.get_results(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return {
        "items": [DayResultOut.model_validate(r) for r in results],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/export")
async def export_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    return ExportOut.model_validate(await service.export_data(db, user=current_user))


@router.post("/import", response_model=OkOut)
async def import_data(
    payload: ImportIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    await service.import_data(db, user=current_user, payload=payload)
    return OkOut()


@router.post("/reset-progress", response_model=OkOut)
async def reset_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: StudyService = Depends(get_study_service),
):
    await service.reset_progress(db, user=current_user)
    return OkOut()
