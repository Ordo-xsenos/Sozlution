from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.users.models import Level
from app.users.schemas import UserExport


class TestQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    en: str
    options: dict[str, list[str]]
    correct_index: int


class TestSubmitIn(BaseModel):
    answers: dict[str, int]


class TestSubmitOut(BaseModel):
    score: int
    level: Level


class PlanGenerateIn(BaseModel):
    level: Level


class StudyPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    level: Level
    month_index: int
    start_date: datetime
    days: list[dict[str, Any]]


class WordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    en: str
    uz: str
    ru: str
    ru_description: str
    uz_description: str
    locale_data: dict[str, Any]
    level_tag: Level
    audio_url: str | None = None


class WordAudioOut(BaseModel):
    id: str
    en: str
    audio_path: str | None = None
    audio_url: str | None = None


class DayResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    day: int
    step1: dict[str, bool]
    step2: dict[str, bool]
    step3: dict[str, int]
    accuracy: float
    created_at: datetime


class DayCompleteIn(BaseModel):
    day: int = Field(ge=1)
    step1: dict[str, bool]
    step2: dict[str, bool]
    step3: dict[str, int]


class StatsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    streak: int
    total_words_learned: int
    total_days_done: int
    avg_accuracy: float
    last_activity_date: date | None


class ExportOut(BaseModel):
    user: UserExport
    plan: StudyPlanOut | None
    results: list[DayResultOut]
    stats: StatsOut


class ImportIn(BaseModel):
    user: dict[str, Any]
    plan: dict[str, Any] | None = None
    results: list[dict[str, Any]]
    stats: dict[str, Any]


class OkOut(BaseModel):
    ok: bool = True
