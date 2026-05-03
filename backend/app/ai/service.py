import json
import logging
import httpx
from typing import Any
from urllib.parse import urljoin
from pydantic import ValidationError

from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    @staticmethod
    def _extract_json_object(raw_text: str) -> str:
        """Извлекает JSON объект из строки, если AI вернул лишний текст или markdown."""
        start = raw_text.find("{")
        end = raw_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return raw_text[start : end + 1]
        return raw_text

    def _openai_base_url(self) -> str:
        raw = (settings.AI_API_URL or "").strip()
        if not raw:
            return ""
        if raw.endswith("/models"):
            raw = raw[: -len("/models")]
        if not raw.endswith("/"):
            raw += "/"
        return raw

    async def _openai_chat_json(self, *, api_key: str, model: str, prompt: str) -> str:
        base = self._openai_base_url()
        if not base:
            raise RuntimeError("AI_API_URL is not configured")
        payload = {
            "model": model or "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 1000,
            "response_format": {"type": "json_object"},
        }
        url = urljoin(base, "chat/completions")
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            choices = data.get("choices", []) or []
            message = (choices[0] or {}).get("message", {}) if choices else {}
            return str((message or {}).get("content", "")).strip()

    async def _openai_chat_text(
        self,
        *,
        api_key: str,
        model: str,
        messages: list[dict[str, str]],
        temperature: float,
        max_tokens: int,
    ) -> str:
        base = self._openai_base_url()
        if not base:
            raise RuntimeError("AI_API_URL is not configured")
        payload = {
            "model": model or "gpt-3.5-turbo",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        url = urljoin(base, "chat/completions")
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            choices = data.get("choices", []) or []
            message = (choices[0] or {}).get("message", {}) if choices else {}
            return str((message or {}).get("content", "")).strip()

    async def chat(self, *, message: str, history: list[dict], lang: str) -> str:
        api_key = (settings.AI_API_KEY or "").strip()
        if not api_key:
            return "AI coach is not configured. Add AI_API_KEY for backend runtime."
        
        system_prompt = (
            "You are So'zlution AI English tutor. You only answer about English learning, "
            "vocabulary practice, IELTS prep, and using So'zlution MVP. "
            "If asked unrelated topics, refuse briefly and redirect to English learning. "
            "Keep answers concise and practical with mini examples. "
            "Respond in Russian if user uses Russian, Uzbek if user uses Uzbek, otherwise English."
        )

        messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
        for turn in history[-6:]:
            role = "user" if str(turn.get("role", "user")).lower() == "user" else "assistant"
            text = str(turn.get("text", "")).strip()
            if text:
                messages.append({"role": role, "content": text})
        messages.append({"role": "user", "content": message})

        try:
            return await self._openai_chat_text(
                api_key=api_key,
                model=settings.AI_MODEL,
                messages=messages,
                temperature=0.4,
                max_tokens=500,
            )
        except (httpx.HTTPError, httpx.TimeoutException) as exc:
            logger.error(f"AI Chat HTTP error: {exc}", exc_info=True)
            return "Извините, AI временно недоступен. Попробуйте позже."
        except Exception as exc:
            logger.exception(f"Unexpected AI Chat error: {exc}")
            return "Извините, произошла ошибка. Попробуйте позже."

    async def word_full_enrich(self, *, word: str, hint: str = "", level: str = "") -> dict[str, Any]:
        from app.ai.schemas import AiWordFullOut

        api_key = (settings.AI_API_KEY or "").strip()
        if not api_key:
            return {
                "en_description": hint or f"Concise definition for '{word}'.",
                "ru_translation": word, "ru_description": hint or word,
                "uz_translation": word, "uz_description": hint or word,
                "level": level or "B1"
            }

        prompt = (
            f"Return strict JSON with full enrichment for English word '{word}'.\n"
            "Required keys:\n"
            "- en_description: concise English learner-friendly definition\n"
            "- ru_translation: Russian translation (1-3 words)\n"
            "- ru_description: concise Russian definition\n"
            "- uz_translation: Uzbek translation (1-3 words)\n"
            "- uz_description: concise Uzbek definition\n"
            "- level: CEFR level (A1, A2, B1, B2, C1, or C2)\n"
            "No markdown, no extra keys."
        )
        if hint:
            prompt += f"\nContext from dictionary: {hint}"

        try:
            content = await self._openai_chat_json(api_key=api_key, model=settings.AI_MODEL, prompt=prompt)
            parsed = AiWordFullOut.model_validate_json(self._extract_json_object(content))
            return parsed.model_dump()
        except (httpx.HTTPError, json.JSONDecodeError, ValidationError) as exc:
            logger.error(f"AI Enrichment error: {exc}", exc_info=True)
            return {
                "en_description": hint or f"Definition for '{word}'",
                "ru_translation": word, "ru_description": hint or word,
                "uz_translation": word, "uz_description": hint or word,
                "level": level or "B1"
            }
        except Exception as exc:
            logger.exception(f"Unexpected AI Enrichment error: {exc}")
            return {
                "en_description": hint or f"Definition for '{word}'",
                "ru_translation": word, "ru_description": hint or word,
                "uz_translation": word, "uz_description": hint or word,
                "level": level or "B1"
            }

    async def word_assist(self, *, word: str, lang: str, hint: str) -> dict[str, str]:
        from app.ai.schemas import AiWordAssistOut

        api_key = (settings.AI_API_KEY or "").strip()
        if not api_key:
            return {"translation": hint or word, "description": hint or word, "level": "B1"}

        target_lang = "Russian" if lang == "ru" else "Uzbek"
        prompt = (
            f"Return strict JSON with keys translation, description, and level for English word '{word}'. "
            f"Language for both translation and description fields: {target_lang}. "
            "No markdown, no extra keys."
        )

        try:
            content = await self._openai_chat_json(api_key=api_key, model=settings.AI_MODEL, prompt=prompt)
            parsed = AiWordAssistOut.model_validate_json(self._extract_json_object(content))
            return {"translation": parsed.translation, "description": parsed.description, "level": parsed.level}
        except (httpx.HTTPError, json.JSONDecodeError, ValidationError) as exc:
            logger.error(f"AI Word Assist error: {exc}", exc_info=True)
            return {"translation": hint or word, "description": hint or word, "level": "B1"}
        except Exception as exc:
            logger.exception(f"Unexpected AI Word Assist error: {exc}")
            return {"translation": hint or word, "description": hint or word, "level": "B1"}

    async def evaluate_ielts_writing(self, *, task_prompt: str, content: str) -> dict[str, Any]:
        api_key = (settings.AI_API_KEY or "").strip()
        if not api_key:
            return {
                "overall_band": 0.0,
                "criteria": {"task_response": {"score": 0.0, "feedback": "AI evaluation unavailable"}},
                "improvement_suggestions": ["Configure AI_API_KEY to enable evaluations"]
            }

        prompt = (
            "You are an expert IELTS examiner. Evaluate the following essay based on IELTS criteria.\n"
            f"Task Prompt: {task_prompt}\n"
            f"User Content: {content}\n\n"
            "Return strict JSON with keys: overall_band (float), criteria (object with score/feedback for task_response, "
            "coherence_cohesion, lexical_resource, grammatical_range_accuracy), and improvement_suggestions (list of strings)."
        )

        try:
            raw_content = await self._openai_chat_json(api_key=api_key, model=settings.AI_MODEL, prompt=prompt)
            return json.loads(self._extract_json_object(raw_content))
        except (httpx.HTTPError, json.JSONDecodeError) as exc:
            logger.error(f"IELTS Evaluation error: {exc}", exc_info=True)
            return {
                "overall_band": 0.0,
                "criteria": {"task_response": {"score": 0.0, "feedback": "Error connecting to AI"}},
                "improvement_suggestions": ["Please try again later"]
            }
        except Exception as exc:
            logger.exception(f"Unexpected IELTS Evaluation error: {exc}")
            return {
                "overall_band": 0.0,
                "criteria": {"task_response": {"score": 0.0, "feedback": "Error connecting to AI"}},
                "improvement_suggestions": ["Please try again later"]
            }
