import asyncio
import logging
import os
import sys

# Добавляем корень проекта в путь, чтобы импорты работали корректно
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.db.session import get_sessionmaker
from app.study.models import Word
from app.study.audio_service import generate_word_audio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_missing_audios():
    """Генерирует аудио для слов, у которых его еще нет."""
    session_maker = await get_sessionmaker()
    
    async with session_maker() as session:
        # Выбираем слова без аудио
        stmt = select(Word).where(Word.audio_path == None)
        result = await session.execute(stmt)
        words = result.scalars().all()
        
        if not words:
            logger.info("No words without audio found.")
            return

        logger.info(f"Found {len(words)} words to process.")
        
        count = 0
        for word in words:
            filename = f"en_{word.id}.mp3"
            full_path = os.path.join("/app/static/audio", filename)
            
            if os.path.exists(full_path) and os.path.getsize(full_path) > 100:
                logger.info(f"Skipping {word.en}, file exists.")
                word.audio_path = f"/static/audio/{filename}"
                continue

            logger.info(f"Generating audio for {word.en}...")
            try:
                audio_path = await generate_word_audio(word.en, f"en_{word.id}")
            except Exception as e:
                logger.error(f"Generation error for {word.en}: {e}")
                audio_path = None
            
            if audio_path:
                word.audio_path = audio_path
                count += 1
            else:
                logger.warning(f"No audio available for {word.en}. Marking as NO_AUDIO.")
                word.audio_path = "NO_AUDIO"
            
            if count % 10 == 0:
                await session.commit()
                logger.info(f"Processed batch...")
            
        await session.commit()
        logger.info(f"Finished! Successfully generated/fixed audio for {count} words.")

if __name__ == "__main__":
    asyncio.run(generate_missing_audios())
