from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class IELTSWordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    en: str
    ru: str
    uz: str
    definition: str
    transcription: str | None
    topic: str
    example: str


class IELTSWritingTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    prompt: str
    image_url: str | None
    min_words: int
    time_limit: int


class IELTSWritingEvaluateIn(BaseModel):
    task_id: str
    content: str


class IELTSCriteriaDetail(BaseModel):
    score: float
    feedback: str


class IELTSWritingEvaluateOut(BaseModel):
    overall_band: float
    criteria: dict[str, IELTSCriteriaDetail]
    improvement_suggestions: list[str]


class IELTSMockTestListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    type: str
    difficulty: str


class IELTSMockTestQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    text: str
    options: list[str] | None = None


class IELTSMockTestSectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content: str
    questions: list[IELTSMockTestQuestionOut]


class IELTSMockTestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sections: list[IELTSMockTestSectionOut]


class IELTSMockTestSubmitIn(BaseModel):
    answers: dict[str, str]


class IELTSMockTestSubmitOut(BaseModel):
    correct_count: int
    total_questions: int
    band_score: float


class IELTSStatsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    estimated_band: float
    target_band: float
    writing_tasks_completed: int
    vocabulary_mastered: int
    mock_tests_count: int
    activity_heatmap: dict[str, int] = Field(default_factory=dict)
