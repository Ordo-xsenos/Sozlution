import os
import edge_tts
import logging

logger = logging.getLogger(__name__)

# По умолчанию используем американский женский голос (AvaNeural), он часто стабильнее GuyNeural
DEFAULT_VOICE = "en-US-AvaNeural"
OUTPUT_DIR = "static/audio"


async def generate_word_audio(word_text: str, filename: str) -> str | None:
    """
    Генерирует аудио файл для текста слова и сохраняет его в OUTPUT_DIR.
    Возвращает путь к файлу относительно корня проекта.
    """
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    file_path = os.path.join(OUTPUT_DIR, f"{filename}.mp3")
    
    # Если файл уже существует, не перекачиваем (оптимизация)
    if os.path.exists(file_path):
        return file_path

    try:
        communicate = edge_tts.Communicate(word_text, DEFAULT_VOICE)
        await communicate.save(file_path)
        return file_path
    except Exception as e:
        # Если сервис недоступен (например, 403), просто логируем и идем дальше
        logger.warning(f"Failed to generate audio for '{word_text}': {e}")
        return None
