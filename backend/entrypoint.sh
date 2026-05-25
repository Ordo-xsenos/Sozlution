#!/bin/bash

set -e

# Railway передает порт через переменную PORT. Если ее нет, используем 8000 по умолчанию.
APP_PORT=${PORT:-8000}

echo "--- Step 1: Database Migrations (Essential) ---"
alembic upgrade head

echo "--- Step 2: Starting FastAPI Server on port $APP_PORT ---"
# Запускаем сервер в фоне
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:"$APP_PORT" \
  --workers 2 \
  --timeout 60 &

SERVER_PID=$!

echo "--- Step 3: Starting Background Data Tasks ---"
# Запускаем импорт данных в фоне после старта сервера
(
  sleep 5  # Даем серверу время запуститься
  echo "--- [Background] Starting Word Import ---"
  python app/scripts/import_words.py data.generated.json || echo "Word import failed or already completed"

  echo "--- [Background] Starting IELTS Frontend Data Seeding ---"
  python app/scripts/seed_frontend_ielts_data.py || echo "IELTS seeding failed or already completed"

  echo "--- [Background] Data tasks finished ---"
) &

echo "--- Server started with PID $SERVER_PID ---"

# Ждем завершения сервера
wait $SERVER_PID
# exec заменяет текущий процесс оболочки процессом uvicorn
exec gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:"$APP_PORT" \
  --workers 2 \
  --timeout 60 \
