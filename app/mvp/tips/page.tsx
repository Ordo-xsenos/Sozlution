'use client'

import { useState } from 'react'
import { useApp } from '@/context/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, BookOpen, Headphones, MessageSquare, Zap, Sparkles, Loader2 } from 'lucide-react'

const staticTips = [
  {
    icon: Lightbulb,
    title: 'Практикуйте ежедневно',
    description: 'Даже 15-20 минут в день лучше, чем длинные занятия раз в неделю. Постоянство - ключ успеха.',
    category: 'Мотивация',
  },
  {
    icon: BookOpen,
    title: 'Читайте на английском',
    description: 'Начните с простых текстов: детские книги, новости, статьи. Это помогает улучшить понимание и словарный запас.',
    category: 'Чтение',
  },
  {
    icon: Headphones,
    title: 'Слушайте подкасты и музыку',
    description: 'Слушайте англоязычные подкасты, аудиокниги и музыку. Это улучшает произношение и восприятие на слух.',
    category: 'Аудирование',
  },
  {
    icon: Zap,
    title: 'Используйте карточки',
    description: 'Флеш-карты - отличный способ запомнить новые слова. Повторяйте слова регулярно для лучшего усвоения.',
    category: 'Словарь',
  }
]

export default function TipsPage() {
  const { user, request, loading } = useApp()
  const [aiTip, setAiTip] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTip = async () => {
    setIsGenerating(true)
    try {
      const prompt = `Give me one short, highly practical English learning tip for a ${user?.level || 'B1'} student. Focus on vocabulary or daily habits. No intro, just the tip.`
      const r = await request('/api/v1/ai/chat', { 
        body: { message: prompt, history: [], language: user?.lang || 'ru' } 
      }, 'post')
      setAiTip(r.text)
    } catch (e) {
      console.error('Failed to generate tip', e)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Советы для изучения</h1>
          <p className="text-slate-400">Практические рекомендации от нашего ИИ</p>
        </div>

        {/* AI Tip Section */}
        <Card className="mb-10 bg-gradient-to-br from-blue-600 to-blue-800 border-0 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Sparkles className="h-6 w-6 text-yellow-300 fill-yellow-300" />
              Персональный совет от ИИ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="min-h-[80px] flex items-center">
              {aiTip ? (
                <p className="text-xl md:text-2xl font-medium italic leading-relaxed">
                  "{aiTip}"
                </p>
              ) : (
                <p className="text-lg opacity-80">
                  Нажмите на кнопку ниже, чтобы получить индивидуальный совет на основе вашего уровня ({user?.level || 'A1'}).
                </p>
              )}
            </div>
            <Button 
              onClick={generateTip} 
              disabled={isGenerating}
              className="bg-white text-blue-700 hover:bg-slate-100 h-14 rounded-2xl px-8 text-lg font-bold shadow-lg"
            >
              {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
              {aiTip ? 'Сгенерировать другой совет' : 'Получить совет'}
            </Button>
          </CardContent>
        </Card>

        {/* Static Tips Grid */}
        <h2 className="text-xl font-bold mb-6 text-slate-400 uppercase tracking-widest">Базовые рекомендации</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {staticTips.map((tip, idx) => {
            const Icon = tip.icon
            return (
              <Card key={idx} className="bg-[#1a2744] border-[#334155] hover:border-blue-500/50 transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-slate-800 text-slate-400 rounded-full uppercase tracking-tighter">
                      {tip.category}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-white">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">{tip.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
