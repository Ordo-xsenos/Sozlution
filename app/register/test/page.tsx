'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, ArrowRight, Trophy, Sparkles, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PLACEMENT_TEST_QUESTIONS, determineLevelFromScore } from '@/lib/placement-test-questions'

export default function PlacementTestPage() {
  const { request, hydrate } = useApp()
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string | number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; level: string } | null>(null)

  const questions = PLACEMENT_TEST_QUESTIONS

  const handleSelect = (optionIndex: number) => {
    const q = questions[currentIndex]
    setAnswers(prev => ({ ...prev, [q.id]: optionIndex }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // 1. Подсчитываем результат локально
      const { score, level } = determineLevelFromScore(answers, questions)
      
      // 2. Отправляем финальный уровень на бэкенд (Patch User)
      // Мы используем эндпоинт Patch User, чтобы сохранить вычисленный уровень
      await request('/api/v1/user', {
        body: { level }
      }, 'patch')

      setResult({ score, level })
      await hydrate() // Обновляем состояние приложения
    } catch (err) {
      toast.error('Ошибка при сохранении результата')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#050810] p-4 flex items-center justify-center">
        <Card className="max-w-md w-full bg-[#0a0f1d] border-cyan-500/30 text-white p-10 text-center shadow-2xl rounded-[40px]">
          <div className="mb-8 flex justify-center">
             <div className="relative">
                <Trophy className="w-24 h-24 text-yellow-400" />
                <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-cyan-400 animate-pulse" />
             </div>
          </div>

          <h2 className="text-4xl font-black mb-4 tracking-tighter">Тест завершен!</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Мы проанализировали ваши ответы и определили ваш уровень владения английским.
          </p>

          <div className="bg-cyan-500/10 rounded-[32px] p-8 mb-10 border border-cyan-500/20">
            <p className="text-[10px] text-cyan-500/60 uppercase font-black tracking-[0.2em] mb-2">Ваш уровень</p>
            <p className="text-6xl font-black text-cyan-400">{result.level}</p>
          </div>

          {/* Detailed Results Review */}
          <div className="text-left mb-10 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border-t border-b border-white/5 py-4">
            <h3 className="text-xl font-bold mb-4 sticky top-0 bg-[#0a0f1d] py-2 z-10 text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Разбор ответов
            </h3>
            {PLACEMENT_TEST_QUESTIONS.map((q, idx) => {
              const userAnswer = answers[q.id]
              const isCorrect = userAnswer === q.correctIndex
              return (
                <div key={q.id} className={`p-4 rounded-3xl border transition-all ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-gray-200 text-sm">{idx + 1}. {q.text}</p>
                      <div className="text-xs space-y-1">
                        <p className={`flex items-center gap-2 ${isCorrect ? 'text-emerald-400' : 'text-red-400 font-medium'}`}>
                          <span className="opacity-60 uppercase text-[9px] font-black">Ваш ответ:</span> 
                          {q.options[userAnswer] || 'Пропущено'}
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-400 font-bold flex items-center gap-2">
                            <span className="opacity-60 uppercase text-[9px] font-black">Верный ответ:</span>
                            {q.options[q.correctIndex]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Button 
            onClick={() => router.push('/mvp')}
            className="w-full h-16 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl text-xl shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
          >
            Начать обучение <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isAnswered = answers[currentQuestion?.id] !== undefined

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <BrainCircuit className="w-8 h-8 text-cyan-500" />
                Placement Test
              </h1>
              <p className="text-gray-500 font-medium">Вопрос {currentIndex + 1} из {questions.length}</p>
            </div>
            <div className="text-right">
              <span className="text-cyan-500 font-black text-2xl">{Math.round(progress)}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 bg-slate-900" />
        </div>

        <Card className="bg-[#0a0f1d] border-white/5 p-8 md:p-14 rounded-[48px] shadow-2xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500" />
          <h2 className="text-2xl md:text-3xl font-bold mb-12 leading-tight text-center text-gray-200">
            {currentQuestion?.text}
          </h2>

          <div className="grid gap-4">
            {currentQuestion?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full p-6 rounded-3xl text-left transition-all border-2 text-lg font-medium ${
                  answers[currentQuestion.id] === idx
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-white/5 bg-black/20 text-gray-400 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-black transition-all ${
                    answers[currentQuestion.id] === idx ? 'border-cyan-500 bg-cyan-500 text-black' : 'border-slate-800'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="flex-1 border-white/5 h-16 rounded-2xl text-white hover:bg-white/5 disabled:opacity-30 font-bold"
          >
            Назад
          </Button>
          
          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex-[2] bg-cyan-500 hover:bg-cyan-400 text-black h-16 rounded-2xl text-xl font-black shadow-lg shadow-cyan-900/20 transition-all"
            >
              Далее
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isAnswered || submitting}
              className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black h-16 rounded-2xl text-xl font-black shadow-lg shadow-emerald-900/20 transition-all"
            >
              {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : 'Узнать свой уровень'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
