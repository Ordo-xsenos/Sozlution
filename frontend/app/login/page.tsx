'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LockKeyhole, Mail } from 'lucide-react'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAuthToken, getOrCreateDeviceId } from '@/lib/auth'
import { createSession, getErrorMessage, requestPasswordReset } from '@/lib/auth-api'
import { useApp } from '@/context/app-context'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

type LoginMode = 'password' | 'reset'

export default function LoginPage() {
  const router = useRouter()
  const { login: appLogin, user, authReady } = useApp()
  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const t = mvpText[getMvpLang(user?.lang)].auth

  useEffect(() => {
    if (authReady && user) {
      router.replace('/mvp')
    }
  }, [authReady, user, router])

  const submitPasswordLogin = async () => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail) {
      setError(t.enterEmailError)
      return
    }

    if (!trimmedPassword) {
      setError(t.enterPasswordError)
      return
    }

    const session = await createSession({
      mode: 'login',
      email: trimmedEmail,
      password: trimmedPassword,
      lang: getMvpLang(user?.lang),
      device_id: getOrCreateDeviceId(),
    })

    if (!session.session_token) {
      throw new Error('Backend did not return session_token.')
    }

    await appLogin(session.session_token)
    router.replace('/mvp')
  }

  const submitPasswordReset = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError(t.enterEmailResetError)
      return
    }

    await requestPasswordReset({ email: trimmedEmail })
    setSuccess(t.successReset)
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
          mode === 'password' ? t.loginError : t.resetError
        )
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Login"
      title={t.loginTitle}
      description={t.loginDesc}
      highlights={[
        {
          title: t.loginButton,
          text: t.loginDesc,
        },
        {
          title: t.resetTitle,
          text: t.resetDesc,
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
              <TabsTrigger value="password">{t.loginTab}</TabsTrigger>
              <TabsTrigger value="reset">{t.resetTab}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {mode === 'password' ? t.loginTitle : t.resetTitle}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {mode === 'password' ? t.loginDesc : t.resetDesc}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-slate-200">
                {t.emailLabel}
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
                    {t.passwordLabel}
                  </Label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-cyan-300 transition-colors hover:text-cyan-200"
                  >
                    {t.openReset}
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t.passwordPlaceholder}
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
              {mode === 'password' ? t.loginButton : t.resetButton}
            </Button>

            <div className="space-y-2 text-center text-sm text-slate-400">
              <p>
                {t.noAccount}{' '}
                <Link
                  href="/register"
                  className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  {t.registerLink}
                </Link>
              </p>
              <p>
                {t.updateManual}{' '}
                <Link
                  href="/reset-password"
                  className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  {t.openReset}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
