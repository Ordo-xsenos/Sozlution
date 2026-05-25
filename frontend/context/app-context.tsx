'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { components } from '@/lib/api-types'
import { buildApiUrl } from '@/lib/api'
import { clearAuthSession, getAuthToken } from '@/lib/auth'
import { logger } from '@/lib/logger'

export type User = Omit<components['schemas']['UserPublic'], 'level'> & {
  level: components['schemas']['Level'] | 'IELTS'
}

export type PlanDay = {
  day: number
  status: 'locked' | 'current' | 'completed'
  word_ids?: string[]
}

export type DayPlan = {
  id: string
  user_id: string
  level: string
  month_index: number
  start_date: string
  days: PlanDay[]
}

export type DayResult = {
  day: number
  step1: Record<string, boolean>
  step2: Record<string, boolean>
  step3: Record<string, number>
  accuracy: number
  created_at: string
}

export type Word = {
  id: string
  en: string
  uz: string
  ru: string
  ru_description?: string
  uz_description?: string
  en_description?: string
  definition?: string
  description?: string
  locale_data?: {
    phonetics?: { us?: string; uk?: string }
    russian_translate?: string
    uzbek_translate?: string
    russian_description?: string
    uzbek_description?: string
    [key: string]: unknown
  }
  level_tag?: string
  audio_url?: string | null
  phonetics?: Array<string | { text?: string; ipa?: string; value?: string }>
  transcription?: string
  phonetic?: string
}

export type UserStats = {
  streak: number
  total_words_learned: number
  total_days_done: number
  avg_accuracy: number
  last_activity_date: string | null
}

export type IeltsStats = {
  estimated_band: number
  target_band: number
  writing_tasks_completed: number
  vocabulary_mastered: number
  mock_tests_count: number
  activity_heatmap: Record<string, number>
}

type AppContextType = {
  user: User | null
  stats: UserStats | null
  ieltsStats: IeltsStats | null
  plan: DayPlan | null
  currentDay: { day: PlanDay; words: Word[] } | null
  results: DayResult[]
  loading: boolean
  authReady: boolean
  error: string
  logout: () => void
  hydrate: () => Promise<void>
  login: (token: string) => Promise<void>
  updateUser: (payload: components['schemas']['UserUpdate']) => Promise<User>
  request: (
    path: string,
    options?: { body?: unknown; headers?: Record<string, string> },
    method?: string
  ) => Promise<unknown>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

type UserUpdateBody = components['schemas']['UserUpdate']
type UserApiResponse = { user: User }
type StatsApiResponse = { stats: UserStats }
type PlanApiResponse = { plan: DayPlan }
type ResultsApiResponse = { results: DayResult[] }
type CurrentDayResponse = { day: PlanDay; words: Word[] }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [ieltsStats, setIeltsStats] = useState<IeltsStats | null>(null)
  const [plan, setPlan] = useState<DayPlan | null>(null)
  const [currentDay, setCurrentDay] = useState<{ day: PlanDay; words: Word[] } | null>(null)
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

  const request = useCallback(
    async (path: string, options: any = {}, method: string = 'get'): Promise<any> => {
      const token = getAuthToken()
      const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      }

      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body)
      }

      const res = await fetch(buildApiUrl(path), fetchOptions)
      const raw = await res.text()
      let parsed: any = null
      if (raw) {
        try {
          parsed = JSON.parse(raw)
        } catch {
          /* v8 ignore next */
          parsed = null
        }
      }

      if (!res.ok) {
        /* v8 ignore start */
        const msg = parsed?.detail || parsed?.message || raw || `HTTP ${res.status}`
        throw new Error(msg)
        /* v8 ignore end */
      }

      return parsed || {}
    },
    []
  )

  const hydrate = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [u, s, r] = await Promise.all([
        request('/api/v1/user') as Promise<UserApiResponse>,
        request('/api/v1/stats') as Promise<StatsApiResponse>,
        request('/api/v1/results') as Promise<ResultsApiResponse>,
      ])

      setUser(u.user)
      setStats(s.stats)
      setResults(r.results)

      if (u.user.level === 'IELTS') {
        try {
          const is = (await request('/api/v1/ielts-mode/stats')) as IeltsStats
          setIeltsStats(is)
        } catch { /* v8 ignore next */ }
      }

      let planLoaded = false
      let planData = null
      try {
        const p = (await request('/api/v1/plan')) as PlanApiResponse
        if (!p.plan || (p.plan.days && p.plan.days.length === 0)) {
          throw new Error('Empty plan')
        }
        setPlan(p.plan)
        planLoaded = true
        planData = p.plan
      } catch (e) {
        const msg = e instanceof Error ? e.message : ''
        if (msg.includes('404') || msg.includes('Not found') || msg.includes('Empty plan')) {
          try {
            logger.info('Generating plan for user level:', u.user.level)
            await request('/api/v1/plan/generate', {}, 'post')
            const p2 = (await request('/api/v1/plan')) as PlanApiResponse
            setPlan(p2.plan)
            planLoaded = true
            planData = p2.plan
          } catch (genErr) {
            /* v8 ignore start */
            logger.error('Plan generation failed:', genErr)
            /* v8 ignore end */
          }
        } else {
          /* v8 ignore start */
          logger.error('Plan hydration error:', msg)
          /* v8 ignore end */
        }
      }

      if (planLoaded && planData) {
        try {
          const c = (await request('/api/v1/day/current')) as CurrentDayResponse
          setCurrentDay(c)
        } catch (dayErr) {
          /* v8 ignore start */
          logger.error('Failed to fetch current day:', dayErr instanceof Error ? dayErr.message : dayErr)
          /* v8 ignore end */
        }
      }

      setAuthReady(true)
    } catch (e) {
      const nextError = e instanceof Error ? e.message : 'Hydration failed'
      setError(nextError)
      /* v8 ignore start */
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
      /* v8 ignore end */
      setAuthReady(true)
    } finally {
      setLoading(false)
    }
  }, [logout, request])

  const login = useCallback(
    async (token: string) => {
      const { setAuthToken } = await import('@/lib/auth')
      setAuthToken(token)
      await hydrate()
    },
    [hydrate]
  )

  const updateUser = useCallback(
    async (payload: UserUpdateBody) => {
      const response = (await request(
        '/api/v1/user',
        { body: payload },
        'patch'
      )) as UserApiResponse
      setUser(response.user)
      return response.user
    },
    [request]
  )

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setAuthReady(true)
      return
    }
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        logout,
        hydrate,
        login,
        updateUser,
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
    /* v8 ignore start */
    throw new Error('useApp must be used within AppProvider')
    /* v8 ignore end */
  }
  return context
}
