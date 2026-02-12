'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart3, BookOpen, Bot, Flame, HelpCircle, Home, Medal, Moon, Settings, Sparkles, Sun } from 'lucide-react'
import Antigravity from '@/components/effects/antigravity'

type Lang = 'uz' | 'ru'
type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
type Stage = 'language' | 'auth' | 'test' | 'app'
type View = 'dashboard' | 'learn' | 'coach' | 'progress' | 'achievements' | 'tips' | 'help' | 'settings'
type LearnStep = 1 | 2 | 3
type UiTheme = 'dark' | 'light'
type CheckState = 'idle' | 'correct' | 'wrong'

type User = { id: string; name: string; lang: Lang; level: Level; created_at: string }
type Stats = { streak: number; total_words_learned: number; total_days_done: number; avg_accuracy: number; last_activity_date: string | null }
type Question = { id: string; en: string; options: { uz: string[]; ru: string[] }; correct_index: number }
type DayPlan = { day: number; status: 'locked' | 'current' | 'completed'; word_ids: string[]; snippets?: { sentence: string; word_id: string }[] }
type Plan = { id: string; level: Level; month_index: number; start_date: string; days: DayPlan[] }
type Word = { id: string; en: string; uz: string; ru: string; ru_description?: string; uz_description?: string }
type DayCurrent = { day: DayPlan; words: Word[] }
type DayResult = { day: number; accuracy: number; created_at: string }
type WordAssist = { translation: string; description: string }
type CoachMessage = { role: 'user' | 'assistant'; text: string }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
const TOKEN_KEY = 'sozlution_mvp_token'
const DEVICE_KEY = 'sozlution_mvp_device_id'

const tr = {
  ru: {
    chooseLang: 'Выберите язык',
    continue: 'Продолжить',
    login: 'Вход',
    signup: 'Регистрация',
    forgot: 'Забыли пароль?',
    user: 'Имя пользователя',
    pass: 'Пароль',
    test: 'Тест уровня',
    submit: 'Отправить',
    greet: 'Привет',
    daily: 'Выполняйте ежедневный план',
    learn: 'Учить сейчас',
    streak: 'Ударный режим',
    words: 'Выучено слов',
    step1: 'Шаг 1: Перевод',
    step2: 'Шаг 2: Контекст',
    step3: 'Шаг 3: Флэшкарточки',
    check: 'Проверить',
    finish: 'Завершить день',
    send: 'Отправить',
    settings: 'Настройки',
    progress: 'Прогресс',
    achievements: 'Достижения',
    tips: 'Советы',
    help: 'Помощь',
    helpHow: 'Как это работает',
    helpFlow: 'Тест уровня -> план на 30 дней -> 3 шага обучения -> прогресс и coach.',
    helpFaq: 'Смена языка и сброс прогресса доступны в настройках.',
  },
  uz: {
    chooseLang: 'Tilni tanlang', continue: 'Davom etish', login: 'Kirish', signup: "Ro'yxatdan o'tish", forgot: 'Parolni unutdingizmi?',
    user: 'Foydalanuvchi nomi', pass: 'Parol', test: 'Daraja testi', submit: 'Yuborish', greet: 'Salom',
    daily: 'Kunlik reja', learn: "Hozir o'rganish", streak: 'Seriya', words: "O'rganilgan so'zlar",
    step1: '1-qadam: Tarjima', step2: '2-qadam: Kontekst', step3: '3-qadam: Flashcard', check: 'Tekshirish',
    finish: 'Kunni yakunlash', send: 'Yuborish', settings: 'Sozlamalar', progress: 'Progress', achievements: 'Yutuqlar',
    tips: 'Maslahatlar', help: 'Yordam', helpHow: 'Qanday ishlaydi',
    helpFlow: "Daraja testi -> 30 kunlik reja -> 3 bosqichli dars -> progress va coach.",
    helpFaq: "Tilni almashtirish va progressni tozalash sozlamalarda mavjud.",
  },
} as const

function api(path: string) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (base.endsWith('/api/mvp') && normalizedPath.startsWith('/api/mvp/')) {
    return `${base}${normalizedPath.replace('/api/mvp', '')}`
  }
  return `${base}${normalizedPath}`
}
function dedupe(words: Word[]) { return Array.from(new Map(words.map((w) => [w.id, w])).values()) }
function getDeviceId() {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const next = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, next)
  return next
}

export default function MvpPage() {
  const [stage, setStage] = useState<Stage>('language')
  const [view, setView] = useState<View>('dashboard')
  const [lang, setLang] = useState<Lang>('ru')
  const t = tr[lang]

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [current, setCurrent] = useState<DayCurrent | null>(null)
  const [results, setResults] = useState<DayResult[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const [learnStep, setLearnStep] = useState<LearnStep>(1)
  const [learnIndex, setLearnIndex] = useState(0)
  const [learnInput, setLearnInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [step1, setStep1] = useState<Record<string, boolean>>({})
  const [step2, setStep2] = useState<Record<string, boolean>>({})
  const [step3, setStep3] = useState<Record<string, number>>({})

  const [coachInput, setCoachInput] = useState('')
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([])
  const [uiTheme, setUiTheme] = useState<UiTheme>('dark')
  const isDark = uiTheme === 'dark'
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [learnHydrated, setLearnHydrated] = useState(false)
  const [wordAssist, setWordAssist] = useState<WordAssist | null>(null)

  const lessonWords = useMemo(() => dedupe(current?.words || []).slice(0, 20), [current?.words])
  const active = lessonWords[learnIndex] || null
  const selectedDay = plan?.days.find((d) => d.status === 'current') || null
  const learnStateKey = useMemo(
    () => (user && current?.day?.day ? `sozlution_mvp_learn_${user.id}_${current.day.day}` : ''),
    [user?.id, current?.day?.day],
  )
  const trend = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const day = i + 1
        const item = results.find((r) => r.day === day)
        return { day, accuracy: Math.round(item?.accuracy || 0) }
      }),
    [results],
  )

  const step2Options = useMemo(() => {
    if (!active) return []
    const correct = lang === 'ru' ? active.ru : active.uz
    const distractors = lessonWords.map((w) => (lang === 'ru' ? w.ru : w.uz)).filter((d) => d !== correct).slice(0, 3)
    return [correct, ...distractors].sort(() => Math.random() - 0.5)
  }, [active, lessonWords, lang, learnIndex])

  const sentence = useMemo(() => (active ? `I use [ ... ] every day.` : ''), [active])

  async function request<T>(path: string, init?: RequestInit, withAuth = true): Promise<T> {
    const headers = new Headers(init?.headers || {})
    headers.set('Content-Type', 'application/json')
    if (withAuth) {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) throw new Error('No token')
      headers.set('Authorization', `Bearer ${token}`)
    }
    const res = await fetch(api(path), { ...init, headers })
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
      if ((res.status === 401 || res.status === 403) && /invalid token/i.test(message)) {
        localStorage.removeItem(TOKEN_KEY)
        setStage('auth')
      }
      throw new Error(message)
    }
    return (parsed as T) ?? ({} as T)
  }

  async function hydrate() {
    const [u, s, r] = await Promise.all([
      request<{ user: User }>('/api/mvp/user'),
      request<{ stats: Stats }>('/api/mvp/stats'),
      request<{ results: DayResult[] }>('/api/mvp/results'),
    ])
    setUser(u.user)
    setName(u.user.name)
    setLang(u.user.lang)
    setStats(s.stats)
    setResults(r.results)
    try {
      let p = await request<{ plan: Plan }>('/api/mvp/plan')
      let c = await request<DayCurrent>('/api/mvp/day/current')
      const hasPlaceholderWords = c.words.some((w) => /^word[\s-]*\d+$/i.test((w.en || '').trim()))
      if (hasPlaceholderWords) {
        await request('/api/mvp/plan/generate', { method: 'POST', body: JSON.stringify({ level: u.user.level }) })
        p = await request<{ plan: Plan }>('/api/mvp/plan')
        c = await request<DayCurrent>('/api/mvp/day/current')
      }
      setPlan(p.plan)
      setCurrent(c)
    } catch {
      try {
        await request('/api/mvp/plan/generate', { method: 'POST', body: JSON.stringify({ level: u.user.level }) })
        const p = await request<{ plan: Plan }>('/api/mvp/plan')
        const c = await request<DayCurrent>('/api/mvp/day/current')
        setPlan(p.plan)
        setCurrent(c)
      } catch {
        setPlan(null)
        setCurrent(null)
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const savedTheme = localStorage.getItem('sozlution_mvp_theme') as UiTheme | null
    if (savedTheme === 'dark' || savedTheme === 'light') setUiTheme(savedTheme)
    if (!token) return
    setLoading(true)
    hydrate().then(() => setStage('app')).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem('sozlution_mvp_theme', uiTheme)
  }, [uiTheme])

  useEffect(() => {
    if (view !== 'learn') return
    if (!learnStateKey) return
    const raw = localStorage.getItem(learnStateKey)
    if (!raw) {
      setLearnStep(1); setLearnIndex(0); setLearnInput(''); setFeedback(''); setStep1({}); setStep2({}); setStep3({}); setCheckState('idle')
      setLearnHydrated(true)
      return
    }
    try {
      const parsed = JSON.parse(raw) as {
        learnStep?: LearnStep
        learnIndex?: number
        learnInput?: string
        feedback?: string
        step1?: Record<string, boolean>
        step2?: Record<string, boolean>
        step3?: Record<string, number>
        checkState?: CheckState
      }
      setLearnStep(parsed.learnStep || 1)
      setLearnIndex(parsed.learnIndex || 0)
      setLearnInput(parsed.learnInput || '')
      setFeedback(parsed.feedback || '')
      setStep1(parsed.step1 || {})
      setStep2(parsed.step2 || {})
      setStep3(parsed.step3 || {})
      setCheckState(parsed.checkState || 'idle')
    } catch {
      setLearnStep(1); setLearnIndex(0); setLearnInput(''); setFeedback(''); setStep1({}); setStep2({}); setStep3({}); setCheckState('idle')
    } finally {
      setLearnHydrated(true)
    }
  }, [view, learnStateKey])

  useEffect(() => {
    if (view !== 'learn' || !learnStateKey || !learnHydrated) return
    localStorage.setItem(
      learnStateKey,
      JSON.stringify({ learnStep, learnIndex, learnInput, feedback, step1, step2, step3, checkState }),
    )
  }, [view, learnStateKey, learnHydrated, learnStep, learnIndex, learnInput, feedback, step1, step2, step3, checkState])

  useEffect(() => {
    if (view !== 'learn' || !active) return
    const currentTranslation = (lang === 'ru' ? active.ru : active.uz) || ''
    const currentDescription = lang === 'ru' ? (active.ru_description || '') : (active.uz_description || '')
    const looksUnlocalized = !currentTranslation || !currentDescription || currentTranslation.trim() === currentDescription.trim()
    if (!looksUnlocalized) {
      setWordAssist(null)
      return
    }
    let cancelled = false
    request<WordAssist>('/api/mvp/ai/word-assist', {
      method: 'POST',
      body: JSON.stringify({
        word_id: active.id,
        word: active.en,
        lang,
        hint: currentTranslation || active.en,
      }),
    })
      .then((data) => {
        if (!cancelled) setWordAssist(data)
      })
      .catch(() => {
        if (!cancelled) setWordAssist(null)
      })
    return () => {
      cancelled = true
    }
  }, [view, active?.id, lang])

  async function createSession(mode: 'login' | 'register') {
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      const session = await request<{ user: User; session_token: string }>('/api/mvp/session', {
        method: 'POST', body: JSON.stringify({ mode, name: name.trim(), password: password.trim() || undefined, lang, device_id: getDeviceId() }),
      }, false)
      localStorage.setItem(TOKEN_KEY, session.session_token)
      const q = await request<{ questions: Question[] }>('/api/mvp/test/questions')
      setUser(session.user); setQuestions(q.questions); setAnswers({}); setStage('test')
    } catch (e) { setError(e instanceof Error ? e.message : 'Session error') } finally { setLoading(false) }
  }

  async function submitTest() {
    setLoading(true); setError('')
    try {
      const r = await request<{ level: Level }>('/api/mvp/test/submit', { method: 'POST', body: JSON.stringify({ answers }) })
      await request('/api/mvp/plan/generate', { method: 'POST', body: JSON.stringify({ level: r.level }) })
      await hydrate(); setStage('app'); setView('dashboard')
    } catch (e) { setError(e instanceof Error ? e.message : 'Submit error') } finally { setLoading(false) }
  }

  function nextWord() {
    if (learnIndex < lessonWords.length - 1) { setLearnIndex((v) => v + 1); setLearnInput(''); setFeedback(''); setCheckState('idle'); return false }
    setLearnIndex(0); setLearnInput(''); setFeedback(''); setCheckState('idle'); return true
  }

  function checkStep1() {
    if (!active) return
    const expectedRaw = (wordAssist?.translation || (lang === 'ru' ? active.ru : active.uz)).trim()
    const expected = expectedRaw.toLowerCase()
    const ok = learnInput.trim().toLowerCase() === expected
    setStep1((p) => ({ ...p, [active.id]: ok }))
    setCheckState(ok ? 'correct' : 'wrong')
    setFeedback(expectedRaw)
    if (ok) {
      setTimeout(() => {
        if (nextWord()) setLearnStep(2)
      }, 450)
    }
  }

  function checkStep2(value: string) {
    if (!active) return
    const expected = lang === 'ru' ? active.ru : active.uz
    setStep2((p) => ({ ...p, [active.id]: value === expected }))
    if (nextWord()) setLearnStep(3)
  }

  function checkStep3(rate: number) {
    if (!active) return
    setStep3((p) => ({ ...p, [active.id]: rate }))
    if (nextWord()) completeDay()
  }

  async function completeDay() {
    if (!current?.day.day) return
    setLoading(true); setError('')
    try {
      await request('/api/mvp/day/complete', { method: 'POST', body: JSON.stringify({ day: current.day.day, step1, step2, step3 }) })
      if (learnStateKey) localStorage.removeItem(learnStateKey)
      await hydrate(); setView('coach')
    } catch (e) { setError(e instanceof Error ? e.message : 'Complete error') } finally { setLoading(false) }
  }

  async function sendCoach() {
    if (!coachInput.trim()) return
    const message = coachInput.trim()
    const historyPayload = coachMessages.map((m) => ({ role: m.role, text: m.text }))
    setCoachMessages((prev) => [...prev, { role: 'user', text: message }])
    try {
      const r = await request<{ text: string }>('/api/mvp/ai/chat', { method: 'POST', body: JSON.stringify({ message, history: historyPayload }) })
      setCoachMessages((prev) => [...prev, { role: 'assistant', text: r.text }])
      setCoachInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI chat error')
    }
  }

  async function exportData() {
    const payload = await request<unknown>('/api/mvp/export')
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'sozlution-mvp-export.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function updateLanguage(next: Lang) { setLang(next); await request('/api/mvp/user', { method: 'PATCH', body: JSON.stringify({ lang: next }) }); await hydrate() }
  async function resetProgress() { await request('/api/mvp/reset-progress', { method: 'POST', body: JSON.stringify({}) }); await hydrate(); setView('dashboard') }
  function logout() { localStorage.removeItem(TOKEN_KEY); setStage('language'); setView('dashboard'); setUser(null); setStats(null); setPlan(null); setCurrent(null); setResults([]); setQuestions([]); setAnswers({}) }

  const nav = [
    { key: 'dashboard' as const, label: lang === 'ru' ? 'Дашборд' : 'Dashboard', icon: Home },
    { key: 'learn' as const, label: t.learn, icon: BookOpen },
    { key: 'coach' as const, label: "So'zlution AI Coach", icon: Bot },
    { key: 'progress' as const, label: t.progress, icon: BarChart3 },
    { key: 'achievements' as const, label: t.achievements, icon: Medal },
    { key: 'tips' as const, label: t.tips, icon: Sparkles },
    { key: 'help' as const, label: t.help, icon: HelpCircle },
    { key: 'settings' as const, label: t.settings, icon: Settings },
  ]

  if (stage !== 'app') {
    return (
      <main className={`mvp-shell ${isDark ? 'mvp-dark' : 'mvp-light'} relative min-h-screen overflow-hidden ${isDark ? 'bg-[#050b18] text-[#dbeafe]' : 'bg-[#f4f8fd] text-[#1e2b3d]'}`}>
        <div className={`pointer-events-none absolute inset-0 ${isDark ? 'opacity-95' : 'opacity-70'}`}><Antigravity count={isDark ? 380 : 220} color={isDark ? '#8ec5ff' : '#74b4f9'} /></div>
        <section className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center px-4 py-12">
          <div className={`w-full rounded-3xl border p-8 backdrop-blur-sm ${stage === 'auth' ? (isDark ? 'border-[#22314f]/70 bg-[#0d172b]/40' : 'border-[#d7e3f2]/70 bg-white/35') : (isDark ? 'border-[#22314f] bg-[#0d172b]/90' : 'border-[#d7e3f2] bg-white/90')}`}>
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-black ${isDark ? 'text-[#f8fbff]' : 'text-[#1e2b3d]'}`}>So&apos;zlution MVP</h1>
              {stage !== 'auth' && <button onClick={() => setUiTheme((v) => (v === 'dark' ? 'light' : 'dark'))} className={`rounded-xl px-3 py-2 font-semibold ${isDark ? 'bg-[#182742] text-[#dbeafe]' : 'bg-[#edf5ff] text-[#4f9df1]'}`}>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>}
            </div>
            {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
            {stage === 'language' && <div className="mt-8"><p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8ea0b8]">{t.chooseLang}</p><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setLang('uz')} className={`rounded-2xl px-5 py-4 text-lg font-bold ${lang === 'uz' ? 'bg-[#4f9df1] text-white' : 'bg-[#edf5ff] text-[#4f9df1]'}`}>uz O&apos;zbek</button><button onClick={() => setLang('ru')} className={`rounded-2xl px-5 py-4 text-lg font-bold ${lang === 'ru' ? 'bg-[#4f9df1] text-white' : 'bg-[#edf5ff] text-[#4f9df1]'}`}>ru Русский</button></div><button onClick={() => setStage('auth')} className="mt-6 rounded-2xl bg-[#1f2d42] px-6 py-3 text-lg font-bold text-white">{t.continue}</button></div>}
            {stage === 'auth' && <div className="mt-8 min-h-[560px] rounded-3xl bg-[#171717] p-10 sm:p-12"><p className="text-center text-3xl font-bold text-white">{t.login}</p><div className="mt-10 space-y-5"><input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.user} autoComplete="username" className="w-full rounded-xl bg-[#232323] px-4 py-5 text-lg text-white outline-none placeholder:text-[#9ba8bc] focus:ring-2 focus:ring-[#4f9df1]" /><input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.pass} autoComplete="new-password" type="password" className="w-full rounded-xl bg-[#232323] px-4 py-5 text-lg text-white outline-none placeholder:text-[#9ba8bc] focus:ring-2 focus:ring-[#4f9df1]" /><p className="text-xs text-[#9ba8bc]">Use a new unique password (8+ chars), not reused on other sites.</p></div><div className="mt-10 grid gap-3 sm:grid-cols-3"><button onClick={() => createSession('login')} disabled={!name.trim() || loading} className="rounded-xl bg-[#252525] px-5 py-4 font-bold text-white hover:bg-black disabled:opacity-60">{t.login}</button><button onClick={() => createSession('register')} disabled={!name.trim() || loading} className="rounded-xl bg-[#252525] px-5 py-4 font-bold text-white hover:bg-black disabled:opacity-60">{t.signup}</button><button className="rounded-xl bg-[#252525] px-5 py-4 font-bold text-white hover:bg-red-600">{t.forgot}</button></div></div>}
            {stage === 'test' && <div className="mt-8"><h2 className={`text-2xl font-black ${isDark ? 'text-[#f8fbff]' : 'text-[#1e2b3d]'}`}>{t.test}</h2><p className={`mt-1 text-sm ${isDark ? 'text-[#9fb3cf]' : 'text-[#7e90a9]'}`}>20 вопросов для точной оценки уровня</p><div className="mt-5 space-y-3">{questions.map((q, idx) => <article key={q.id} className={`rounded-2xl border p-4 ${isDark ? 'border-[#283a58] bg-[#0f1a2e]' : 'border-[#dce7f4] bg-[#f8fbff]'}`}><p className={`text-lg font-semibold ${isDark ? 'text-[#e7effb]' : 'text-[#1e2b3d]'}`}>{idx + 1}. {q.en}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{(lang === 'ru' ? q.options.ru : q.options.uz).map((opt, i) => <button key={i} onClick={() => setAnswers((p) => ({ ...p, [q.id]: i }))} className={`rounded-xl border px-4 py-3 text-left font-medium transition-colors ${answers[q.id] === i ? 'border-[#4f9df1] bg-[#e8f1ff] text-[#2e6fc5]' : isDark ? 'border-[#334766] bg-[#111f36] text-[#d0def3] hover:border-[#4f9df1]' : 'border-[#dce7f4] bg-white text-[#526884] hover:border-[#9ec4f3]'}`}>{opt}</button>)}</div></article>)}</div><button onClick={submitTest} disabled={Object.keys(answers).length !== questions.length || loading} className="mt-6 rounded-xl bg-[#4f9df1] px-6 py-3 text-lg font-bold text-white disabled:opacity-60">{t.submit}</button></div>}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={`mvp-shell ${isDark ? 'mvp-dark' : 'mvp-light'} relative min-h-screen overflow-hidden ${isDark ? 'bg-[#050b18] text-[#dbeafe]' : 'bg-[#f4f8fd] text-[#1e2b3d]'}`}>
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'opacity-95' : 'opacity-65'}`}><Antigravity count={isDark ? 420 : 220} color={isDark ? '#8ec5ff' : '#5ca7f6'} /></div>
      <div className="relative z-10 flex min-h-screen">
        <aside className={`w-56 border-r p-5 backdrop-blur-sm ${isDark ? 'border-[#1f2f4a] bg-[#0b1528]/95' : 'border-[#e7edf5] bg-white/95'}`}>
          <Link href="/" className="mb-8 block text-2xl font-black">So&apos;<span className="text-[#4f9df1]">zlution</span></Link>
          <nav className="space-y-2">{nav.map((n) => { const Icon = n.icon; return <button key={n.key} onClick={() => setView(n.key)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left font-semibold ${view === n.key ? 'bg-[#e8f2ff] text-[#4f9df1]' : 'text-[#8ea0b8]'}`}><Icon className="h-4 w-4" />{n.label}</button> })}</nav>
          <div className="mt-10 rounded-2xl bg-[#eaf3ff] p-4 text-center"><p className="text-xl font-bold text-[#4f9df1]">{user?.level || 'A1'}</p><p className="text-xs text-[#8ea2bf]">Current Proficiency</p></div>
        </aside>
        <section className="relative flex-1 p-8">
          <button onClick={() => setUiTheme((v) => (v === 'dark' ? 'light' : 'dark'))} className={`absolute right-8 top-6 rounded-xl px-3 py-2 font-semibold ${isDark ? 'bg-[#182742] text-[#dbeafe]' : 'bg-[#edf5ff] text-[#4f9df1]'}`}>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {view === 'dashboard' && <div className="max-w-5xl space-y-6"><div className="flex items-start justify-between"><div><h1 className="text-5xl font-black">{t.greet}, {user?.name || 'user'}!</h1><p className="mt-1 text-lg text-[#95a7bf]">{t.daily}</p></div><div className="rounded-full bg-[#eaf3ff] px-6 py-4 text-3xl font-black text-[#4f9df1]">{user?.level || 'A1'}</div></div><div className="grid grid-cols-[1fr_260px] gap-5"><div className="rounded-[30px] bg-[#56a0ef] p-7 text-white"><p className="text-lg text-[#dcecff]">Daily tasks</p><h2 className="mt-2 text-5xl font-black">Day {selectedDay?.day || 1}: 30 Essential Words</h2><button onClick={() => setView('learn')} className="mt-6 rounded-2xl bg-white px-8 py-3 text-2xl font-black text-[#4f9df1]">{t.learn}</button></div><div className="space-y-4"><div className="rounded-2xl bg-white p-5"><Flame className="h-6 w-6 text-[#ef9f4e]" /><p className="text-5xl font-black">{stats?.streak || 0}</p><p className="text-xs uppercase tracking-[0.12em] text-[#9ba9bd]">{t.streak}</p></div><div className="rounded-2xl bg-white p-5"><p className="text-5xl font-black text-[#4f9df1]">{stats?.total_words_learned || 0}</p><p className="text-xs uppercase tracking-[0.12em] text-[#9ba9bd]">{t.words}</p></div></div></div></div>}
          {view === 'learn' && <div className="mx-auto max-w-3xl"><h2 className="text-5xl font-black">{learnStep === 1 ? t.step1 : learnStep === 2 ? t.step2 : t.step3}</h2><div className="mt-3 flex gap-2"><div className={`h-2 flex-1 rounded-full ${learnStep >= 1 ? 'bg-[#4f9df1]' : 'bg-[#e7edf5]'}`} /><div className={`h-2 flex-1 rounded-full ${learnStep >= 2 ? 'bg-[#4f9df1]' : 'bg-[#e7edf5]'}`} /><div className={`h-2 flex-1 rounded-full ${learnStep >= 3 ? 'bg-[#4f9df1]' : 'bg-[#e7edf5]'}`} /></div><div className="mt-8 rounded-3xl bg-[#eaf3ff] p-10 text-center"><p className="text-xs uppercase tracking-[0.14em] text-[#93b2d9]">English word</p><p className="mt-5 text-7xl font-black text-[#4f9df1]">{active?.en || '-'}</p><p className="mt-3 text-sm text-[#7f96b6]">Words today: {lessonWords.length}/20</p></div>{learnStep === 1 && <><input value={learnInput} onChange={(e) => { setLearnInput(e.target.value); if (checkState !== 'idle') setCheckState('idle') }} placeholder="..." className="mt-6 w-full rounded-3xl border-2 border-[#75b2f8] bg-white px-5 py-4 text-center text-2xl text-[#1e2b3d]" /><button onClick={checkStep1} className={`mt-4 w-full rounded-3xl px-5 py-4 text-3xl font-black text-white ${checkState === 'correct' ? 'bg-[#2ea66f]' : checkState === 'wrong' ? 'bg-[#e05252]' : 'bg-[#4f9df1]'}`}>{t.check}</button>{checkState !== 'idle' && active && <div className="mt-4 rounded-2xl bg-white p-5 text-left"><p className="text-xs uppercase tracking-wide text-[#8ea0b8]">Translation</p><p className="mt-1 text-2xl font-bold text-[#4f9df1]">{wordAssist?.translation || (lang === 'ru' ? active.ru : active.uz)}</p><p className="mt-3 text-xs uppercase tracking-wide text-[#8ea0b8]">Description</p><p className="mt-1 text-base text-[#526884]">{wordAssist?.description || (lang === 'ru' ? (active.ru_description || active.ru) : (active.uz_description || active.uz))}</p></div>}</>}{learnStep === 2 && <div className="mt-6 space-y-4"><div className="rounded-2xl bg-white p-5 text-lg text-[#526884]">{sentence || '...'}</div><div className="grid gap-2">{step2Options.map((opt) => <button key={opt} onClick={() => checkStep2(opt)} className="rounded-2xl border border-[#dce7f4] bg-white px-5 py-4 text-left text-xl font-semibold hover:border-[#4f9df1]">{opt}</button>)}</div></div>}{learnStep === 3 && <div className="mt-6 space-y-4"><div className="rounded-2xl bg-white p-5 text-center"><p className="text-sm uppercase tracking-wide text-[#8ea0b8]">Translation</p><p className="mt-2 text-3xl font-black text-[#4f9df1]">{wordAssist?.translation || (active ? (lang === 'ru' ? active.ru : active.uz) : '-')}</p></div><div className="grid grid-cols-2 gap-3"><button onClick={() => checkStep3(1)} className="rounded-2xl bg-[#fff2f2] px-5 py-4 text-xl font-bold text-[#ef5f5f]">Hard (1)</button><button onClick={() => checkStep3(5)} className="rounded-2xl bg-[#edf9f1] px-5 py-4 text-xl font-bold text-[#30a46c]">Easy (5)</button></div><button onClick={completeDay} className="w-full rounded-2xl bg-[#4f9df1] px-5 py-4 text-xl font-black text-white">{t.finish}</button></div>}</div>}
          {view === 'coach' && <div className="max-w-5xl"><h2 className="text-5xl font-black">So&apos;zlution AI Coach</h2><div className="mt-5 grid grid-cols-2 gap-5"><div className="rounded-3xl bg-white p-6"><h3 className="text-3xl font-black">Daily result</h3><div className="mt-4 grid grid-cols-2 rounded-2xl bg-[#f6f9fd] p-4 text-center"><div><p className="text-xs uppercase text-[#9ba9bd]">Accuracy</p><p className="text-5xl font-black text-[#4f9df1]">{Math.round(stats?.avg_accuracy || 0)}%</p></div><div><p className="text-xs uppercase text-[#9ba9bd]">Streak</p><p className="text-5xl font-black text-[#f19a4f]">{stats?.streak || 0}</p></div></div></div><div className="rounded-3xl bg-white"><div className="rounded-t-3xl bg-[#f9fcff] px-5 py-3 text-2xl font-bold">Tutor chat</div><div className="h-[520px] bg-[#eaf3ff] p-4"><div className="h-full overflow-y-auto rounded-xl bg-[#f8fbff] p-4">{coachMessages.length === 0 ? <p className="mt-8 text-center text-xl font-semibold text-[#7d92ae]">I&apos;m So&apos;zlution Tutor</p> : <div className="space-y-3">{coachMessages.map((msg, i) => <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'ml-auto bg-[#4f9df1] text-white' : 'mr-auto bg-white text-[#1e2b3d]'}`}>{msg.text}</div>)}</div>}</div></div><div className="p-4"><div className="flex gap-2"><input value={coachInput} onChange={(e) => setCoachInput(e.target.value)} placeholder="Message..." className="w-full rounded-xl border border-[#2b4167] bg-[#0f172a] px-4 py-3 text-white placeholder:text-[#dbeafe]" /><button onClick={sendCoach} className="rounded-xl bg-[#4f9df1] px-4 py-3 font-bold text-white">{t.send}</button></div></div></div></div></div>}
          {view === 'progress' && <div className="max-w-5xl"><h2 className="text-5xl font-black">{t.progress}</h2><div className="mt-5 rounded-3xl bg-white p-5"><div className="mb-3 flex items-center justify-between"><p className="text-3xl font-bold">Accuracy trend</p><span className="rounded-lg bg-[#edf5ff] px-3 py-2 text-sm font-bold text-[#4f9df1]">Last 7 Days</span></div><div className="grid grid-cols-7 gap-2 rounded-xl bg-[#f9fcff] p-3">{trend.map((point) => <div key={point.day} className="flex flex-col items-center justify-end gap-2"><div className="w-full rounded-md bg-[#e5eef8]" style={{ height: 110 }}><div className="w-full rounded-md bg-[#4f9df1]" style={{ height: `${Math.max(6, point.accuracy)}%` }} /></div><p className="text-xs font-semibold text-[#8ea0b8]">D{point.day}</p></div>)}</div></div><div className="mt-5 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-[#eaf3ff] p-5"><p className="text-xs uppercase text-[#76a4df]">Total words</p><p className="text-5xl font-black text-[#4f9df1]">{stats?.total_words_learned || 0}</p></div><div className="rounded-2xl bg-[#fdf7ef] p-5"><p className="text-xs uppercase text-[#ef9f4e]">Avg. accuracy</p><p className="text-5xl font-black text-[#ef9f4e]">{Math.round(stats?.avg_accuracy || 0)}%</p></div></div></div>}
          {view === 'achievements' && <div className="max-w-4xl"><h2 className="text-5xl font-black">{t.achievements}</h2><div className="mt-6 grid gap-4"><div className="rounded-2xl bg-white p-5"><p className="text-xl font-black">3-day streak</p><p className="text-sm text-[#6d7f97]">{(stats?.streak || 0) >= 3 ? 'Unlocked' : 'Locked'}</p></div><div className="rounded-2xl bg-white p-5"><p className="text-xl font-black">100 words learned</p><p className="text-sm text-[#6d7f97]">{(stats?.total_words_learned || 0) >= 100 ? 'Unlocked' : 'Locked'}</p></div><div className="rounded-2xl bg-white p-5"><p className="text-xl font-black">Accuracy 95%+</p><p className="text-sm text-[#6d7f97]">{(stats?.avg_accuracy || 0) >= 95 ? 'Unlocked' : 'Locked'}</p></div></div></div>}
          {view === 'tips' && <div className="max-w-4xl"><h2 className="text-5xl font-black">{t.tips}</h2><div className="mt-6 space-y-3">{lang === 'ru' ? <><div className="rounded-2xl bg-white p-5 font-semibold text-[#526884]">1. Повторяйте слова в тот же день.</div><div className="rounded-2xl bg-white p-5 font-semibold text-[#526884]">2. Используйте новые слова в предложениях.</div><div className="rounded-2xl bg-white p-5 font-semibold text-[#526884]">3. Поддерживайте ежедневную серию.</div></> : <><div className="rounded-2xl bg-white p-5 font-semibold text-[#526884]">1. So'zlarni shu kunning o'zida takrorlang.</div><div className="rounded-2xl bg-white p-5 font-semibold text-[#526884]">2. Yangi so'zlarni gaplarda ishlating.</div><div className="rounded-2xl bg-white p-5 font-semibold text-[#526884]">3. Har kuni seriyani davom ettiring.</div></>}</div></div>}
          {view === 'help' && <div className="max-w-4xl"><h2 className="text-5xl font-black">{t.help}</h2><div className="mt-6 rounded-2xl bg-white p-6"><p className="font-bold">{t.helpHow}</p><p className="mt-2 text-[#526884]">{t.helpFlow}</p><p className="mt-4 font-bold">FAQ</p><p className="mt-2 text-[#526884]">{t.helpFaq}</p><p className="mt-4 font-bold">Contact</p><p className="mt-2 text-[#526884]">Telegram: @sozlution_support</p></div></div>}
          {view === 'settings' && <div className="max-w-5xl"><h2 className="text-5xl font-black">{t.settings}</h2><div className="mt-5 rounded-3xl bg-white p-5"><p className="text-xs uppercase text-[#9aa8be]">Language</p><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => updateLanguage('uz')} className={`rounded-xl py-4 text-xl font-bold ${lang === 'uz' ? 'border-2 border-[#74b4f9] bg-[#edf5ff] text-[#4f9df1]' : 'bg-[#f6f9fd] text-[#9aa8be]'}`}>uz O&apos;zbek</button><button onClick={() => updateLanguage('ru')} className={`rounded-xl py-4 text-xl font-bold ${lang === 'ru' ? 'border-2 border-[#74b4f9] bg-[#edf5ff] text-[#4f9df1]' : 'bg-[#f6f9fd] text-[#9aa8be]'}`}>ru Русский</button></div></div><div className="mt-4 rounded-3xl bg-white p-5"><button onClick={exportData} className="w-full rounded-xl bg-[#f6f9fd] py-3 text-xl font-bold">Export data</button><button onClick={logout} className="mt-3 w-full rounded-xl bg-[#1f2d42] py-3 text-xl font-bold text-white">Sign out</button><button onClick={resetProgress} className="mt-3 w-full rounded-xl bg-[#fff2f2] py-3 text-xl font-bold text-[#ef5f5f]">Reset progress</button></div></div>}
          <div className="mt-8 text-sm text-[#9aa8be]">API: <code>{API_BASE_URL}</code> {loading ? ' • loading...' : ''}</div>
        </section>
      </div>
    </main>
  )
}

