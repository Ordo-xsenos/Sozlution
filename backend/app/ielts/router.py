from typing import Literal
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.dependencies.get_db import get_db
from app.users.models import User
from app.ielts.dependencies import get_ielts_service
from app.ielts.service import IELTSService
from app.ielts.schemas import (
    IELTSWordOut,
    IELTSWritingTaskOut,
    IELTSWritingEvaluateIn,
    IELTSWritingEvaluateOut,
    IELTSMockTestListOut,
    IELTSMockTestOut,
    IELTSMockTestSubmitIn,
    IELTSMockTestSubmitOut,
    IELTSStatsOut
)

router = APIRouter(prefix="/ielts-mode", tags=["ielts-mode"])


@router.get("/vocabulary", response_model=list[IELTSWordOut])
async def get_vocabulary(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
    service: IELTSService = Depends(get_ielts_service),
):
    words = await service.get_vocabulary(db, limit=limit)
    return [IELTSWordOut.model_validate(w) for w in words]


@router.get("/writing/tasks", response_model=IELTSWritingTaskOut)
async def get_writing_task(
    type: Literal["task1", "task2"] = Query(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
    service: IELTSService = Depends(get_ielts_service),
):
    task = await service.get_writing_tasks(db, task_type=type)
    if not task:
        raise HTTPException(status_code=404, detail="No tasks found for this type")
    return IELTSWritingTaskOut.model_validate(task)


@router.post("/writing/evaluate", response_model=IELTSWritingEvaluateOut)
async def evaluate_writing(
    payload: IELTSWritingEvaluateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: IELTSService = Depends(get_ielts_service),
):
    evaluation = await service.evaluate_writing(
        db, user_id=current_user.id, task_id=payload.task_id, content=payload.content
    )
    return IELTSWritingEvaluateOut(**evaluation)


@router.get("/mock-tests", response_model=list[IELTSMockTestListOut])
async def list_mock_tests(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
    service: IELTSService = Depends(get_ielts_service),
):
    tests = await service.list_mock_tests(db)
    return [IELTSMockTestListOut.model_validate(t) for t in tests]


@router.get("/mock-tests/{id}", response_model=IELTSMockTestOut)
async def get_mock_test(
    id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
    service: IELTSService = Depends(get_ielts_service),
):
    test = await service.get_mock_test(db, test_id=id)
    return IELTSMockTestOut.model_validate(test)


@router.post("/mock-tests/{id}/submit", response_model=IELTSMockTestSubmitOut)
async def submit_mock_test(
    id: str,
    payload: IELTSMockTestSubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: IELTSService = Depends(get_ielts_service),
):
    result = await service.submit_mock_test(
        db, user_id=current_user.id, test_id=id, answers=payload.answers
    )
    return IELTSMockTestSubmitOut(**result)


@router.get("/stats", response_model=IELTSStatsOut)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: IELTSService = Depends(get_ielts_service),
):
    stats = await service.get_or_create_stats(db, user_id=current_user.id)
    # Heatmap calculation can be added here or in service. Returning empty for now.
    return IELTSStatsOut.model_validate(stats)
