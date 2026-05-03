import asyncio
import os
import sys

# Add project root to sys.path
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.db.session import get_sessionmaker
from app.ielts.models import IELTSWord, IELTSMockTest, IELTSMockTestSection, IELTSMockTestQuestion


async def seed_frontend_data():
    session_maker = await get_sessionmaker()
    async with session_maker() as session:
        # 1. Seed Vocabulary
        vocab_data = [
          { "en": "Mitigate", "ru": "Смягчать", "uz": "Kamaytirmoq", "definition": "To make something bad less severe or serious.", "transcription": "ˈmɪtɪɡeɪt", "topic": "Environment", "example": "Governments must mitigate the effects of climate change." },
          { "en": "Ubiquitous", "ru": "Вездесущий", "uz": "Hamma joyda mavjud", "definition": "Present, appearing, or found everywhere.", "transcription": "juːˈbɪkwɪtəs", "topic": "Technology", "example": "Digital devices have become ubiquitous in daily life." },
          { "en": "Paradigm", "ru": "Парадигма", "uz": "Paradigma", "definition": "A typical example or pattern of something.", "transcription": "ˈpærədaɪm", "topic": "Science", "example": "This research represents a new paradigm in education." },
          { "en": "Exacerbate", "ru": "Усугублять", "uz": "Yomonlashtirmoq", "definition": "To make a problem or bad situation worse.", "transcription": "ɪɡˈzæsəbeɪt", "topic": "Social Issues", "example": "The tax increase will exacerbate the poverty gap." },
          { "en": "Pragmatic", "ru": "Прагматичный", "uz": "Pragmatik", "definition": "Dealing with things sensibly and realistically.", "transcription": "præɡˈmætɪk", "topic": "Business", "example": "We need a pragmatic solution to the budget problem." },
          { "en": "Advocate", "ru": "Выступать за", "uz": "Targ‘ib qilmoq", "definition": "To publicly recommend or support.", "transcription": "ˈædvəkeɪt", "topic": "Politics", "example": "Many doctors advocate for a healthier lifestyle." },
          { "en": "Acknowledge", "ru": "Признавать", "uz": "Tan olmoq", "definition": "Accept or admit the existence or truth of.", "transcription": "əkˈnɒlɪdʒ", "topic": "Communication", "example": "He failed to acknowledge the importance of teamwork." },
          { "en": "Acquire", "ru": "Приобретать", "uz": "Egallamoq", "definition": "Buy or obtain for oneself.", "transcription": "əˈkwaɪə(r)", "topic": "Education", "example": "Students acquire new skills through constant practice." },
          { "en": "Allocate", "ru": "Выделять", "uz": "Ajratmoq", "definition": "Distribute resources for a particular purpose.", "transcription": "ˈæləkeɪt", "topic": "Economics", "example": "The company will allocate funds for infrastructure." },
          { "en": "Ambiguous", "ru": "Двусмысленный", "uz": "Noaniq", "definition": "Open to more than one interpretation.", "transcription": "æmˈbɪɡjuəs", "topic": "Language", "example": "The instructions in the test were somewhat ambiguous." },
          { "en": "Coherent", "ru": "Связный", "uz": "Mantiqiy bog‘langan", "definition": "Logical and consistent.", "transcription": "kəʊˈhɪərənt", "topic": "Writing", "example": "Your essay must be coherent and well-structured." },
          { "en": "Compelling", "ru": "Убедительный", "uz": "Ishonarli", "definition": "Evoking interest or admiration in a powerful way.", "transcription": "kəmˈpelɪŋ", "topic": "Communication", "example": "She made a compelling argument for legal reform." },
          { "en": "Comprehensive", "ru": "Всесторонний", "uz": "Keng qamrovli", "definition": "Including all or nearly all elements or aspects.", "transcription": "ˌkɒmprɪˈhensɪv", "topic": "Education", "example": "The book offers a comprehensive guide to history." },
          { "en": "Crucial", "ru": "Критически важный", "uz": "O‘ta muhim", "definition": "Decisive or critical, especially in the success or failure of something.", "transcription": "ˈkruːʃl", "topic": "Success", "example": "Vitamins play a crucial role in our health." },
          { "en": "Depict", "ru": "Изображать", "uz": "Tasvirlamoq", "definition": "Represent by a drawing, painting, or other art form.", "transcription": "dɪˈpɪkt", "topic": "Art/Media", "example": "The film depicts the life of a famous musician." },
          { "en": "Deteriorate", "ru": "Ухудшаться", "uz": "Yomonlashmoq", "definition": "Become progressively worse.", "transcription": "dɪˈtɪəriəreɪt", "topic": "Health", "example": "The patient's condition began to deteriorate rapidly." },
          { "en": "Diverse", "ru": "Разнообразный", "uz": "Turli xil", "definition": "Showing a great deal of variety; very different.", "transcription": "daɪ\u02c0v\u025c\u02d0s", "topic": "Culture", "example": "London has a very diverse population." },
          { "en": "Emphasis", "ru": "Акцент", "uz": "Urg\u2018u berish", "definition": "Special importance, value, or prominence given to something.", "transcription": "\u02c8emf\u0259s\u026as", "topic": "Communication", "example": "The course puts emphasis on practical skills." },
          { "en": "Feasible", "ru": "Осуществимый", "uz": "Amalga oshirsa bo\u02bbladigan", "definition": "Possible to do easily or conveniently.", "transcription": "\u02c8fi\u02d0z\u0259bl", "topic": "Planning", "example": "It is not feasible to build a bridge here." },
          { "en": "Hinder", "ru": "Препятствовать", "uz": "To\u02bbbsqinlik qilmoq", "definition": "Make it difficult for someone to do something.", "transcription": "\u02c8h\u026and\u0259(r)", "topic": "Progress", "example": "Strict regulations might hinder economic growth." }
        ]
        
        words_added = 0
        for item in vocab_data:
            # Проверка на существование по слову на английском
            stmt = select(IELTSWord).where(IELTSWord.en == item["en"])
            existing = await session.execute(stmt)
            if not existing.scalar_one_or_none():
                word = IELTSWord(**item)
                session.add(word)
                words_added += 1

        # 2. Seed Mock Test with provided questions
        test_title = "IELTS Academic Diagnostic Test"
        stmt = select(IELTSMockTest).where(IELTSMockTest.title == test_title)
        existing_test = await session.execute(stmt)
        test = existing_test.scalar_one_or_none()
        
        test_created = False
        if not test:
            test = IELTSMockTest(
                title=test_title,
                type="reading",
                difficulty="High"
            )
            session.add(test)
            await session.flush()
            test_created = True

            section = IELTSMockTestSection(
                test_id=test.id,
                content="This diagnostic test evaluates your readiness for IELTS Academic. Answer the following vocabulary-based questions."
            )
            session.add(section)
            await session.flush()

            questions_data = [
              { "text": "The new policy was designed to ___ the negative effects of the crisis.", "options": ["mitigate", "hinder", "depict", "acquire"], "correctIndex": 0 },
              { "text": "Smartphones are now ___ in almost every part of the world.", "options": ["diverse", "ubiquitous", "ambiguous", "coherent"], "correctIndex": 1 },
              { "text": "We need a ___ shift in how we approach environmental protection.", "options": ["paradigm", "emphasis", "advocate", "feasible"], "correctIndex": 0 },
              { "text": "Adding fuel to the fire will only ___ the situation.", "options": ["allocate", "exacerbate", "acknowledge", "mitigate"], "correctIndex": 1 },
              { "text": "Let's be ___ and focus on what we can actually achieve today.", "options": ["ambiguous", "pragmatic", "compelling", "coherent"], "correctIndex": 1 },
              { "text": "She is a strong ___ for human rights in her country.", "options": ["emphasis", "advocate", "depict", "acquire"], "correctIndex": 1 },
              { "text": "It is important to ___ the contributions of every team member.", "options": ["hinder", "acknowledge", "allocate", "exacerbate"], "correctIndex": 1 },
              { "text": "He managed to ___ a wealth of knowledge during his studies.", "options": ["acquire", "depict", "hinder", "mitigate"], "correctIndex": 0 },
              { "text": "The government decided to ___ more resources to healthcare.", "options": ["allocate", "exacerbate", "ambiguous", "diverse"], "correctIndex": 0 },
              { "text": "His answer was too ___, leaving us confused about his true intentions.", "options": ["coherent", "comprehensive", "ambiguous", "crucial"], "correctIndex": 2 },
              { "text": "A ___ argument is necessary to convince the board of directors.", "options": ["compelling", "deteriorate", "hinder", "feasible"], "correctIndex": 0 },
              { "text": "The report provides a ___ analysis of the current market trends.", "options": ["comprehensive", "ambiguous", "diverse", "pragmatic"], "correctIndex": 0 },
              { "text": "Clear communication is ___ for the success of any project.", "options": ["crucial", "feasible", "deteriorate", "allocate"], "correctIndex": 0 },
              { "text": "The artist tried to ___ the beauty of the landscape in her painting.", "options": ["depict", "mitigate", "hinder", "acquire"], "correctIndex": 0 },
              { "text": "If we don't act now, the situation will ___ further.", "options": ["deteriorate", "acknowledge", "allocate", "diverse"], "correctIndex": 0 },
              { "text": "The school has a very ___ student body from 50 different countries.", "options": ["diverse", "coherent", "ambiguous", "crucial"], "correctIndex": 0 },
              { "text": "There is a strong ___ on teamwork in this company.", "options": ["emphasis", "advocate", "paradigm", "mitigate"], "correctIndex": 0 },
              { "text": "Building a city on Mars is not ___ with our current technology.", "options": ["feasible", "ubiquitous", "comprehensive", "coherent"], "correctIndex": 0 },
              { "text": "Heavy rain can ___ the progress of the construction work.", "options": ["hinder", "acknowledge", "acquire", "depict"], "correctIndex": 0 },
              { "text": "The candidate's speech was ___, making it easy for everyone to understand her vision.", "options": ["coherent", "exacerbate", "ambiguous", "deteriorate"], "correctIndex": 0 }
            ]
            
            for q in questions_data:
                question = IELTSMockTestQuestion(
                    section_id=section.id,
                    type="multiple_choice",
                    text=q["text"],
                    options=q["options"],
                    correct_answer=q["options"][q["correctIndex"]]
                )
                session.add(question)

        await session.commit()
        print(f"IELTS Seed: Added {words_added} new words. Test created: {test_created}")


if __name__ == "__main__":
    asyncio.run(seed_frontend_data())
