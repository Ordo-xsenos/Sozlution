import asyncio
import argparse
import json
import logging
import uuid
import os
import sys

# Добавляем корень проекта в путь, чтобы импорты из app.* работали корректно
sys.path.append(os.getcwd())

from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_sessionmaker
from app.study.models import Word
from app.study.audio_service import generate_word_audio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def import_from_json(file_path: str = "data.json"):
    """Импортирует слова из JSON и сразу генерирует для них аудио произношение."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        logger.error(f"File {file_path} not found.")
        return

    session_maker = await get_sessionmaker()
    async with session_maker() as session:
        added_count = 0
        skipped_count = 0

        logger.info(f"Starting import from {file_path}...")

        for item in data:
            en_word = item["en"]
            
            # Проверка на дубликаты
            stmt = select(Word).where(Word.en == en_word)
            result = await session.execute(stmt)
            if result.scalar_one_or_none():
                skipped_count += 1
                continue

            word_id = uuid.uuid4().hex
            
            # Генерируем аудио произношение
            # Используем id для уникальности имени файла
            filename = f"en_{word_id}"
            audio_path = None
            try:
                audio_path = await generate_word_audio(en_word, filename)
                # Маленькая пауза, чтобы не спамить сервис TTS и не получать 403
                if audio_path:
                    await asyncio.sleep(0.2)
            except Exception:
                pass

            word_obj = Word(
                id=word_id,
                en=en_word,
                ru=item["ru"],
                uz=item["uz"],
                level_tag=item["level_tag"],
                locale_data=item["locale_data"],
                audio_path=audio_path
            )
            session.add(word_obj)
            added_count += 1

            if added_count % 10 == 0:
                await session.commit()
                logger.info(f"Processed {added_count} words...")

        await session.commit()
        logger.info(f"Import finished. Added: {added_count} (with audio), Skipped (exists): {skipped_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import dictionary entries with automatic audio generation.")
    parser.add_argument("file_path", nargs="?", default="data.generated.json", help="Path to prepared JSON dictionary file.")
    args = parser.parse_args()
    asyncio.run(import_from_json(args.file_path))
