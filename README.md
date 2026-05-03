# Sozlution - English Learning Platform

AI-powered English learning platform with IELTS preparation features.

## Project Structure

```
sozlution-i7/
├── frontend/          # Next.js 16.2.0 (React 19) application
├── backend/           # FastAPI (Python 3.11) application
├── nginx/             # Nginx reverse proxy configuration
├── docker-compose.yml # Docker Compose configuration
└── .env.example       # Environment variables template
```

## Quick Start with Docker

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sozlution-i7
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and fill in your values (especially AI_API_KEY and SECRET_KEY)
   ```

3. **Start all services**
   ```bash
   docker compose up -d
   ```

4. **Check services status**
   ```bash
   docker compose ps
   ```

   Expected output:
   ```
   NAME                  STATUS
   sozlution-postgres    Up (healthy)
   sozlution-backend     Up
   sozlution-frontend    Up
   sozlution-nginx       Up
   ```

5. **View logs**
   ```bash
   # All services
   docker compose logs -f

   # Specific service
   docker compose logs -f frontend
   docker compose logs -f backend
   docker compose logs -f nginx
   docker compose logs -f postgres
   ```

### Access the Application

- **Application**: http://localhost (через nginx)
- **Backend API**: http://localhost/api
- **API Documentation**: http://localhost/docs
- **Health Check**: http://localhost/ping

**Note**: Все запросы проходят через nginx на порту 80. Прямой доступ к frontend (3000) и backend (8000) закрыт.

### Stop Services

```bash
# Stop containers
docker compose stop

# Stop and remove containers
docker compose down

# Stop, remove containers and volumes (WARNING: deletes database data)
docker compose down -v
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  Client Browser                             │
└──────────────┬──────────────────────────────┘
               │ http://localhost
               ▼
┌─────────────────────────────────────────────┐
│  Nginx (Port 80)                            │
│  - Routes / → Frontend                      │
│  - Routes /api → Backend                    │
│  - Routes /static → Backend                 │
└──────┬──────────────────────┬───────────────┘
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────────────┐
│  Frontend    │      │  Backend             │
│  (Next.js)   │      │  (FastAPI)           │
│  Port 3000   │      │  Port 8000           │
└──────────────┘      └──────┬───────────────┘
                             │
                             ▼
                      ┌──────────────────────┐
                      │  PostgreSQL          │
                      │  Port 5432           │
                      └──────────────────────┘
```

## Docker Configuration Notes

### Development vs Production

**Current setup (Development mode):**
- Backend uses volume mount `./backend:/app` for hot-reload during development
- This allows code changes without rebuilding the image
- Entrypoint is explicitly defined in docker-compose.yml

**For Production deployment:**
- Remove volume mounts from docker-compose.yml
- Code will be baked into the image during build
- More secure and predictable behavior

Example production backend service:
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: sozlution-backend
  entrypoint: ["./entrypoint.sh"]
  # volumes: - REMOVE THIS LINE
  environment:
    # ... same environment variables
```

## Development without Docker

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Access at: http://localhost:3000

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Access at: http://localhost:8000

**Note**: При локальной разработке без Docker обновите `.env`:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` (прямой доступ к backend)

## Environment Variables

See `.env.example` for all available configuration options.

**Required variables:**
- `AI_API_KEY` - API key for AI service
- `SECRET_KEY` - Backend JWT signing key (generate with: `python -c 'import secrets; print(secrets.token_urlsafe(32))'`)

**Important for Docker setup:**
- `NEXT_PUBLIC_API_BASE_URL=http://localhost/api` - API через nginx
- `BACKEND_CORS_ORIGINS=["http://localhost","http://localhost:80","http://nginx"]` - CORS для nginx

## Troubleshooting

### Frontend can't connect to backend

**Symptoms:**
- DevTools Console: `Failed to fetch` или `Network Error`
- Backend logs не показывают входящие запросы

**Solution:**
1. Проверить `NEXT_PUBLIC_API_BASE_URL` в `.env`:
   - Для Docker: `http://localhost/api` (через nginx)
   - Для local dev: `http://localhost:8000` (прямой доступ)
2. Проверить CORS в backend: `BACKEND_CORS_ORIGINS` должен включать `http://localhost`
3. Проверить nginx логи: `docker compose logs nginx`

### Backend database connection fails

**Symptoms:**
- Backend logs: `could not connect to server`
- Backend контейнер постоянно перезапускается

**Solution:**
```bash
# Проверить PostgreSQL healthcheck
docker compose logs postgres

# Проверить статус
docker compose ps postgres

# Проверить подключение вручную
docker compose exec postgres psql -U sozlution -d sozlution_test -c "SELECT 1;"
```

### Port 80 already in use

**Symptoms:**
- `Error: bind: address already in use`

**Solution:**
```bash
# Найти процесс на порту 80
sudo lsof -i :80

# Изменить порт в docker-compose.yml
# nginx:
#   ports:
#     - "8080:80"  # Используем 8080 вместо 80

# Обновить .env
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Nginx 502 Bad Gateway

**Symptoms:**
- Browser показывает "502 Bad Gateway"
- Nginx logs: `connect() failed (111: Connection refused)`

**Solution:**
```bash
# Проверить, что backend и frontend запущены
docker compose ps

# Проверить логи backend и frontend
docker compose logs backend
docker compose logs frontend

# Перезапустить сервисы
docker compose restart backend frontend nginx
```

### Database migrations fail

**Symptoms:**
- Backend logs: `alembic.util.exc.CommandError`

**Solution:**
```bash
# Войти в backend контейнер
docker compose exec backend bash

# Проверить текущую версию миграции
alembic current

# Применить миграции вручную
alembic upgrade head

# Выйти
exit
```

## Useful Commands

```bash
# Rebuild specific service
docker compose up -d --build backend
docker compose up -d --build frontend

# View real-time logs
docker compose logs -f --tail=100

# Execute command in container
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec postgres psql -U sozlution -d sozlution_test

# Check environment variables
docker compose exec backend env | grep -E "POSTGRES|AI_API"
docker compose exec frontend env | grep -E "NEXT_PUBLIC|AI_API"

# Restart single service
docker compose restart nginx

# Remove all containers and volumes (fresh start)
docker compose down -v
docker compose up -d --build
```

## License

[Your License]
