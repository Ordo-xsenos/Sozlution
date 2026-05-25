from typing import Any

from pydantic import BaseModel, Field


class AiSnippetsIn(BaseModel):
    words: list[dict[str, Any]]


class AiChatTurn(BaseModel):
    role: str = "user"
    text: str = ""


class AiChatIn(BaseModel):
    message: str
    history: list[AiChatTurn] = Field(default_factory=list)


class AiChatOut(BaseModel):
    text: str


class AiWordAssistIn(BaseModel):
    word_id: str = ""
    word: str = Field(max_length=120)
    lang: str
    hint: str = ""


class AiWordAssistOut(BaseModel):
    translation: str
    description: str
    level: str = "B1"


class AiWordFullOut(BaseModel):
    en_description: str
    ru_translation: str
    ru_description: str
    uz_translation: str
    uz_description: str
    level: str = "B1"


class AiTutorResponse(BaseModel):
    explanation: str = Field(description="Main response text or explanation in user's language")
    corrections: list[str] = Field(default_factory=list, description="List of corrections for user's grammar/vocabulary mistakes")
    suggestions: list[str] = Field(default_factory=list, description="3 Power Words or advanced synonyms")
    ielts_score: float | None = Field(default=None, description="Estimated IELTS band score for the user's input if applicable")
