import asyncio
import os
import sys

# Добавляем корень проекта
sys.path.append(os.getcwd())

from app.db.session import get_sessionmaker
from app.users.service import UserService
from app.users.schemas import UserCreate
from app.study.service import StudyService

async def main():
    sm = await get_sessionmaker()
    us = UserService()
    ss = StudyService()
    
    async with sm() as db:
        user_in = UserCreate(
            name='IELTS Master',
            email='ielts@example.com',
            password='password123',
            device_id='manual-c1-device',
            lang='en',
            level='C1'
        )
        try:
            user = await us.create_user(db, user_in=user_in)
            await ss.get_or_create_stats(db, user_id=user.id)
            print(f'Success: User {user.email} created with level {user.level}')
        except Exception as e:
            print(f'Error: {e}')

if __name__ == "__main__":
    asyncio.run(main())
