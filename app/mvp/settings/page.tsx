'use client'

import { useState } from 'react'
import { useApp } from '@/context/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Check, Loader2, LogOut, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { user, logout, request, hydrate, loading } = useApp()
  const router = useRouter()
  
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!user) return null

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await request('/api/v1/user', {
        body: {
          name: name.trim(),
          password: password.trim() || undefined
        }
      }, 'patch')
      setPassword('')
      await hydrate()
      toast({ title: 'Успешно', description: 'Профиль обновлен' })
    } catch (e) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить профиль', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetProgress = async () => {
    try {
      await request('/api/v1/reset-progress', undefined, 'post')
      await hydrate()
      setShowResetConfirm(false)
      toast({ title: 'Сброшено', description: 'Ваш прогресс был удален' })
      router.push('/mvp')
    } catch (e) {
      toast({ title: 'Ошибка', description: 'Не удалось сбросить прогресс', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Настройки</h1>
          <p className="text-slate-400">Управляйте своим аккаунтом и обучением</p>
        </div>

        {/* Profile Section */}
        <Card className="bg-[#1a2744] border-[#334155] mb-6 overflow-hidden">
          <CardHeader className="bg-slate-900/30 border-b border-[#334155]">
            <CardTitle>Профиль</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Имя пользователя</Label>
              <Input 
                id="name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-slate-900 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Новый пароль</Label>
              <Input 
                id="pass"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Оставьте пустым, чтобы не менять"
                className="bg-slate-900 border-slate-700"
              />
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
              Сохранить изменения
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
                  <h3 className="text-lg font-bold text-red-400 mb-1">Опасная зона</h3>
                  <p className="text-sm text-red-300/70 mb-4">Сброс прогресса удалит все ваши выученные слова и достижения. Это действие необратимо.</p>
                  
                  {showResetConfirm ? (
                    <div className="flex gap-3">
                      <Button onClick={handleResetProgress} variant="destructive" className="bg-red-600 hover:bg-red-700">
                        Да, сбросить всё
                      </Button>
                      <Button onClick={() => setShowResetConfirm(false)} variant="outline" className="border-slate-700 text-white">
                        Отмена
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowResetConfirm(true)} variant="outline" className="border-red-900/50 text-red-400 hover:bg-red-950/50">
                      <Trash2 className="mr-2 h-4 w-4" /> Сбросить прогресс
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => { logout(); router.push('/') }} 
            variant="ghost" 
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 h-14 rounded-2xl"
          >
            <LogOut className="mr-2 h-5 w-5" /> Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  )
}
