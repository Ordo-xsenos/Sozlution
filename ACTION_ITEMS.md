# Приоритетный план исправлений (Action Items)

## 🚨 КРИТИЧНО - Исправить СЕГОДНЯ

### 1. Безопасность: Утечка API ключей
**Статус:** ⚠️ API ключ в Git истории (коммиты 39b83f5, 2450eb4)

```bash
# Шаги исправления:
1. Отозвать ключ: compass-Xsenos-dEjjbRUngiomtM4CV7vybcgf
2. Создать новый ключ в сервисе AI API
3. Убедиться что .env в .gitignore (уже есть на строке 14)
4. Создать .env.example:
   cat > .env.example << 'EOF'
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
AI_API_KEY=your-ai-api-key-here
AI_API_URL=https://your-ai-service.com/v1/models
EOF

5. Удалить .env из истории Git:
   git filter-repo --path .env --invert-paths
   # или
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
6. Force push (ВНИМАНИЕ: координировать с командой):
   git push origin --force --all
```

### 2. Типизация: Заменить все `any` типы
**Файлы:** `context/app-context.tsx`

```typescript
// ❌ ПЛОХО (текущее состояние):
request<'/api/v1/user', 'get', any>('/api/v1/user')

// ✅ ХОРОШО (исправить на):
type UserResponse = PathResponse<'/api/v1/user', 'get'>
request<'/api/v1/user', 'get', UserResponse>('/api/v1/user')
```

**Список мест для исправления:**
- `context/app-context.tsx:203` - user request
- `context/app-context.tsx:204` - stats request  
- `context/app-context.tsx:205` - results request
- `context/app-context.tsx:216` - ielts stats request
- `context/app-context.tsx:226` - plan request
- `context/app-context.tsx:249` - plan generate request
- `context/app-context.tsx:254` - plan request (повторный)
- `context/app-context.tsx:270` - current day request

---

## 🔥 ВЫСОКИЙ ПРИОРИТЕТ - Эта неделя

### 3. Добавить валидацию env переменных

```typescript
// lib/env.ts (создать новый файл)
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  AI_API_URL: z.string().url(),
  AI_API_KEY: z.string().min(10),
  AI_MODEL: z.string().optional().default('gpt-3.5-turbo'),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  AI_API_URL: process.env.AI_API_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_MODEL: process.env.AI_MODEL,
})

// Использовать везде вместо process.env:
// import { env } from '@/lib/env'
// const apiUrl = env.AI_API_URL
```

### 4. Добавить Error Boundary

```typescript
// components/ErrorBoundary.tsx (создать)
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
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
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Что-то пошло не так</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'Произошла ошибка'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// app/layout.tsx - обернуть AppProvider:
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <AppProvider>
            {children}
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### 5. Улучшить обработку ошибок в AppContext

```typescript
// context/app-context.tsx:269-274
// ❌ ПЛОХО:
try {
  const c = await request('/api/v1/day/current')
  setCurrentDay(c)
} catch (e) {
  // Не выводим ошибку в консоль, просто пропускаем
}

// ✅ ХОРОШО:
try {
  const c = await request<'/api/v1/day/current', 'get', CurrentDayResponse>(
    '/api/v1/day/current'
  )
  setCurrentDay(c)
} catch (e) {
  const error = e instanceof Error ? e : new Error('Unknown error')
  console.error('Failed to fetch current day:', error.message)
  
  // Опционально: показать toast пользователю
  // toast.error('Не удалось загрузить текущий день')
}
```

### 6. Добавить rate limiting для AI API

```bash
# Установить зависимость:
pnpm add lru-cache
```

```typescript
// lib/rate-limit.ts (создать)
import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number // milliseconds
  uniqueTokenPerInterval: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0]
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount)
      }
      tokenCount[0] += 1

      const currentUsage = tokenCount[0]
      const isRateLimited = currentUsage >= limit
      
      return {
        success: !isRateLimited,
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
      }
    },
  }
}

// app/api/chat/route.ts - добавить в начало POST функции:
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 минута
  uniqueTokenPerInterval: 500,
})

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown'
  
  const { success, remaining } = limiter.check(10, ip) // 10 запросов в минуту
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    )
  }

  // ... остальной код
}
```

---

## 📊 СРЕДНИЙ ПРИОРИТЕТ - 2-4 недели

### 7. Рефакторинг больших компонентов

**app/page.tsx (1368 строк) → разбить на:**
```
components/landing/
├── Hero.tsx (~150 строк)
├── Features.tsx (~200 строк)
├── HowItWorks.tsx (~150 строк)
├── Testimonials.tsx (~100 строк)
├── Pricing.tsx (~150 строк)
├── Blog.tsx (~100 строк)
└── Contact.tsx (~100 строк)

app/page.tsx (~100 строк - только композиция)
```

**app/mvp/learn/page.tsx (367 строк) → разбить на:**
```
components/learn/
├── StudyCard.tsx (~80 строк)
├── QuizStep1.tsx (~60 строк)
├── QuizStep2.tsx (~60 строк)
├── QuizStep3.tsx (~60 строк)
├── ProgressBar.tsx (~30 строк)
└── WordAudio.tsx (~40 строк)

app/mvp/learn/page.tsx (~100 строк - логика и композиция)
```

### 8. Централизовать переводы

```typescript
// lib/i18n/index.ts (создать)
export type Language = 'en' | 'uz' | 'ru'

export const translations = {
  common: {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    uz: {
      signIn: 'Kirish',
      signUp: "Ro'yxatdan o'tish",
      loading: 'Yuklanmoqda...',
      error: 'Xato',
      success: 'Muvaffaqiyat',
    },
    ru: {
      signIn: 'Войти',
      signUp: 'Регистрация',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
    },
  },
  landing: {
    // ... переводы из app/page.tsx
  },
  chatbot: {
    // ... переводы из components/ai-chatbot.tsx
  },
  learn: {
    // ... переводы из app/mvp/learn/page.tsx
  },
} as const

// hooks/useTranslation.ts (создать)
import { useApp } from '@/context/app-context'
import { translations, Language } from '@/lib/i18n'

export function useTranslation<T extends keyof typeof translations>(
  namespace: T
) {
  const { user } = useApp()
  const lang = (user?.lang || 'en') as Language
  return translations[namespace][lang]
}

// Использование в компонентах:
import { useTranslation } from '@/hooks/useTranslation'

function MyComponent() {
  const t = useTranslation('common')
  return <button>{t.signIn}</button>
}
```

### 9. Добавить unit тесты

```bash
# Установить зависимости:
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts (создать)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

// vitest.setup.ts (создать)
import '@testing-library/jest-dom'

// lib/__tests__/auth.test.ts (создать)
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

  it('should return null when no token exists', () => {
    expect(getAuthToken()).toBeNull()
  })
})

// package.json - добавить скрипты:
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 10. Заменить console.log на logger

```typescript
// lib/logger.ts (создать)
type LogLevel = 'log' | 'error' | 'warn' | 'info'

const isDev = process.env.NODE_ENV === 'development'

class Logger {
  private log(level: LogLevel, ...args: any[]) {
    if (isDev) {
      console[level](...args)
    } else if (level === 'error') {
      // В продакшене отправлять только ошибки в Sentry
      console.error(...args)
      // TODO: Sentry.captureException(args[0])
    }
  }

  info(...args: any[]) {
    this.log('log', '[INFO]', ...args)
  }

  error(...args: any[]) {
    this.log('error', '[ERROR]', ...args)
  }

  warn(...args: any[]) {
    this.log('warn', '[WARN]', ...args)
  }

  debug(...args: any[]) {
    if (isDev) {
      this.log('log', '[DEBUG]', ...args)
    }
  }
}

export const logger = new Logger()

// Заменить все console.log/error на:
import { logger } from '@/lib/logger'
logger.info('Generating plan for level:', level)
logger.error('Plan generation failed:', error)
```

---

## 📈 Метрики для отслеживания прогресса

```bash
# Проверить количество any типов:
grep -r ": any" --include="*.ts" --include="*.tsx" | wc -l
# Цель: 0

# Проверить console statements:
grep -r "console\." app/ components/ context/ --include="*.ts" --include="*.tsx" | wc -l
# Цель: 0

# Проверить покрытие тестами:
pnpm test:coverage
# Цель: >70%

# Проверить размер компонентов:
find app/ -name "*.tsx" -exec wc -l {} + | sort -rn | head -5
# Цель: все <300 строк
```

---

## ✅ Чеклист готовности к продакшену

- [ ] API ключи удалены из Git истории
- [ ] Все `any` типы заменены на конкретные типы
- [ ] Добавлена валидация env переменных
- [ ] Добавлен Error Boundary
- [ ] Улучшена обработка ошибок (нет silent failures)
- [ ] Добавлен rate limiting для AI API
- [ ] Компоненты <300 строк каждый
- [ ] Переводы централизованы
- [ ] Покрытие тестами >70%
- [ ] Нет console.log в продакшен коде
- [ ] Настроен мониторинг ошибок (Sentry)
- [ ] Добавлены pre-commit hooks (husky)
- [ ] Lighthouse score >90

---

## 🔗 Полезные ссылки

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Zod Validation](https://zod.dev/)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

**Последнее обновление:** 2026-04-27  
**Следующий ревью:** После исправления критических проблем
