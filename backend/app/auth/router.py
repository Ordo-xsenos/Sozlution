from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.email_service import email_service
from app.auth.schemas import (
    PasswordResetConfirmIn,
    PasswordResetRequestIn,
    SessionCreate,
    SessionResponse,
)
from app.auth.service import AuthService
from app.dependencies.get_db import get_db
from app.study.dependencies import get_study_service
from app.study.schemas import OkOut
from app.study.service import StudyService
from app.users.dependencies import get_user_service
from app.users.service import UserService


router = APIRouter(tags=["auth"])


def get_auth_service(
    user_service: UserService = Depends(get_user_service),
    study_service: StudyService = Depends(get_study_service),
) -> AuthService:
    return AuthService(
        user_service=user_service,
        study_service=study_service,
        email_service=email_service,
    )


@router.post("/session", response_model=SessionResponse)
async def create_session(
    payload: SessionCreate,
    db: AsyncSession = Depends(get_db),
    service: AuthService = Depends(get_auth_service),
):
    user, token = await service.create_session(db, payload)
    return SessionResponse(user=user, session_token=token)


@router.post("/password-reset/request", response_model=OkOut)
async def request_password_reset(
    payload: PasswordResetRequestIn,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    service: AuthService = Depends(get_auth_service),
):
    await service.request_password_reset(db, payload, background_tasks)
    return OkOut()


@router.post("/password-reset/confirm", response_model=OkOut)
async def confirm_password_reset(
    payload: PasswordResetConfirmIn,
    db: AsyncSession = Depends(get_db),
    service: AuthService = Depends(get_auth_service),
):
    await service.confirm_password_reset(db, payload)
    return OkOut()
