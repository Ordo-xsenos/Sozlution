'use client'

import { useState } from 'react'
import { useApp } from '@/context/app-context'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  BookOpen,
  Headphones,
  Zap,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

const staticTips = [
  {
    id: 'daily',
    icon: Lightbulb,
  },
  {
    id: 'reading',
    icon: BookOpen,
  },
  {
    id: 'listening',
    icon: Headphones,
  },
  {
    id: 'cards',
    icon: Zap,
  },
] as const

export default function TipsPage() {
  const { user, request } = useApp()
  const [aiTip, setAiTip] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const t = mvpText[getMvpLang(user?.lang)].tips

  const generateTip = async () => {
    if (!user) {
      setRequestError(t.authError)
      return
    }

    setIsGenerating(true)
    setRequestError(null)
    try {
      const targetLang = getMvpLang(user?.lang) === 'ru' ? 'Russian' : 'Uzbek'
      const prompt = `Give me one short, highly practical English learning tip in ${targetLang} for a ${user?.level || 'B1'} student. Focus on vocabulary or daily habits. No intro, just the tip.`
      const r = (await request(
        '/api/v1/ai/chat',
        {
          body: { message: prompt, history: [] },
        },
        'post'
      )) as { text: string }
      setAiTip(r.text)
    } catch (e) {
      logger.error('Failed to generate tip', e)
      setRequestError(e instanceof Error ? e.message : t.requestError)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-slate-400">{t.subtitle}</p>
        </div>

        {/* AI Tip Section */}
        <Card className="mb-10 bg-gradient-to-br from-blue-600 to-blue-800 border-0 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Sparkles className="h-6 w-6 text-yellow-300 fill-yellow-300" />
              {t.aiTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="min-h-[80px] flex items-center">
              {aiTip ? (
                <p className="text-xl md:text-2xl font-medium italic leading-relaxed">
                  &quot;{aiTip}&quot;
                </p>
              ) : (
                <p className="text-lg opacity-80">
                  {t.emptyTip(user?.level || 'A1')}
                </p>
              )}
            </div>
            {requestError && (
              <p className="rounded-xl bg-red-500/15 border border-red-400/40 px-4 py-3 text-sm text-red-100">
                {requestError}
              </p>
            )}
            <Button
              onClick={generateTip}
              disabled={isGenerating || !user}
              className="bg-white text-blue-700 hover:bg-slate-100 h-14 rounded-2xl px-8 text-lg font-bold shadow-lg"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Zap className="mr-2 h-5 w-5 fill-current" />
              )}
              {aiTip ? t.anotherTip : t.getTip}
            </Button>
          </CardContent>
        </Card>

        {/* Static Tips Grid */}
        <h2 className="text-xl font-bold mb-6 text-slate-400 uppercase tracking-widest">
          {t.basic}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {staticTips.map((tip, idx) => {
            const Icon = tip.icon
            const [title, description, category] = (t.items as any)[tip.id]
            return (
              <Card
                key={idx}
                className="bg-[#1a2744] border-[#334155] hover:border-blue-500/50 transition-all group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-slate-800 text-slate-400 rounded-full uppercase tracking-tighter">
                      {category}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
