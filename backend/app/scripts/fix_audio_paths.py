import asyncio
import logging
import sys
import os

sys.path.append(os.getcwd())

from app.db.session import get_sessionmaker
from app.study.models import Word
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_audio_paths():
    session_maker = await get_sessionmaker()
    async with session_maker() as session:
        result = await session.execute(select(Word))
        words = result.scalars().all()
        
        count = 0
        for word in words:
            expected_path = f"/static/audio/en_{word.id}.mp3"
            if word.audio_path != expected_path:
                word.audio_path = expected_path
                count += 1
                
        if count > 0:
            await session.commit()
            logger.info(f"Fixed paths for {count} words.")
        else:
            logger.info("All paths were already correct.")

if __name__ == "__main__":
    asyncio.run(fix_audio_paths())
