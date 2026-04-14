'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { components, paths } from '@/lib/api-types'

type ApiSchemas = components['schemas']
type Lang = ApiSchemas['Language']
type Level = ApiSchemas['Level']

// Define a type for HTTP methods
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

// Helper type to extract response type from OpenAPI paths
type PathResponse<P extends keyof paths, M extends HttpMethod> =
  paths[P] extends { [K in M]: { responses: { '200': { content: { 'application/json': infer R } } } } }
    ? R
    : never

// Helper type to extract request body type from OpenAPI paths
type PathRequestBody<P extends keyof paths, M extends HttpMethod> =
  paths[P] extends { [K in M]: { requestBody: { content: { 'application/json': infer B } } } }
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
const TOKEN_KEY = 'sozlution_mvp_token'

interface AppContextType {
  user: User | null
  stats: Stats | null
  plan: Plan | null
  currentDay: { day: DayPlan; words: Word[] } | null
  results: DayResult[]
  loading: boolean
  error: string
  hydrate: () => Promise<void>
  logout: () => void
  request: typeof request
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function api(path: string) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  if (/^https?:\/\//i.test(path)) return path
  let normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

async function request<
  P extends keyof paths,
  M extends HttpMethod = 'get',
  TResponse = PathResponse<P, M>,
  TBody = PathRequestBody<P, M>
>(
  path: P,
  init?: Omit<RequestInit, 'body'> & { body?: TBody },
  method: M = 'get' as M,
  withAuth = true,
): Promise<TResponse> {
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')
  if (withAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
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

  const res = await fetch(api(path), fetchOptions)
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
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [currentDay, setCurrentDay] = useState<{ day: DayPlan; words: Word[] } | null>(null)
  const [results, setResults] = useState<DayResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hydrate = async () => {
    setLoading(true)
    setError('')
    try {
      const [u, s, r] = await Promise.all([
        request<'/api/v1/user', 'get', { user: User }>('/api/v1/user'),
        request<'/api/v1/stats', 'get', { stats: Stats }>('/api/v1/stats'),
        request<'/api/v1/results', 'get', { results: DayResult[] }>('/api/v1/results'),
      ])
      setUser(u.user)
      setStats(s.stats)
      setResults(r.results)

      try {
        const p = await request<'/api/v1/plan', 'get', { plan: Plan }>('/api/v1/plan')
        const c = await request<'/api/v1/day/current', 'get', { day: DayPlan; words: Word[] }>('/api/v1/day/current')
        setPlan(p.plan)
        setCurrentDay(c)
      } catch (e) {
        console.error('Plan hydration failed', e)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hydration failed')
      if (e instanceof Error && e.message.includes('401')) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      hydrate()
    }
  }, [])

  const logout = () => {
    setUser(null)
    setStats(null)
    setPlan(null)
    setCurrentDay(null)
    setResults([])
    localStorage.removeItem(TOKEN_KEY)
  }

  return (
    <AppContext.Provider
      value={{
        user,
        stats,
        plan,
        currentDay,
        results,
        loading,
        error,
        hydrate,
        logout,
        request
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
