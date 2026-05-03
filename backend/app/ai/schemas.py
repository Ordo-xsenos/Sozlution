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
