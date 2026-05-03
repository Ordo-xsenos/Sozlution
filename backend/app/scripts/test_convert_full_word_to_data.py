from app.scripts.convert_full_word_to_data import (
    convert_full_word_entry,
    convert_full_word,
    validate_data_items,
)


class StubAIService:
    def word_full_enrich(self, *, word: str, hint: str = "", level: str = "") -> dict:
        return {
            "en_description": f"{word} in English",
            "ru_translation": f"{word}-ru",
            "ru_description": f"{word} описание",
            "uz_translation": f"{word}-uz",
            "uz_description": f"{word} tavsifi",
            "level": level or "B1",
        }


def test_convert_full_word_entry_maps_to_data_schema():
    entry = {
        "id": 1,
        "value": {
            "word": "ability",
            "type": "noun",
            "level": "A2",
            "phonetics": {"us": "/əˈbɪləti/", "uk": "/əˈbɪləti/"},
            "examples": ["the ability to adapt", "lose the ability to communicate"],
        },
    }

    converted = convert_full_word_entry(entry, StubAIService())

    assert converted["en"] == "ability"
    assert converted["ru"] == "ability-ru"
    assert converted["uz"] == "ability-uz"
    assert converted["level_tag"] == "A2"
    assert converted["locale_data"]["definitions"]["en"] == "ability in English"
    assert converted["locale_data"]["definitions"]["ru"] == "ability описание"
    assert converted["locale_data"]["definitions"]["uz"] == "ability tavsifi"
    assert converted["locale_data"]["examples"] == [
        "the ability to adapt",
        "lose the ability to communicate",
    ]
    assert converted["locale_data"]["phonetics"] == {"us": "/əˈbɪləti/", "uk": "/əˈbɪləti/"}


def test_convert_full_word_deduplicates_words_case_insensitively():
    full_items = [
        {"id": 1, "value": {"word": "ability", "level": "A2", "examples": [], "phonetics": {}}},
        {"id": 2, "value": {"word": "Ability", "level": "A2", "examples": [], "phonetics": {}}},
        {"id": 3, "value": {"word": "abandon", "level": "B2", "examples": [], "phonetics": {}}},
    ]

    converted, count = convert_full_word(full_items, StubAIService())

    assert count == 2
    assert len(converted) == 2
    assert [item["en"] for item in converted] == ["ability", "abandon"]


def test_validate_data_items_reports_missing_nested_fields():
    errors = validate_data_items(
        [
            {
                "en": "abandon",
                "ru": "покидать",
                "uz": "tashlab ketmoq",
                "level_tag": "B2",
                "locale_data": {
                    "definitions": {"en": "", "ru": "описание", "uz": "tavsif"},
                    "examples": "not-a-list",
                    "phonetics": {"us": "/əˈbændən/"},
                },
            }
        ]
    )

    assert any("locale_data.definitions.en is required" in error for error in errors)
    assert any("locale_data.examples must be a list" in error for error in errors)
    assert any("locale_data.phonetics.uk is required" in error for error in errors)
