from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # Игнорировать лишние переменные в .env
    )

    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Sozlution Backend"
    BACKEND_CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000"],
        description="Список разрешенных CORS origins"
    )
    SECRET_KEY: str = "dev-only-secret-key-change-in-production-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    POSTGRES_DSN: str = ""
    SQLITE_DATABASE_URI: str = "sqlite+aiosqlite:///./app.db.sqlite3"
    ENABLE_SQLITE_FALLBACK: bool = True
    
    # Frontend
    FRONTEND_BASE_URL: str = "*"
    
    # Email / SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Sozlution"
    SMTP_USE_TLS: bool = True
    
    # AI - OpenAI Proxy
    AI_API_KEY: str = ""
    AI_API_URL: str = ""
    AI_MODEL: str = ""

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError(
                "SECRET_KEY должен быть установлен и иметь минимум 32 символа. "
                "Сгенерируйте ключ: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )
        # Проверка на старое дефолтное значение
        if v == "sozlution-super-secret-key-for-production":
            raise ValueError(
                "Нельзя использовать дефолтный SECRET_KEY в production. "
                "Установите уникальный ключ через переменную окружения."
            )
        return v

    def get_database_candidates(self) -> list[str]:
        candidates: list[str] = []
        if self.POSTGRES_DSN:
            dsn = self.POSTGRES_DSN
            if dsn.startswith("postgresql://"):
                dsn = dsn.replace("postgresql://", "postgresql+asyncpg://", 1)
            candidates.append(dsn)
        if self.ENABLE_SQLITE_FALLBACK:
            candidates.append(self.SQLITE_DATABASE_URI)
        return candidates


settings = Settings()
