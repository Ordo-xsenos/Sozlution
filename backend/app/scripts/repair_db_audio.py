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

async def repair_audio_paths():
    session_maker = await get_sessionmaker()
    async with session_maker() as session:
        result = await session.execute(select(Word))
        words = result.scalars().all()
        
        count = 0
        for word in words:
            if word.audio_path:
                full_path = os.path.join("/app", word.audio_path.lstrip("/"))
                if not os.path.exists(full_path) or os.path.getsize(full_path) < 100:
                    logger.warning(f"Invalid path found for {word.en}: {word.audio_path}. Resetting.")
                    word.audio_path = None
                    count += 1
                
        if count > 0:
            await session.commit()
            logger.info(f"Invalidated {count} broken audio paths.")
        else:
            logger.info("All audio paths are valid.")

if __name__ == "__main__":
    asyncio.run(repair_audio_paths())
