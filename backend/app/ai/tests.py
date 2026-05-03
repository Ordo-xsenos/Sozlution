import pytest
from app.ai.dependencies import ai_service


def test_ai_assist_endpoint(client, registered_user):
    response = client.post(
        "/api/v1/ai/assist",
        headers=registered_user,
        json={"word": "test", "lang": "ru"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "translation" in data
    assert "description" in data
    # Value from conftest.py mock_ai fixture
    assert data["translation"] == "перевод"


def test_ai_chat_endpoint(client, registered_user):
    response = client.post(
        "/api/v1/ai/chat",
        headers=registered_user,
        json={"message": "Hello AI"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "stubbed-ai-chat"


@pytest.mark.asyncio
async def test_ai_service_enrich_fallback():
    # Test service directly if AI is not configured
    # This assumes AIService handles missing keys gracefully
    result = await ai_service.word_full_enrich("apple")
    assert result is None or isinstance(result, dict)
