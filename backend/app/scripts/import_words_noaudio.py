"""Fast word import without TTS (recovery helper)."""
import asyncio
import json
import os
import sys
import uuid

sys.path.append(os.getcwd())

from app.db.session import get_sessionmaker  # noqa: E402
from app.study.models import Word  # noqa: E402


async def main(path: str = "data.generated.json") -> None:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    maker = await get_sessionmaker()
    async with maker() as session:
        from sqlalchemy import select
        existing = set((await session.execute(select(Word.en))).scalars().all())
        batch = []
        added = 0
        for item in data:
            if item["en"] in existing:
                continue
            existing.add(item["en"])
            batch.append(
                Word(
                    id=uuid.uuid4().hex,
                    en=item["en"],
                    ru=item["ru"],
                    uz=item["uz"],
                    level_tag=item["level_tag"],
                    locale_data=item["locale_data"],
                    audio_path=None,
                )
            )
            if len(batch) >= 500:
                session.add_all(batch)
                await session.commit()
                added += len(batch)
                print(f"imported {added}", flush=True)
                batch = []
        if batch:
            session.add_all(batch)
            await session.commit()
            added += len(batch)
        print(f"DONE imported={added}")


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "data.generated.json"))
