'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LockKeyhole, Mail } from 'lucide-react'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAuthToken, getOrCreateDeviceId } from '@/lib/auth'
import { createSession, getErrorMessage, requestPasswordReset } from '@/lib/auth-api'
import { useApp } from '@/context/app-context'

type LoginMode = 'password' | 'reset'

export default function LoginPage() {
  const router = useRouter()
  const { login: appLogin } = useApp()
  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (getAuthToken()) {
      router.replace('/mvp')
    }
  }, [router])

  const submitPasswordLogin = async () => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail) {
      setError('Введите email.')
      return
    }

    if (!trimmedPassword) {
      setError('Введите пароль.')
      return
    }

    const session = await createSession({
      mode: 'login',
      email: trimmedEmail,
      password: trimmedPassword,
      lang: 'ru',
      device_id: getOrCreateDeviceId(),
    })

    if (!session.session_token) {
      throw new Error('Backend не вернул session_token.')
    }

    await appLogin(session.session_token)
    router.replace('/mvp')
  }

  const submitPasswordReset = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Введите email для сброса пароля.')
      return
    }

    await requestPasswordReset({ email: trimmedEmail })
    setSuccess('Если email существует, ссылка для сброса уже отправлена. После получения письма откройте страницу обновления пароля.')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'password') {
        await submitPasswordLogin()
      } else {
        await submitPasswordReset()
      }
    } catch (nextError) {
      setError(
        getErrorMessage(
          nextError,
          mode === 'password'
            ? 'Не удалось войти в аккаунт.'
            : 'Не удалось запросить сброс пароля.',
        ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Login"
      title="Вход по email и отдельный сценарий сброса пароля."
      description="Экран входа теперь работает только через email. Из него же можно запросить reset-link и перейти на отдельную страницу обновления пароля."
      highlights={[
        {
          title: 'Логин',
          text: 'Вход выполняется по `email + password` и создаёт новую сессию через `/api/v1/session`.',
        },
        {
          title: 'Сброс',
          text: 'Вторая вкладка отправляет запрос на reset-password и ведёт пользователя на отдельную страницу обновления.',
        },
      ]}
    >
      <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <CardHeader className="space-y-4">
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as LoginMode)
              setError('')
              setSuccess('')
            }}
            className="w-full"
          >
            <TabsList className="grid h-11 w-full grid-cols-2 bg-slate-900/80">
              <TabsTrigger value="password">Email + пароль</TabsTrigger>
              <TabsTrigger value="reset">Email + сброс</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {mode === 'password' ? 'Войти в аккаунт' : 'Запросить сброс пароля'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {mode === 'password'
                ? 'Используйте email и пароль, чтобы продолжить обучение.'
                : 'Введите email, и backend должен отправить reset-token или ссылку для обновления пароля.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-slate-200">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 border-slate-800 bg-slate-900/80 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {mode === 'password' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="login-password" className="text-slate-200">
                    Пароль
                  </Label>
                  <Link href="/reset-password" className="text-xs text-cyan-300 transition-colors hover:text-cyan-200">
                    Уже есть reset token?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ваш пароль"
                    className="h-12 border-slate-800 bg-slate-900/80 pl-10 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            ) : null}

            <Button
              className="h-12 w-full rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              disabled={submitting}
              type="submit"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === 'password' ? 'Войти' : 'Отправить reset-link'}
            </Button>

            <div className="space-y-2 text-center text-sm text-slate-400">
              <p>
                Нет аккаунта?{' '}
                <Link href="/register" className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                  Перейти к регистрации
                </Link>
              </p>
              <p>
                Нужно обновить пароль вручную?{' '}
                <Link href="/reset-password" className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                  Открыть reset-password
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
