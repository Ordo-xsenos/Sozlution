'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/context/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Check, Loader2, LogOut, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

export default function SettingsPage() {
  const { user, logout, request, hydrate, updateUser, loading } = useApp()

  const [name, setName] = useState(user?.name || '')
  const [selectedLang, setSelectedLang] = useState<'uz' | 'ru'>(user?.lang || 'uz')
  const [password, setPassword] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setSelectedLang(user.lang)
  }, [user])

  if (!user) return null
  const t = mvpText[getMvpLang(selectedLang)].settings

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateUser({
        name: name.trim(),
        lang: selectedLang,
        password: password.trim() || undefined
      })
      setPassword('')
      await hydrate()
      toast({ title: t.savedTitle, description: t.savedDescription })
    } catch (e) {
      toast({ title: t.errorTitle, description: t.saveError, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetProgress = async () => {
    try {
      await request('/api/v1/reset-progress', undefined, 'post')
      await hydrate()
      setShowResetConfirm(false)
      toast({ title: t.resetTitle, description: t.resetDescription })
    } catch (e) {
      toast({ title: t.errorTitle, description: t.resetError, variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-slate-400">{t.subtitle}</p>
        </div>

        {/* Profile Section */}
        <Card className="bg-[#1a2744] border-[#334155] mb-6 overflow-hidden">
          <CardHeader className="bg-slate-900/30 border-b border-[#334155]">
            <CardTitle>{t.profile}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.username}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lang">{t.interfaceLanguage}</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLang('uz')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedLang === 'uz'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-semibold">O&apos;zbek tili</div>
                  <div className="text-xs opacity-70">uz</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('ru')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedLang === 'ru'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-semibold">{t.russian}</div>
                  <div className="text-xs opacity-70">ru</div>
                </button>
              </div>
              <p className="text-xs text-slate-500">{t.languageHint}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pass">{t.newPassword}</Label>
              <Input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="bg-slate-900 border-slate-700"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
              {t.saveChanges}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <div className="space-y-4">
          <Card className="bg-red-950/20 border-red-900/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-400 mb-1">{t.dangerZone}</h3>
                  <p className="text-sm text-red-300/70 mb-4">{t.dangerText}</p>
                  
                  {showResetConfirm ? (
                    <div className="flex gap-3">
                      <Button onClick={handleResetProgress} variant="destructive" className="bg-red-600 hover:bg-red-700">
                        {t.confirmReset}
                      </Button>
                      <Button onClick={() => setShowResetConfirm(false)} variant="outline" className="border-slate-700 text-white">
                        {t.cancel}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowResetConfirm(true)} variant="outline" className="border-red-900/50 text-red-400 hover:bg-red-950/50">
                      <Trash2 className="mr-2 h-4 w-4" /> {t.resetProgress}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={logout} 
            variant="ghost" 
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 h-14 rounded-2xl"
          >
            <LogOut className="mr-2 h-5 w-5" /> {t.logout}
          </Button>
        </div>
      </div>
    </div>
  )
}
