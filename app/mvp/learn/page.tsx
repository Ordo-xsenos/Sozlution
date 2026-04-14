'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/context/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Volume2, ChevronRight, ChevronLeft, RotateCw, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type LearnStep = 'study' | 'step1' | 'step2' | 'step3'
type CheckState = 'idle' | 'correct' | 'wrong'

export default function LearnPage() {
  const { user, currentDay, request, hydrate, loading: appLoading } = useApp()
  
  const [step, setStep] = useState<LearnStep>('study')
  const [learnIndex, setLearnIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [studyCompleted, setStudyCompleted] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  // Tracking results for the session
  const [step1Results, setStep1Results] = useState<Record<string, boolean>>({})
  const [step2Results, setStep2Results] = useState<Record<string, boolean>>({})
  const [step3Results, setStep3Results] = useState<Record<string, number>>({})

  const words = useMemo(() => currentDay?.words || [], [currentDay])
  const active = words[learnIndex] || null

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const nextWord = () => {
    if (learnIndex < words.length - 1) {
      setLearnIndex(prev => prev + 1)
      setInputValue('')
      setCheckState('idle')
      setFlipped(false)
      return false
    }
    return true
  }

  const handleCheckStep1 = () => {
    if (!active) return
    const expected = (user?.lang === 'ru' ? active.ru : active.uz).trim().toLowerCase()
    const isCorrect = inputValue.trim().toLowerCase() === expected
    
    setStep1Results(prev => ({ ...prev, [active.id]: isCorrect }))
    setCheckState(isCorrect ? 'correct' : 'wrong')
    
    if (isCorrect) {
      setTimeout(() => {
        if (nextWord()) setStep('step2')
      }, 600)
    }
  }

  const handleCheckStep2 = (option: string) => {
    if (!active) return
    const expected = user?.lang === 'ru' ? active.ru : active.uz
    const isCorrect = option === expected
    
    setStep2Results(prev => ({ ...prev, [active.id]: isCorrect }))
    if (nextWord()) setStep('step3')
  }

  const handleCheckStep3 = (rating: number) => {
    if (!active) return
    setStep3Results(prev => ({ ...prev, [active.id]: rating }))
    if (nextWord()) finishDay()
  }

  const finishDay = async () => {
    if (!currentDay?.day.day) return
    setLoading(true)
    try {
      await request('/api/v1/day/complete', {
        body: {
          day: currentDay.day.day,
          step1: step1Results,
          step2: step2Results,
          step3: step3Results
        }
      }, 'post')
      toast({ title: 'Поздравляем!', description: 'Дневной план выполнен!' })
      await hydrate()
    } catch (e) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить результат', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const step2Options = useMemo(() => {
    if (!active) return []
    const correct = user?.lang === 'ru' ? active.ru : active.uz
    const distractors = words
      .map(w => (user?.lang === 'ru' ? w.ru : w.uz))
      .filter(d => d !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    return [correct, ...distractors].sort(() => Math.random() - 0.5)
  }, [active, words, user?.lang])

  if (appLoading && !currentDay) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!currentDay || words.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-4 flex items-center justify-center">
        <Card className="bg-[#1a2744] border-[#334155] text-center p-8 max-w-md">
          <div className="text-5xl mb-4">🗓️</div>
          <h1 className="text-2xl font-bold text-white mb-4">План не найден</h1>
          <p className="text-gray-400 mb-6">На сегодня заданий нет. Вернитесь позже!</p>
          <Link href="/mvp">
            <Button className="w-full bg-blue-500 hover:bg-blue-600">На главную</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">
            {step === 'study' ? 'Изучение слов' : 'Практика'}
          </h1>
          <div className="flex gap-1.5">
            {(['study', 'step1', 'step2', 'step3'] as const).map(s => (
              <div key={s} className={`h-1.5 w-6 rounded-full transition-colors ${step === s ? 'bg-blue-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Слово {learnIndex + 1} из {words.length}</span>
            <span>{Math.round(((learnIndex + 1) / words.length) * 100)}%</span>
          </div>
          <Progress value={((learnIndex + 1) / words.length) * 100} className="h-2 bg-slate-800" />
        </div>

        {step === 'study' ? (
          <div className="space-y-8">
            <div 
              className="perspective-1000 relative h-80 w-full cursor-pointer group"
              onClick={() => {
                setFlipped(!flipped)
                if (active) setStudyCompleted(p => ({ ...p, [active.id]: true }))
              }}
            >
              <div 
                className={`relative h-full w-full transition-all duration-500 preserve-3d shadow-2xl rounded-[32px] ${flipped ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <Card 
                  className="absolute inset-0 backface-hidden bg-[#1e293b] border-2 border-blue-500/30 flex flex-col items-center justify-center p-8 rounded-[32px]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (active) speak(active.en) }}
                    className="absolute right-6 top-6 p-3 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Volume2 className="h-6 w-6" />
                  </button>
                  <span className="text-[10px] font-black tracking-[0.2em] text-blue-400/60 uppercase mb-4">English word</span>
                  <h2 className="text-5xl md:text-6xl font-black text-white text-center break-words mb-6">{active?.en}</h2>
                  <div className="w-full bg-blue-500/5 rounded-2xl p-4 text-center border border-blue-500/10">
                    <p className="text-slate-300 italic leading-relaxed text-sm">
                      {active?.definition || active?.description || active?.en_description || 'No definition available'}
                    </p>
                  </div>
                </Card>

                {/* Back */}
                <Card 
                  className="absolute inset-0 backface-hidden rotate-y-180 bg-[#1e293b] border-2 border-emerald-500/30 flex flex-col items-center justify-center p-8 rounded-[32px]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400/60 uppercase mb-4">Translation</span>
                  <h2 className="text-4xl font-bold text-emerald-400 mb-2">{user?.lang === 'ru' ? active?.ru : active?.uz}</h2>
                  {(active?.transcription || active?.phonetic) && (
                    <div className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4">
                      <p className="text-emerald-300 font-mono text-sm">/{active?.transcription || active?.phonetic}/</p>
                    </div>
                  )}
                  <p className="text-slate-500 font-bold text-xs mt-4 animate-pulse uppercase tracking-widest">Tap to flip back</p>
                </Card>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => { if (learnIndex > 0) { setLearnIndex(i => i - 1); setFlipped(false) } }}
                disabled={learnIndex === 0}
                className="flex-1 border-slate-700 h-14 rounded-2xl text-white disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-400 disabled:border-slate-800"
              >
                <ChevronLeft className="mr-2" /> Назад
              </Button>
              {learnIndex < words.length - 1 ? (
                <Button 
                  onClick={() => { setLearnIndex(i => i + 1); setFlipped(false) }}
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-bold"
                >
                  Далее <ChevronRight className="ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={() => { setStep('step1'); setLearnIndex(0) }}
                  className={`flex-[2] h-14 rounded-2xl text-lg font-bold ${Object.keys(studyCompleted).length === words.length ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600'}`}
                >
                  Начать практику <RotateCw className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-[#1e293b] border-slate-800 p-8 rounded-[32px] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full" />
              <button 
                onClick={() => speak(active?.en || '')}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <Volume2 className="h-5 w-5" />
              </button>
              <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase block mb-2">English word</span>
              <h2 className="text-5xl font-black">{active?.en}</h2>
            </Card>

            {step === 'step1' && (
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setCheckState('idle') }}
                    placeholder="Введите перевод..."
                    className={`w-full bg-slate-900 border-2 rounded-2xl px-6 py-5 text-xl outline-none transition-all ${
                      checkState === 'correct' ? 'border-emerald-500' : 
                      checkState === 'wrong' ? 'border-red-500' : 'border-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {checkState !== 'idle' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {checkState === 'correct' ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleCheckStep1}
                  className={`w-full h-16 rounded-2xl text-xl font-bold transition-all ${
                    checkState === 'correct' ? 'bg-emerald-600' : 
                    checkState === 'wrong' ? 'bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {checkState === 'idle' ? 'Проверить' : (user?.lang === 'ru' ? active?.ru : active?.uz)}
                </Button>
              </div>
            )}

            {step === 'step2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {step2Options.map((opt, i) => (
                  <Button 
                    key={i}
                    variant="outline"
                    onClick={() => handleCheckStep2(opt)}
                    className="h-16 rounded-2xl border-slate-800 bg-slate-900/50 hover:bg-blue-600 hover:border-blue-500 text-lg transition-all"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            )}

            {step === 'step3' && (
              <div className="text-center space-y-6">
                <p className="text-xl text-slate-400">Насколько хорошо вы знаете это слово?</p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button 
                      key={rating}
                      onClick={() => handleCheckStep3(rating)}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-700 flex items-center justify-center font-black text-xl hover:bg-blue-600 hover:border-blue-500 transition-all"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
