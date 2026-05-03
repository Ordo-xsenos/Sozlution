#!/bin/bash

set -e

# Railway передает порт через переменную PORT. Если ее нет, используем 8000 по умолчанию.
APP_PORT=${PORT:-8000}

echo "--- Step 1: Database Migrations (Essential) ---"
alembic upgrade head

echo "--- Step 2: Starting Background Data Tasks ---"
# Запускаем импорт и сидинг в фоновом режиме, чтобы сервер стартовал немедленно
(
  echo "--- [Background] Starting Word Import ---"
  python app/scripts/import_words.py data.generated.json

  echo "--- [Background] Starting IELTS Frontend Data Seeding ---"
  python app/scripts/seed_frontend_ielts_data.py

  echo "--- [Background] Data tasks finished successfully ---"
) &

echo "--- Step 3: Starting FastAPI Server on port $APP_PORT ---"
# exec заменяет текущий процесс оболочки процессом uvicorn
exec gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:"$APP_PORT" \
  --workers 2 \
  --timeout 60 \
