from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.dependencies.get_db import get_db
from app.users.dependencies import get_user_service
from app.users.models import User
from app.users.schemas import UserPublic, UserResponse, UserUpdate
from app.users.service import UserService


router = APIRouter(tags=["users"])


@router.get("/user", response_model=UserResponse)
async def get_user(current_user: User = Depends(get_current_user)):
    return UserResponse(user=UserPublic.model_validate(current_user))


@router.patch("/user", response_model=UserResponse)
async def patch_user(
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    user = await service.update_user(db, user=current_user, user_in=payload)
    return UserResponse(user=UserPublic.model_validate(user))
