from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import PasswordResetToken
from app.repositories.base import CRUDBase


class PasswordResetTokenRepository(CRUDBase[PasswordResetToken, dict, dict]):
    async def get_valid_by_hash(self, db: AsyncSession, *, token_hash: str) -> PasswordResetToken | None:
        result = await db.execute(
            select(PasswordResetToken)
            .where(PasswordResetToken.token_hash == token_hash)
            .where(PasswordResetToken.used_at.is_(None))
            .where(PasswordResetToken.expires_at > datetime.now(timezone.utc))
            .order_by(PasswordResetToken.created_at.desc())
        )
        return result.scalars().first()


password_reset_token_repository = PasswordResetTokenRepository(PasswordResetToken)
