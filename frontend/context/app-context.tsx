'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { components, paths } from '@/lib/api-types'
import { buildApiUrl } from '@/lib/api'
import { clearAuthSession, getAuthToken } from '@/lib/auth'
import { logger } from '@/lib/logger'

type ApiSchemas = components['schemas']
type Lang = ApiSchemas['Language']
type Level = ApiSchemas['Level']

// Define a type for HTTP methods
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

// Helper type to extract response type from OpenAPI paths
type PathResponse<P extends keyof paths, M extends HttpMethod> = paths[P] extends {
  [K in M]: { responses: { '200': { content: { 'application/json': infer R } } } }
}
  ? R
  : never

// Helper type to extract request body type from OpenAPI paths
type PathRequestBody<P extends keyof paths, M extends HttpMethod> = paths[P] extends {
  [K in M]: { requestBody: { content: { 'application/json': infer B } } }
}
  ? B
  : never

export interface Word {
  id: string
  en: string
  uz: string
  ru: string
  ru_description?: string
  uz_description?: string
  en_description?: string
  definition?: string
  description?: string
  transcription?: string
  phonetic?: string
  phonetics?: Array<string | { text?: string; ipa?: string; value?: string }>
  locale_data?: {
    phonetics?: {
      us?: string
      uk?: string
    }
  }
  audio_url?: string | null // добавлено поле для озвучки
}

export interface DayPlan {
  day: number
  status: 'locked' | 'current' | 'completed'
  word_ids: string[]
  snippets?: { sentence: string; word_id: string }[]
}

export interface Plan {
  id: string
  level: Level
  month_index: number
  start_date: string
  days: DayPlan[]
}

export interface User {
  id: string
  name: string
  email: string
  lang: Lang
  level: Level
  created_at: string
}

export interface Stats {
  streak: number
  total_words_learned: number
  total_days_done: number
  avg_accuracy: number
  last_activity_date: string | null
}

export interface DayResult {
  day: number
  accuracy: number
  created_at: string
}

export interface IeltsStats {
  estimated_band: number
  target_band: number
  writing_tasks_completed: number
  vocabulary_mastered: number
  mock_tests_count: number
  activity_heatmap: Record<string, number>
}

// API Response interfaces
interface UserApiResponse {
  user: User
}

interface StatsApiResponse {
  stats: Stats
}

interface ResultsApiResponse {
  results: DayResult[]
}

interface PlanApiResponse {
  plan: Plan
}

interface PlanGenerateBody {
  level: Level
}

interface PlanGenerateResponse {
  plan: Plan
}

interface CurrentDayResponse {
  day: DayPlan
  words: Word[]
}

interface AppContextType {
  user: User | null
  stats: Stats | null
  ieltsStats: IeltsStats | null
  plan: Plan | null
  currentDay: { day: DayPlan; words: Word[] } | null
  results: DayResult[]
  loading: boolean
  authReady: boolean
  error: string
  hydrate: () => Promise<void>
  login: (token: string) => Promise<void>
  logout: () => void
  request: typeof request
}

const AppContext = createContext<AppContextType | undefined>(undefined)

async function request<
  P extends keyof paths,
  M extends HttpMethod = 'get',
  TResponse = PathResponse<P, M>,
  TBody = PathRequestBody<P, M>,
>(
  path: P,
  init?: Omit<RequestInit, 'body'> & { body?: TBody },
  method: M = 'get' as M,
  withAuth = true
): Promise<TResponse> {
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')
  if (withAuth) {
    const token = getAuthToken()
    if (!token) throw new Error('No token')
    headers.set('Authorization', `Bearer ${token}`)
  }

  const { body, ...restInit } = init || {}
  const fetchOptions: RequestInit = {
    ...restInit,
    method: method.toUpperCase(),
    headers,
  }

  if (body) {
    fetchOptions.body = JSON.stringify(body)
  }

  const res = await fetch(buildApiUrl(path), fetchOptions)
  const raw = await res.text()
  let parsed: unknown = null
  if (raw) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = null
    }
  }
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    if (parsed && typeof parsed === 'object') {
      const p = parsed as { detail?: string; message?: string }
      message = p.detail || p.message || message
    } else if (raw) {
      message = raw
    }
    throw new Error(message)
  }
  return (parsed as TResponse) ?? ({} as TResponse)
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [ieltsStats, setIeltsStats] = useState<IeltsStats | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [currentDay, setCurrentDay] = useState<{ day: DayPlan; words: Word[] } | null>(null)
  const [results, setResults] = useState<DayResult[]>([])
  const [loading, setLoading] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [error, setError] = useState('')

  const clearAppState = useCallback(() => {
    setUser(null)
    setStats(null)
    setIeltsStats(null)
    setPlan(null)
    setCurrentDay(null)
    setResults([])
  }, [])

  const logout = useCallback(() => {
    clearAppState()
    clearAuthSession()
    setError('')
    setLoading(false)
    setAuthReady(true)
    router.replace('/login')
  }, [clearAppState, router])

  const hydrate = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [u, s, r] = await Promise.all([
        request<'/api/v1/user', 'get', UserApiResponse>('/api/v1/user'),
        request<'/api/v1/stats', 'get', StatsApiResponse>('/api/v1/stats'),
        request<'/api/v1/results', 'get', ResultsApiResponse>('/api/v1/results'),
      ])
      setUser(u.user)
      setStats(s.stats)
      setResults(r.results)

      // Fetch IELTS stats if possible
      try {
        const isIelts = u.user.level === ('IELTS' as any)
        if (isIelts) {
          // IELTS endpoint may not be in api-types yet
          const istats = await request('/api/v1/ielts-mode/stats' as any, {}, 'get')
          setIeltsStats(istats as IeltsStats)
        }
      } catch (e) {
        // Silently skip if ielts stats fail or not found
      }

      let planLoaded = false
      let planData = null
      try {
        const p = await request<'/api/v1/plan', 'get', PlanApiResponse>('/api/v1/plan')
        const actualPlan = p.plan

        // Если план пришел пустым (нет дней или нет ID), считаем, что его нужно сгенерировать
        if (!actualPlan || (Array.isArray(actualPlan?.days) && actualPlan.days.length === 0)) {
          throw new Error('Empty plan')
        }

        setPlan(actualPlan)
        planLoaded = true
        planData = actualPlan
      } catch (e) {
        const msg = e instanceof Error ? e.message : ''
        const isNotFound =
          msg.toLowerCase().includes('not found') ||
          msg.toLowerCase().includes('не найден') ||
          msg.includes('404') ||
          msg.includes('Empty plan')

        // Если план не найден или пустой — создаём его
        if (isNotFound) {
          try {
            logger.info('Generating plan for level:', u.user.level)
            await request<'/api/v1/plan/generate', 'post', PlanGenerateResponse, PlanGenerateBody>(
              '/api/v1/plan/generate',
              {
                body: { level: u.user.level },
              },
              'post'
            )

            // Повторяем запрос на план после генерации
            const p2 = await request<'/api/v1/plan', 'get', PlanApiResponse>('/api/v1/plan')
            const actualPlan2 = p2.plan
            setPlan(actualPlan2)
            planLoaded = true
            planData = actualPlan2
          } catch (genErr) {
            logger.error('Plan generation failed:', genErr)
          }
        } else {
          logger.error('Plan hydration error:', msg)
        }
      }

      if (planLoaded && planData) {
        // Пытаемся получить currentDay, если не получилось — просто не сетим, не кидаем ошибку
        try {
          const c = await request<'/api/v1/day/current', 'get', CurrentDayResponse>(
            '/api/v1/day/current'
          )
          setCurrentDay(c)
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Unknown error')
          logger.error('Failed to fetch current day:', error.message)
        }
      }
      setAuthReady(true)
    } catch (e) {
      const nextError = e instanceof Error ? e.message : 'Hydration failed'
      setError(nextError)
      // Check for authentication errors (401, 404) or "No token" error
      if (
        nextError.includes('401') ||
        nextError.includes('404') ||
        nextError.includes('No token') ||
        nextError.toLowerCase().includes('unauthorized') ||
        nextError.toLowerCase().includes('not found')
      ) {
        logout()
        return
      }
      setAuthReady(true)
    } finally {
      setLoading(false)
    }
  }, [logout])

  const login = useCallback(
    async (token: string) => {
      const { setAuthToken } = await import('@/lib/auth')
      setAuthToken(token)
      await hydrate()
    },
    [hydrate]
  )

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setAuthReady(true)
      // Redirect handled by layouts
      return
    }

    void hydrate()
  }, [hydrate])

  return (
    <AppContext.Provider
      value={{
        user,
        stats,
        ieltsStats,
        plan,
        currentDay,
        results,
        loading,
        authReady,
        error,
        hydrate,
        login,
        logout,
        request,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
