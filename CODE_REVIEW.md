# Код-ревью проекта Sozlution (Senior Developer Review)

**Дата:** 27 апреля 2026  
**Ревьюер:** Senior Full-Stack Developer  
**Проект:** Sozlution - платформа изучения английского языка

---

## 📊 Общая оценка: 6.5/10

Проект демонстрирует хорошее понимание современного стека Next.js/React, но имеет существенные проблемы с архитектурой, типизацией и обработкой ошибок, которые могут привести к проблемам в продакшене.

---

## 🔴 Критические проблемы (требуют немедленного исправления)

### 1. **Утечка секретов в репозитории**
**Файл:** `.env`  
**Серьезность:** КРИТИЧЕСКАЯ

```bash
AI_API_KEY=compass-Xsenos-dEjjbRUngiomtM4CV7vybcgf
```

**Проблема:** API ключ закоммичен в репозиторий и виден в истории Git.

**Решение:**
```bash
# Немедленно:
1. Отозвать текущий API ключ
2. Добавить .env в .gitignore (если еще не добавлен)
3. Удалить из истории Git:
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env" \
   --prune-empty --tag-name-filter cat -- --all
4. Использовать .env.example с placeholder значениями
```

### 2. **Массовое использование `any` типов**
**Файл:** `context/app-context.tsx`  
**Серьезность:** ВЫСОКАЯ

```typescript
// Строки 203-216
request<'/api/v1/user', 'get', any>('/api/v1/user'),
request<'/api/v1/stats', 'get', any>('/api/v1/stats'),
request<'/api/v1/results', 'get', any>('/api/v1/results'),
const istats = await request<any, 'get', any>('/api/v1/ielts-mode/stats')
```

**Проблема:** Полная потеря type safety. TypeScript не может отловить ошибки в runtime.

**Решение:**
```typescript
// Использовать сгенерированные типы из api-types.ts
type UserResponse = PathResponse<'/api/v1/user', 'get'>
type StatsResponse = PathResponse<'/api/v1/stats', 'get'>

const [u, s, r] = await Promise.all([
  request<'/api/v1/user', 'get', UserResponse>('/api/v1/user'),
  request<'/api/v1/stats', 'get', StatsResponse>('/api/v1/stats'),
  // ...
])
```

### 3. **Отсутствие обработки ошибок в критических местах**
**Файл:** `context/app-context.tsx:269-274`

```typescript
try {
  const c = await request<'/api/v1/day/current', 'get', any>('/api/v1/day/current')
  setCurrentDay(c)
} catch (e) {
  // Не выводим ошибку в консоль, просто пропускаем
}
```

**Проблема:** Молчаливое игнорирование ошибок затрудняет отладку. Пользователь не понимает, почему данные не загружаются.

**Решение:**
```typescript
try {
  const c = await request<'/api/v1/day/current', 'get', CurrentDayResponse>('/api/v1/day/current')
  setCurrentDay(c)
} catch (e) {
  // Логируем в production monitoring (Sentry, LogRocket)
  console.error('Failed to fetch current day:', e)
  // Опционально: показываем пользователю fallback UI
}
```

### 4. **Небезопасная работа с localStorage**
**Файл:** `lib/auth.ts`

```typescript
export function getAuthToken() {
  if (!canUseStorage()) return null
  return localStorage.getItem(TOKEN_KEY)
}
```

**Проблема:** 
- JWT токены в localStorage уязвимы к XSS атакам
- Нет проверки валидности токена перед использованием
- Нет механизма refresh token

**Решение:**
```typescript
// Рассмотреть использование httpOnly cookies для токенов
// Или как минимум добавить:
export function getAuthToken(): string | null {
  if (!canUseStorage()) return null
  const token = localStorage.getItem(TOKEN_KEY)
  
  // Проверка валидности токена
  if (token && isTokenExpired(token)) {
    clearAuthToken()
    return null
  }
  
  return token
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
```

---

## 🟡 Серьезные проблемы (требуют исправления)

### 5. **Огромные компоненты-монолиты**
**Файл:** `app/page.tsx` (1368 строк), `app/mvp/learn/page.tsx` (367 строк)

**Проблема:** Нарушение Single Responsibility Principle. Компоненты сложно тестировать и поддерживать.

**Решение:**
```typescript
// Разбить на подкомпоненты:
// app/page.tsx → 
//   - components/landing/Hero.tsx
//   - components/landing/Features.tsx
//   - components/landing/Pricing.tsx
//   - components/landing/Testimonials.tsx
//   - components/landing/HowItWorks.tsx

// app/mvp/learn/page.tsx →
//   - components/learn/StudyCard.tsx
//   - components/learn/QuizStep.tsx
//   - components/learn/ProgressTracker.tsx
```

### 6. **Дублирование кода переводов**
**Файлы:** `app/page.tsx`, `components/ai-chatbot.tsx`, и другие

```typescript
const translations = {
  en: { /* 50+ строк */ },
  uz: { /* 50+ строк */ },
  ru: { /* 50+ строк */ }
}
```

**Проблема:** Переводы разбросаны по компонентам. Сложно поддерживать консистентность.

**Решение:**
```typescript
// lib/i18n/translations.ts
export const translations = {
  common: {
    en: { signIn: 'Sign In', ... },
    uz: { signIn: 'Kirish', ... },
    ru: { signIn: 'Войти', ... }
  },
  landing: { /* ... */ },
  chatbot: { /* ... */ }
}

// hooks/useTranslation.ts
export function useTranslation(namespace: keyof typeof translations) {
  const { user } = useApp()
  const lang = user?.lang || 'en'
  return translations[namespace][lang]
}
```

### 7. **Отсутствие валидации env переменных**
**Файл:** `app/api/chat/route.ts:101-103`

```typescript
const baseUrl = process.env.AI_API_URL?.trim() || ''
const apiKey = process.env.AI_API_KEY?.trim() || ''
```

**Проблема:** Проверка происходит в runtime. Приложение может упасть в продакшене.

**Решение:**
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  AI_API_URL: z.string().url(),
  AI_API_KEY: z.string().min(1),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
})

export const env = envSchema.parse({
  AI_API_URL: process.env.AI_API_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

// Теперь используем env.AI_API_URL вместо process.env.AI_API_URL
```

### 8. **Неоптимальная работа с состоянием**
**Файл:** `context/app-context.tsx:168-306`

**Проблема:** 
- 8 отдельных useState вместо useReducer
- Множественные ре-рендеры при обновлении состояния
- Нет мемоизации контекста

**Решение:**
```typescript
// Использовать useReducer для сложного состояния
type AppState = {
  user: User | null
  stats: Stats | null
  ieltsStats: IeltsStats | null
  plan: Plan | null
  currentDay: { day: DayPlan; words: Word[] } | null
  results: DayResult[]
  loading: boolean
  authReady: boolean
  error: string
}

type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_STATS'; payload: Stats }
  | { type: 'SET_LOADING'; payload: boolean }
  // ...

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    // ...
  }
}

// Мемоизация контекста
const value = useMemo(() => ({
  ...state,
  hydrate,
  login,
  logout,
  request
}), [state, hydrate, login, logout])
```

### 9. **Отсутствие error boundaries**

**Проблема:** Любая ошибка в компоненте приведет к краху всего приложения.

**Решение:**
```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // Отправить в Sentry/LogRocket
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>Something went wrong. Please refresh the page.</div>
      )
    }

    return this.props.children
  }
}

// app/layout.tsx
<ErrorBoundary>
  <AppProvider>
    {children}
  </AppProvider>
</ErrorBoundary>
```

---

## 🟢 Средние проблемы (желательно исправить)

### 10. **Отсутствие unit тестов**

**Найдено:** Только 2 E2E теста (auth.spec.ts, chatbot.spec.ts)

**Проблема:** Нет покрытия для критической бизнес-логики.

**Рекомендация:**
```typescript
// lib/__tests__/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getAuthToken, setAuthToken, clearAuthToken } from '../auth'

describe('auth utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store and retrieve token', () => {
    setAuthToken('test-token')
    expect(getAuthToken()).toBe('test-token')
  })

  it('should clear token', () => {
    setAuthToken('test-token')
    clearAuthToken()
    expect(getAuthToken()).toBeNull()
  })
})

// Добавить в package.json:
// "test": "vitest",
// "test:coverage": "vitest --coverage"
```

### 11. **Консольные логи в продакшен коде**
**Найдено:** 9 console.log/console.error

**Файлы:** `context/app-context.tsx:248, 260`, `app/mvp/learn/page.tsx:79`

**Решение:**
```typescript
// lib/logger.ts
const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => {
    console.error(...args)
    // В продакшене отправлять в Sentry
    if (!isDev) {
      // Sentry.captureException(args[0])
    }
  },
  warn: (...args: any[]) => isDev && console.warn(...args),
}

// Использование:
import { logger } from '@/lib/logger'
logger.log('Generating plan for level:', level)
```

### 12. **Неоптимальные запросы к API**
**Файл:** `context/app-context.tsx:202-206`

```typescript
const [u, s, r] = await Promise.all([
  request<'/api/v1/user', 'get', any>('/api/v1/user'),
  request<'/api/v1/stats', 'get', any>('/api/v1/stats'),
  request<'/api/v1/results', 'get', any>('/api/v1/results'),
])
```

**Проблема:** 3 отдельных запроса вместо одного агрегированного endpoint.

**Рекомендация:**
```typescript
// Backend: создать /api/v1/user/dashboard endpoint
// который возвращает { user, stats, results } одним запросом

const dashboard = await request<'/api/v1/user/dashboard', 'get'>('/api/v1/user/dashboard')
setUser(dashboard.user)
setStats(dashboard.stats)
setResults(dashboard.results)
```

### 13. **Отсутствие rate limiting для AI API**
**Файл:** `app/api/chat/route.ts`

**Проблема:** Нет защиты от злоупотребления AI API (дорогой ресурс).

**Решение:**
```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

const ratelimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1 минута
})

export function checkRateLimit(identifier: string, limit = 10) {
  const count = (ratelimit.get(identifier) as number) || 0
  if (count >= limit) {
    return false
  }
  ratelimit.set(identifier, count + 1)
  return true
}

// app/api/chat/route.ts
const ip = req.headers.get('x-forwarded-for') || 'unknown'
if (!checkRateLimit(ip, 10)) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  )
}
```

### 14. **Хардкод строк в компонентах**
**Файл:** `app/api/chat/route.ts:145-157`

```typescript
const systemInstruction = `
You are the Sozlution assistant. Only answer questions about...
`
```

**Проблема:** Промпт захардкожен. Сложно A/B тестировать и обновлять.

**Решение:**
```typescript
// lib/prompts.ts
export const CHATBOT_SYSTEM_PROMPT = {
  en: `You are the Sozlution assistant...`,
  ru: `Вы - ассистент Sozlution...`,
  uz: `Siz Sozlution assistentisiz...`
}

// Использование:
const systemInstruction = CHATBOT_SYSTEM_PROMPT[language]
```

### 15. **Отсутствие loading states для изображений**

**Проблема:** Нет skeleton loaders, пользователь видит пустые блоки.

**Решение:**
```typescript
// components/ui/image-with-skeleton.tsx
import Image from 'next/image'
import { useState } from 'react'
import { Skeleton } from './skeleton'

export function ImageWithSkeleton({ src, alt, ...props }) {
  const [loading, setLoading] = useState(true)
  
  return (
    <>
      {loading && <Skeleton className="w-full h-full" />}
      <Image
        src={src}
        alt={alt}
        onLoadingComplete={() => setLoading(false)}
        {...props}
      />
    </>
  )
}
```

---

## ✅ Что сделано хорошо

1. **Использование TypeScript** - проект полностью типизирован (хотя есть проблемы с `any`)
2. **Современный стек** - Next.js 16.2, React 19, shadcn/ui
3. **Генерация типов из OpenAPI** - хороший подход к type safety
4. **Playwright для E2E тестов** - правильный выбор инструмента
5. **Использование React Context** - централизованное управление состоянием
6. **Path aliases (@/*)** - улучшает читаемость импортов
7. **ESLint конфигурация** - настроен линтер
8. **Мультиязычность** - поддержка 3 языков из коробки

---

## 📋 Рекомендации по приоритетам

### Немедленно (эта неделя):
1. ✅ Удалить API ключи из репозитория и отозвать их
2. ✅ Добавить валидацию env переменных с Zod
3. ✅ Исправить типы `any` на правильные типы из api-types.ts
4. ✅ Добавить Error Boundary

### Краткосрочно (2-4 недели):
5. Рефакторинг больших компонентов (page.tsx, learn/page.tsx)
6. Централизовать переводы в отдельный модуль
7. Добавить rate limiting для AI API
8. Улучшить обработку ошибок с логированием
9. Добавить unit тесты для критической логики

### Среднесрочно (1-2 месяца):
10. Перейти на useReducer для AppContext
11. Добавить мониторинг ошибок (Sentry)
12. Оптимизировать API запросы (агрегированные endpoints)
13. Добавить skeleton loaders
14. Рассмотреть httpOnly cookies вместо localStorage для токенов

---

## 🎯 Метрики качества кода

| Метрика | Текущее | Целевое |
|---------|---------|---------|
| TypeScript strict mode | ✅ Включен | ✅ |
| Type coverage | ~70% (много `any`) | 95%+ |
| Test coverage | ~5% (только E2E) | 70%+ |
| Largest component | 1368 строк | <300 строк |
| Console statements | 9 | 0 (в продакшене) |
| Security issues | 2 критических | 0 |
| Performance score | Не измерено | 90+ (Lighthouse) |

---

## 💡 Дополнительные рекомендации

### Performance:
- Добавить `next/image` для оптимизации изображений
- Использовать dynamic imports для тяжелых компонентов
- Добавить React.memo для дорогих компонентов

### Security:
- Добавить Content Security Policy headers
- Настроить CORS правильно
- Добавить CSRF protection для форм

### DevOps:
- Настроить CI/CD с автоматическими тестами
- Добавить pre-commit hooks (husky + lint-staged)
- Настроить автоматический деплой preview для PR

### Monitoring:
- Интегрировать Sentry для отслеживания ошибок
- Добавить analytics (Vercel Analytics уже подключен)
- Настроить performance monitoring

---

## 📝 Заключение

Проект имеет **хорошую основу**, но требует **серьезной работы** над качеством кода перед выходом в продакшен. Основные проблемы связаны с:
- Безопасностью (утечка секретов, небезопасное хранение токенов)
- Типизацией (массовое использование `any`)
- Архитектурой (монолитные компоненты, отсутствие тестов)

**Рекомендую:** выделить 2-3 недели на рефакторинг критических проблем перед масштабированием проекта.

**Оценка готовности к продакшену:** 60% (после исправления критических проблем - 85%)
