'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, LockKeyhole, KeyRound } from 'lucide-react'

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
import { confirmPasswordReset, getErrorMessage } from '@/lib/auth-api'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const queryToken = searchParams.get('token')
    if (queryToken) {
      setToken(queryToken)
    }
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedToken = token.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirm = confirm.trim()

    if (!trimmedToken) {
      setError('Введите reset token.')
      return
    }

    if (!trimmedPassword) {
      setError('Введите новый пароль.')
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('Пароли не совпадают.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await confirmPasswordReset({
        token: trimmedToken,
        password: trimmedPassword,
      })
      setSuccess('Пароль обновлён. Теперь можно войти через `/login` по email и новому паролю.')
      setPassword('')
      setConfirm('')
      window.setTimeout(() => {
        router.replace('/login')
      }, 1200)
    } catch (nextError) {
      setError(getErrorMessage(nextError, 'Не удалось обновить пароль.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Reset Password"
      title="Отдельная страница завершает reset-flow."
      description="После запроса сброса пользователь попадает сюда по ссылке или вводит reset token вручную, затем задаёт новый пароль."
      highlights={[
        {
          title: 'Token',
          text: 'Если backend передаст `?token=...`, страница подхватит его автоматически из query string.',
        },
        {
          title: 'Update',
          text: 'После успешного обновления пароля пользователь возвращается на `/login` и входит уже по email + новый пароль.',
        },
      ]}
    >
      <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Обновить пароль</CardTitle>
          <CardDescription className="text-slate-400">
            Введите reset token и новый пароль. Токен можно передать и через query-параметр `token`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-token" className="text-slate-200">
                Reset token
              </Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="reset-token"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Token из email"
                  className="h-12 border-slate-800 bg-slate-900/80 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password" className="text-slate-200">
                Новый пароль
              </Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Минимум 8 символов"
                  className="h-12 border-slate-800 bg-slate-900/80 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm" className="text-slate-200">
                Повторите пароль
              </Label>
              <Input
                id="reset-password-confirm"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Повторите новый пароль"
                className="h-12 border-slate-800 bg-slate-900/80 text-white placeholder:text-slate-500"
              />
            </div>

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
              Обновить пароль
            </Button>

            <p className="text-center text-sm text-slate-400">
              Вернуться ко входу?{' '}
              <Link href="/login" className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                Открыть `/login`
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          eyebrow="Reset Password"
          title="Загружаем reset-flow."
          description="Подготавливаем форму обновления пароля и читаем reset token из URL."
          highlights={[
            {
              title: 'Loading',
              text: 'Страница ждёт инициализацию query-параметров перед рендерингом формы.',
            },
            {
              title: 'Next.js',
              text: 'Suspense нужен для статической сборки страницы с `useSearchParams()` в App Router.',
            },
          ]}
        >
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/70">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
