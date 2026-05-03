# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Установить pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Копировать файлы зависимостей
COPY package.json pnpm-lock.yaml ./

# Установить зависимости
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Копировать зависимости из deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG AI_API_KEY
ARG AI_API_URL
ARG AI_MODEL

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV AI_API_KEY=$AI_API_KEY
ENV AI_API_URL=$AI_API_URL
ENV AI_MODEL=$AI_MODEL

# Build приложения
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копировать необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
