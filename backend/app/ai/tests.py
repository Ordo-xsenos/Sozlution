import asyncio

from app.ai.dependencies import ai_service


def test_ai_word_assist_endpoint(client, registered_user):
    response = client.post(
        "/api/v1/ai/word-assist",
        headers=registered_user,
        json={"word": "test", "lang": "ru", "word_id": "dict-1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "translation" in data
    assert "description" in data
    assert data["translation"] == "перевод"


def test_ai_chat_endpoint(client, registered_user):
    response = client.post(
        "/api/v1/ai/chat",
        headers=registered_user,
        json={"message": "Hello AI"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["text"] == "stubbed-ai-chat"


def test_ai_service_enrich_fallback():
    result = asyncio.run(ai_service.word_full_enrich(word="apple"))
    assert result is None or isinstance(result, dict)
