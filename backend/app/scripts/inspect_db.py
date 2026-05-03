import asyncio
import argparse
import os
import sys

# Добавляем корень проекта в путь для корректных импортов
sys.path.append(os.getcwd())

import asyncpg
from app.core.config import settings

async def inspect_users(limit=20, offset=0):
    # Получаем DSN из настроек
    dsn = settings.POSTGRES_DSN
    if not dsn:
        # Пытаемся взять из переменных окружения, если settings не загрузились
        dsn = os.getenv("POSTGRES_DSN")
        
    if not dsn:
        print("Error: POSTGRES_DSN not found in settings or environment.")
        return

    # asyncpg ожидает postgresql://, но SQLAlchemy может передавать postgresql+asyncpg://
    dsn = dsn.replace("postgresql+asyncpg://", "postgresql://")

    try:
        conn = await asyncpg.connect(dsn)
        
        # Получаем данные из таблицы users
        query = f"""
            SELECT id, name, email, lang, level, device_id, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        """
        rows = await conn.fetch(query, limit, offset)

        if not rows:
            print("No users found in the database.")
            await conn.close()
            return

        # Форматированный вывод
        header = f"{'ID':<12} | {'NAME':<15} | {'EMAIL':<25} | {'LANG':<4} | {'LVL':<4} | {'DEVICE':<15}"
        print("\n" + header)
        print("-" * len(header))
        
        for row in rows:
            user_id = (row['id'] + "..") if len(row['id']) > 10 else row['id']
            name = (row['name'][:13] + "..") if row['name'] and len(row['name']) > 13 else (row['name'] or "")
            email = (row['email'][:23] + "..") if len(row['email']) > 23 else row['email']
            device = (row['device_id'] + "..") if row['device_id'] and len(row['device_id']) > 13 else row['device_id']
            
            print(f"{user_id:<12} | {name:<15} | {email:<25} | {row['lang']:<4} | {row['level']:<4} | {device:<15}")

        # Считаем общее количество
        total = await conn.fetchval("SELECT COUNT(*) FROM users")
        print("-" * len(header))
        print(f"Total users in DB: {total}\n")

        await conn.close()

    except Exception as e:
        print(f"Error connecting to or querying PostgreSQL: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inspect users in PostgreSQL database.")
    parser.add_argument("--limit", type=int, default=50, help="Number of rows to show")
    parser.add_argument("--offset", type=int, default=0, help="Starting row index")
    
    args = parser.parse_args()
    asyncio.run(inspect_users(limit=args.limit, offset=args.offset))
