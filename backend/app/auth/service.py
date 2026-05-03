import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.email_service import EmailService
from app.auth.repository import PasswordResetTokenRepository, password_reset_token_repository
from app.auth.schemas import PasswordResetConfirmIn, PasswordResetRequestIn, SessionCreate
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.study.service import StudyService
from app.users.schemas import UserCreate
from app.users.service import UserService


class AuthService:
    def __init__(
        self,
        user_service: UserService,
        study_service: StudyService,
        password_reset_repository: PasswordResetTokenRepository = password_reset_token_repository,
        email_service: EmailService | None = None,
    ):
        self.user_service = user_service
        self.study_service = study_service
        self.password_reset_repository = password_reset_repository
        self.email_service = email_service or EmailService()

    @staticmethod
    def _hash_reset_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @staticmethod
    def _build_reset_url(token: str) -> str:
        base_url = settings.FRONTEND_BASE_URL.rstrip("/")
        return f"{base_url}/reset-password?token={quote(token)}"

    async def create_session(self, db: AsyncSession, payload: SessionCreate):
        if payload.mode == "login":
            user = await self.user_service.get_by_email(db, email=payload.email)
            if user is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Такого пользователя нет")
            if user.password_hash:
                if not verify_password(payload.password, user.password_hash):
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный пароль")
            user = await self.user_service.update_language(db, user=user, lang=payload.lang)
        else:
            user = await self.user_service.create_user(
                db,
                user_in=UserCreate(
                    name=payload.name or "",
                    email=payload.email,
                    password=payload.password,
                    device_id=payload.device_id,
                    lang=payload.lang,
                ),
            )

        await self.study_service.get_or_create_stats(db, user_id=user.id)
        return user, create_access_token(user.id)

    async def request_password_reset(
        self,
        db: AsyncSession,
        payload: PasswordResetRequestIn,
        background_tasks: BackgroundTasks,
    ) -> None:
        user = await self.user_service.get_by_email(db, email=payload.email)
        if user is None:
            return

        raw_token = secrets.token_urlsafe(32)
        token_hash = self._hash_reset_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        )
        await self.password_reset_repository.create(
            db,
            obj_in={
                "user_id": user.id,
                "token_hash": token_hash,
                "expires_at": expires_at,
                "used_at": None,
            },
        )
        background_tasks.add_task(
            self.email_service.send_password_reset_email,
            email=user.email,
            user_name=user.name,
            reset_url=self._build_reset_url(raw_token),
        )

    async def confirm_password_reset(self, db: AsyncSession, payload: PasswordResetConfirmIn) -> None:
        token = await self.password_reset_repository.get_valid_by_hash(
            db,
            token_hash=self._hash_reset_token(payload.token),
        )
        if token is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Токен сброса пароля недействителен или истёк",
            )

        user = await self.user_service.get_by_id(db, user_id=token.user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

        user.password_hash = get_password_hash(payload.password)
        token.used_at = datetime.now(timezone.utc)
        db.add(user)
        db.add(token)
        await db.commit()
