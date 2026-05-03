import asyncio
import os
import sys

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.db.session import get_sessionmaker
from app.ielts.models import IELTSWord, IELTSWritingTask, IELTSMockTest, IELTSMockTestSection, IELTSMockTestQuestion


async def seed_ielts_data():
    session_maker = await get_sessionmaker()
    async with session_maker() as session:
        # Seed Vocabulary
        words = [
            IELTSWord(
                en="mitigate",
                ru="смягчать",
                uz="yumshatmoq",
                definition="Make something bad less severe, serious, or painful.",
                transcription="/ˈmɪt.ɪ.ɡeɪt/",
                topic="Environment",
                example="Governments should implement policies to mitigate the effects of climate change."
            ),
            IELTSWord(
                en="ubiquitous",
                ru="вездесущий",
                uz="hamma joyda mavjud",
                definition="Present, appearing, or found everywhere.",
                transcription="/juːˈbɪk.wɪ.təs/",
                topic="Technology",
                example="Mobile phones have become ubiquitous in modern society."
            )
        ]
        session.add_all(words)

        # Seed Writing Tasks
        tasks = [
            IELTSWritingTask(
                title="Climate Change Responsibility",
                prompt="Some people think that individuals can do nothing to improve the environment. Others believe that governments and large companies should take responsibility. Discuss both views and give your opinion.",
                type="task2",
                min_words=250,
                time_limit=40
            ),
            IELTSWritingTask(
                title="Global Population Growth",
                prompt="The chart below shows the changes in global population from 1950 to 2050. Summarize the information by selecting and reporting the main features.",
                type="task1",
                image_url="https://example.com/population-chart.png",
                min_words=150,
                time_limit=20
            )
        ]
        session.add_all(tasks)

        # Seed Mock Test
        test = IELTSMockTest(
            title="General Reading Practice 1",
            type="reading",
            difficulty="Medium"
        )
        session.add(test)
        await session.flush()

        section = IELTSMockTestSection(
            test_id=test.id,
            content="The importance of biodiversity cannot be overstated. It provides essential services like pollination..."
        )
        session.add(section)
        await session.flush()

        questions = [
            IELTSMockTestQuestion(
                section_id=section.id,
                type="multiple_choice",
                text="What is a primary service provided by biodiversity mentioned in the text?",
                options=["Pollination", "Deforestation", "Urbanization"],
                correct_answer="Pollination"
            )
        ]
        session.add_all(questions)

        await session.commit()
        print("IELTS data seeded successfully.")


if __name__ == "__main__":
    asyncio.run(seed_ielts_data())
