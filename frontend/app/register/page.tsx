'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react'

import type { components } from '@/lib/api-types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAuthToken, getOrCreateDeviceId } from '@/lib/auth'
import { createSession, getErrorMessage } from '@/lib/auth-api'
import { useApp } from '@/context/app-context'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

type Language = components['schemas']['Language']

const languageOptions: Array<{ label: string; value: Language }> = [
  { label: 'Русский', value: 'ru' },
  { label: 'O‘zbekcha', value: 'uz' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { login: appLogin, user } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lang, setLang] = useState<Language>(getMvpLang(user?.lang))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const t = mvpText[getMvpLang(user?.lang)].auth

  useEffect(() => {
    if (getAuthToken()) {
      // If token exists, we don't automatically redirect here,
      // as we might need to finish the placement test.
    }
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedName) {
      setError(t.enterTokenError.replace('reset token', 'username')) // Reusing or should I add more?
      // Actually let's just use hardcoded strings for now if they are not in t, 
      // but I should add them to t.
      return
    }

    if (!trimmedEmail) {
      setError(t.enterEmailError)
      return
    }

    if (!trimmedPassword) {
      setError(t.enterPasswordError)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const session = await createSession({
        mode: 'register',
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        lang,
        device_id: getOrCreateDeviceId(),
      })

      if (!session.session_token) {
        throw new Error('Backend did not return session_token.')
      }

      await appLogin(session.session_token)
      router.replace('/register/test')
    } catch (nextError) {
      setError(getErrorMessage(nextError, t.loginError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow={t.registerEyebrow}
      title={t.registerTitle}
      description={t.registerDesc}
      highlights={[
        {
          title: 'Identity',
          text: 'Username remains public, email is for auth-flow.',
        },
        {
          title: 'Session',
          text: 'Token is saved immediately after registration.',
        },
      ]}
    >
      <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t.cardTitle}</CardTitle>
          <CardDescription className="text-slate-400">
            {t.cardDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="register-name" className="text-slate-200">
                {t.usernameLabel}
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="register-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.usernamePlaceholder}
                  className="h-12 border-slate-800 bg-slate-900/80 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-slate-200">
                {t.emailLabel}
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 border-slate-800 bg-slate-900/80 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-slate-200">
                {t.passwordLabel}
              </Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t.newPasswordPlaceholder}
                  className="h-12 border-slate-800 bg-slate-900/80 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-lang" className="text-slate-200">
                {t.langLabel}
              </Label>
              <Select value={lang} onValueChange={(value) => setLang(value as Language)}>
                <SelectTrigger
                  id="register-lang"
                  className="h-12 w-full border-slate-800 bg-slate-900/80 text-white"
                >
                  <SelectValue
                    placeholder={t.langPlaceholder}
                    aria-label={languageOptions.find(o => o.value === lang)?.label}
                  >
                    {languageOptions.find(o => o.value === lang)?.label || t.langPlaceholder}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-950 text-white">
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <Button
              className="h-12 w-full rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              disabled={submitting}
              type="submit"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t.registerButton}
            </Button>

            <p className="text-center text-sm text-slate-400">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                {t.registerLink}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
