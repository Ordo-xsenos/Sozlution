import uuid
from datetime import date, datetime

from sqlalchemy import JSON, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.base import TimestampedModel


class Word(Base, TimestampedModel):
    __tablename__ = "words"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    en: Mapped[str] = mapped_column(String(255), nullable=False, index=True, unique=True)
    uz: Mapped[str] = mapped_column(String(255), nullable=False)
    ru: Mapped[str] = mapped_column(String(255), nullable=False)
    locale_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    level_tag: Mapped[str] = mapped_column(String(2), nullable=False, default="A1", index=True)
    audio_path: Mapped[str | None] = mapped_column(String(255), nullable=True)


class TestQuestion(Base, TimestampedModel):
    __tablename__ = "test_questions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    en: Mapped[str] = mapped_column(String(255), nullable=False)
    options: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    correct_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class StudyPlan(Base, TimestampedModel):
    __tablename__ = "study_plans"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid.uuid4().hex)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, unique=True)
    level: Mapped[str] = mapped_column(String(2), nullable=False, default="A1")
    month_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    days: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    user = relationship("User", back_populates="plan")


class DayResult(Base, TimestampedModel):
    __tablename__ = "day_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    day: Mapped[int] = mapped_column(Integer, nullable=False)
    step1: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    step2: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    step3: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    user = relationship("User", back_populates="results")

    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_day_results_user_day"),)


class Stats(Base, TimestampedModel):
    __tablename__ = "stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, unique=True)
    streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_words_learned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_days_done: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    avg_accuracy: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    user = relationship("User", back_populates="stats")
