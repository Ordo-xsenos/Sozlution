from fastapi import APIRouter

from app.ai.router import router as ai_router
from app.auth.router import router as auth_router
from app.ielts.router import router as ielts_router
from app.study.router import router as study_router
from app.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(study_router)
api_router.include_router(ai_router)
api_router.include_router(ielts_router)
