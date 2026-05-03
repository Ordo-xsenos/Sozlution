from app.ielts.service import IELTSService
from app.ai.dependencies import get_ai_service
from app.ai.service import AIService
from fastapi import Depends

def get_ielts_service(ai_service: AIService = Depends(get_ai_service)) -> IELTSService:
    return IELTSService(ai_service=ai_service)
