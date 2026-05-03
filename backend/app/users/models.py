import enum
import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.base import TimestampedModel


class Language(str, enum.Enum):
    UZ = "uz"
    RU = "ru"


class Level(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"


class User(Base, TimestampedModel):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid.uuid4().hex)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    lang: Mapped[str] = mapped_column(String(2), nullable=False, default=Language.UZ.value)
    level: Mapped[str] = mapped_column(String(2), nullable=False, default=Level.A1.value)
    device_id: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False, default="")

    stats = relationship("Stats", uselist=False, back_populates="user")
    plan = relationship("StudyPlan", uselist=False, back_populates="user")
    results = relationship("DayResult", back_populates="user")
