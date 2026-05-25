import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.dependencies import get_ai_service
from app.ai.schemas import AiChatIn, AiChatOut, AiSnippetsIn, AiWordAssistIn, AiWordAssistOut
from app.ai.service import AIService
from app.auth.dependencies import get_current_user
from app.dependencies.get_db import get_db
from app.study.dependencies import get_study_service
from app.study.service import StudyService
from app.users.models import User


router = APIRouter(tags=["ai"])


@router.post("/ai/snippets")
async def ai_snippets(payload: AiSnippetsIn, _: User = Depends(get_current_user)):
    snippets = [
        {"sentence": f"Use '{word.get('en', 'word')}' in a daily conversation.", "word_id": word.get("id", str(uuid.uuid4()))}
        for word in payload.words[:10]
    ]
    return {"snippets": snippets}


@router.post("/ai/chat", response_model=AiChatOut)
async def ai_chat(
    payload: AiChatIn,
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service),
):
    text = await service.chat(message=payload.message, history=[item.model_dump() for item in payload.history], lang=current_user.lang)
    return AiChatOut(text=text)


@router.post("/ai/chat-stream")
async def ai_chat_stream(
    payload: AiChatIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AIService = Depends(get_ai_service),
):
    return StreamingResponse(
        service.stream_chat(
            db=db,
            user_id=current_user.id,
            message=payload.message,
            history=[item.model_dump() for item in payload.history],
            lang=current_user.lang,
        ),
        media_type="text/event-stream",
    )


@router.post("/ai/word-assist", response_model=AiWordAssistOut)
async def ai_word_assist(
    payload: AiWordAssistIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
    study_service: StudyService = Depends(get_study_service),
):
    data = await ai_service.word_assist(word=payload.word, lang=payload.lang, hint=payload.hint)
    await study_service.update_word_assist(
        db,
        word_id=payload.word_id.strip(),
        lang=payload.lang,
        translation=data["translation"],
        description=data["description"],
    )
    return AiWordAssistOut(**data)
