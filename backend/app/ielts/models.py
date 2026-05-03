import uuid
from sqlalchemy import JSON, Float, ForeignKey, Integer, String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.base import TimestampedModel


class IELTSWord(Base, TimestampedModel):
    __tablename__ = "ielts_words"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    en: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    ru: Mapped[str] = mapped_column(String(255), nullable=False)
    uz: Mapped[str] = mapped_column(String(255), nullable=False)
    definition: Mapped[str] = mapped_column(String(1000), nullable=False)
    transcription: Mapped[str | None] = mapped_column(String(255), nullable=True)
    topic: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    example: Mapped[str] = mapped_column(String(1000), nullable=False)


class IELTSWritingTask(Base, TimestampedModel):
    __tablename__ = "ielts_writing_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    prompt: Mapped[str] = mapped_column(String(2000), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)  # task1, task2
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    min_words: Mapped[int] = mapped_column(Integer, nullable=False)
    time_limit: Mapped[int] = mapped_column(Integer, nullable=False)  # in minutes


class IELTSWritingAttempt(Base, TimestampedModel):
    __tablename__ = "ielts_writing_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    task_id: Mapped[str] = mapped_column(ForeignKey("ielts_writing_tasks.id"), nullable=False)
    content: Mapped[str] = mapped_column(String(10000), nullable=False)
    overall_band: Mapped[float] = mapped_column(Float, nullable=False)
    criteria: Mapped[dict] = mapped_column(JSON, nullable=False)
    suggestions: Mapped[list] = mapped_column(JSON, nullable=False)

    user = relationship("User")
    task = relationship("IELTSWritingTask")


class IELTSMockTest(Base, TimestampedModel):
    __tablename__ = "ielts_mock_tests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # reading, listening
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)

    sections = relationship("IELTSMockTestSection", back_populates="test", cascade="all, delete-orphan")


class IELTSMockTestSection(Base, TimestampedModel):
    __tablename__ = "ielts_mock_test_sections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id: Mapped[str] = mapped_column(ForeignKey("ielts_mock_tests.id"), nullable=False)
    content: Mapped[str] = mapped_column(String(10000), nullable=False)  # text or audio_url

    test = relationship("IELTSMockTest", back_populates="sections")
    questions = relationship("IELTSMockTestQuestion", back_populates="section", cascade="all, delete-orphan")


class IELTSMockTestQuestion(Base, TimestampedModel):
    __tablename__ = "ielts_mock_test_questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    section_id: Mapped[str] = mapped_column(ForeignKey("ielts_mock_test_sections.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # multiple_choice, etc.
    text: Mapped[str] = mapped_column(String(1000), nullable=False)
    options: Mapped[list | None] = mapped_column(JSON, nullable=True)
    correct_answer: Mapped[str] = mapped_column(String(500), nullable=False)

    section = relationship("IELTSMockTestSection", back_populates="questions")


class IELTSMockTestAttempt(Base, TimestampedModel):
    __tablename__ = "ielts_mock_test_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    test_id: Mapped[str] = mapped_column(ForeignKey("ielts_mock_tests.id"), nullable=False)
    answers: Mapped[dict] = mapped_column(JSON, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    band_score: Mapped[float] = mapped_column(Float, nullable=False)

    user = relationship("User")
    test = relationship("IELTSMockTest")


class IELTSStats(Base, TimestampedModel):
    __tablename__ = "ielts_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, unique=True, index=True)
    estimated_band: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    target_band: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    writing_tasks_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vocabulary_mastered: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mock_tests_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    user = relationship("User")
