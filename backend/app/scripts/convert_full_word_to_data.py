import argparse
import json
import logging
from pathlib import Path
from typing import Any

from app.ai.service import AIService


logger = logging.getLogger(__name__)

DEFAULT_FULL_WORD_PATH = Path("full-word.json")
DEFAULT_OUTPUT_PATH = Path("data.generated.json")
PROGRESS_EVERY = 100
VALID_LEVELS = {"A1", "A2", "B1", "B2", "C1", "C2"}


def normalize_word_key(value: str) -> str:
    return value.strip().casefold()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path: Path, payload: Any) -> None:
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
        file.write("\n")


def clean_examples(examples: list[Any], *, limit: int = 3) -> list[str]:
    cleaned: list[str] = []
    for example in examples:
        text = str(example).strip()
        if text:
            cleaned.append(" ".join(text.split()))
        if len(cleaned) >= limit:
            break
    return cleaned


def build_hint(value: dict[str, Any]) -> str:
    parts: list[str] = []
    word_type = str(value.get("type", "")).strip()
    if word_type:
        parts.append(f"Dictionary type: {word_type}.")

    examples = clean_examples(value.get("examples", []), limit=2)
    if examples:
        parts.append(f"Examples: {' | '.join(examples)}")

    phonetics = value.get("phonetics", {}) or {}
    us = str(phonetics.get("us", "")).strip()
    uk = str(phonetics.get("uk", "")).strip()
    if us or uk:
        parts.append(f"Phonetics: US {us or '-'}, UK {uk or '-'}.")

    return " ".join(parts).strip()


def sanitize_level(level: str) -> str:
    normalized = str(level).strip().upper()
    return normalized if normalized in VALID_LEVELS else "B1"


def build_fallback_en_description(word: str, value: dict[str, Any], hint: str) -> str:
    word_type = str(value.get("type", "")).strip()
    if word_type:
        return f"{word} is an English {word_type}."
    if hint:
        return hint
    return f"A learner-friendly explanation for '{word}'."


def build_locale_data(
    value: dict[str, Any],
    enriched: dict[str, Any],
    *,
    word: str,
    hint: str,
) -> dict[str, Any]:
    phonetics = value.get("phonetics", {}) or {}
    return {
        "definitions": {
            "en": str(enriched.get("en_description") or build_fallback_en_description(word, value, hint)),
            "ru": str(enriched.get("ru_description") or hint or word),
            "uz": str(enriched.get("uz_description") or hint or word),
        },
        "examples": clean_examples(value.get("examples", [])),
        "phonetics": {
            "us": str(phonetics.get("us", "")).strip(),
            "uk": str(phonetics.get("uk", "")).strip(),
        },
    }


def convert_full_word_entry(entry: dict[str, Any], ai_service: AIService) -> dict[str, Any]:
    value = entry.get("value", {}) or {}
    word = str(value.get("word", "")).strip()
    if not word:
        raise ValueError("full-word entry is missing value.word")

    source_level = sanitize_level(str(value.get("level", "")))
    hint = build_hint(value)
    enriched = ai_service.word_full_enrich(word=word, hint=hint, level=source_level)

    return {
        "en": word,
        "ru": str(enriched.get("ru_translation") or word),
        "uz": str(enriched.get("uz_translation") or word),
        "level_tag": sanitize_level(str(enriched.get("level") or source_level)),
        "locale_data": build_locale_data(value, enriched, word=word, hint=hint),
    }


def validate_data_items(items: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    for index, item in enumerate(items):
        prefix = f"item[{index}]"
        for field_name in ("en", "ru", "uz", "level_tag", "locale_data"):
            if field_name not in item:
                errors.append(f"{prefix}: missing '{field_name}'")
        if errors and errors[-1].startswith(prefix):
            continue

        level_tag = str(item.get("level_tag", "")).strip().upper()
        if level_tag not in VALID_LEVELS:
            errors.append(f"{prefix}: invalid level_tag '{item.get('level_tag')}'")

        locale_data = item.get("locale_data")
        if not isinstance(locale_data, dict):
            errors.append(f"{prefix}: locale_data must be an object")
            continue

        definitions = locale_data.get("definitions")
        examples = locale_data.get("examples")
        phonetics = locale_data.get("phonetics")

        if not isinstance(definitions, dict):
            errors.append(f"{prefix}: locale_data.definitions must be an object")
        else:
            for lang in ("en", "ru", "uz"):
                if not str(definitions.get(lang, "")).strip():
                    errors.append(f"{prefix}: locale_data.definitions.{lang} is required")

        if not isinstance(examples, list):
            errors.append(f"{prefix}: locale_data.examples must be a list")

        if not isinstance(phonetics, dict):
            errors.append(f"{prefix}: locale_data.phonetics must be an object")
        else:
            for accent in ("us", "uk"):
                if accent not in phonetics:
                    errors.append(f"{prefix}: locale_data.phonetics.{accent} is required")
    return errors


def convert_full_word(
    full_items: list[dict[str, Any]],
    ai_service: AIService,
    *,
    limit: int | None = None,
) -> tuple[list[dict[str, Any]], int]:
    seen_words: set[str] = set()
    generated_items: list[dict[str, Any]] = []
    processed = 0

    for entry in full_items:
        value = entry.get("value", {}) or {}
        word = str(value.get("word", "")).strip()
        if not word:
            continue

        normalized_word = normalize_word_key(word)
        if normalized_word in seen_words:
            continue

        generated_items.append(convert_full_word_entry(entry, ai_service))
        seen_words.add(normalized_word)
        processed += 1

        if processed % PROGRESS_EVERY == 0:
            logger.info("Generated %s dictionary entries", processed)

        if limit is not None and processed >= limit:
            break

    return generated_items, processed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert full-word.json into data.json-compatible payload.")
    parser.add_argument("--full-word-path", default=str(DEFAULT_FULL_WORD_PATH), help="Path to source full-word.json file.")
    parser.add_argument("--output-path", default=str(DEFAULT_OUTPUT_PATH), help="Path to generated output JSON file.")
    parser.add_argument("--limit", type=int, default=None, help="Optional limit for newly generated records.")
    return parser.parse_args()


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    args = parse_args()

    full_word_path = Path(args.full_word_path)
    output_path = Path(args.output_path)

    full_items = load_json(full_word_path)

    ai_service = AIService()
    result_items, generated_count = convert_full_word(full_items, ai_service, limit=args.limit)
    validation_errors = validate_data_items(result_items)
    if validation_errors:
        for error in validation_errors[:20]:
            logger.error(error)
        raise SystemExit(f"Validation failed with {len(validation_errors)} error(s).")

    save_json(output_path, result_items)
    logger.info("Saved %s items to %s", len(result_items), output_path)
    logger.info("Generated %s entries from %s", generated_count, full_word_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
