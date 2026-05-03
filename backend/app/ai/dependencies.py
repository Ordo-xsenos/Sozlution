from app.ai.service import AIService


ai_service = AIService()


def get_ai_service() -> AIService:
    return ai_service
