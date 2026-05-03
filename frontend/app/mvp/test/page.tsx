'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { logger } from '@/lib/logger'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Loader2, ArrowRight, Trophy, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { PLACEMENT_TEST_QUESTIONS, determineLevelFromScore } from '@/lib/placement-test-questions'

export default function LevelTestPage() {
  const { user, request, hydrate, loading: appLoading } = useApp()
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string | number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; level: string } | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const questions = PLACEMENT_TEST_QUESTIONS

  const handleSelect = (optionIndex: number) => {
    const q = questions[currentIndex]
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { score, level } = determineLevelFromScore(answers, questions)

      await request(
        '/api/v1/user',
        {
          body: { level },
        },
        'patch'
      )

      setResult({ score, level })
      await hydrate()
    } catch (err) {
      toast.error('Ошибка при отправке теста')
      logger.error('Test submission failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEnterIelts = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      router.push('/ielts/dashboard')
    }, 2800)
  }

  if (appLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (result) {
    const isPassed = result.score / questions.length >= 0.8
    const isIELTS = result.level === 'IELTS' || (user?.level === 'C1' && isPassed)

    return (
      <div className="min-h-screen bg-[#0f172a] p-4 flex items-center justify-center relative overflow-hidden">
        {/* Epic Golden Transition Overlay */}
        {isTransitioning && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600/20 via-amber-500 to-amber-600 animate-pulse duration-1000" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent animate-out zoom-out duration-1000 fill-mode-forwards" />

            <div className="relative z-10 space-y-4 text-center">
              <div className="text-black text-8xl md:text-9xl font-black italic tracking-tighter animate-in zoom-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                IELTS
              </div>
              <div className="text-black/70 text-sm font-black uppercase tracking-[0.5em] animate-pulse">
                Unlocking Professional Mode
              </div>
            </div>

            <div className="absolute w-[300px] h-[300px] border-4 border-white/20 rounded-full animate-ping duration-[2000ms]" />
            <div className="absolute w-[500px] h-[500px] border border-white/10 rounded-full animate-ping duration-[3000ms]" />
          </div>
        )}

        <Card
          className={`max-w-md w-full bg-[#1a2744] border-blue-500/30 text-white p-8 text-center shadow-2xl transition-all duration-[2000ms] ease-in-out ${isTransitioning ? 'scale-[10] rotate-[15deg] opacity-0 blur-2xl' : ''}`}
        >
          <div className="mb-6 flex justify-center">
            {isPassed ? (
              <div className="relative">
                <Trophy className="w-20 h-20 text-yellow-400" />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            ) : (
              <XCircle className="w-20 h-20 text-red-500" />
            )}
          </div>

          <h2 className="text-3xl font-bold mb-2">
            {isPassed ? 'Поздравляем!' : 'Почти получилось!'}
          </h2>
          <p className="text-gray-400 mb-6">
            Ваш результат: <span className="text-blue-400 font-bold">{result.score}</span> из{' '}
            {questions.length}
          </p>

          <div className="bg-[#0f172a]/50 rounded-2xl p-6 mb-8 border border-white/5">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">
              Ваш новый уровень
            </p>
            <p className="text-4xl font-black text-blue-500">
              {isIELTS ? 'IELTS MODE' : result.level}
            </p>
          </div>

          {/* Detailed Results Review */}
          <div className="text-left mb-8 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border-t border-b border-white/5 py-4">
            <h3 className="text-xl font-bold mb-4 sticky top-0 bg-[#1a2744] py-2 z-10 text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Разбор ответов
            </h3>
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id]
              const isCorrect = userAnswer === q.correctIndex
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-gray-200">
                        {idx + 1}. {q.text}
                      </p>
                      <div className="text-sm space-y-1">
                        <p
                          className={`flex items-center gap-2 ${isCorrect ? 'text-emerald-400' : 'text-red-400 font-medium'}`}
                        >
                          <span className="opacity-60 uppercase text-[10px] font-black">
                            Ваш ответ:
                          </span>
                          {q.options[userAnswer] || 'Пропущено'}
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-400 font-bold flex items-center gap-2">
                            <span className="opacity-60 uppercase text-[10px] font-black">
                              Верный ответ:
                            </span>
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

          {isIELTS ? (
            <div className="space-y-4">
              <p className="text-emerald-400 font-medium">
                Вы разблокировали профессиональный режим подготовки к IELTS!
              </p>
              <Button
                onClick={handleEnterIelts}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl text-lg font-bold shadow-lg shadow-blue-900/20"
              >
                Войти в IELTS Mode <ArrowRight className="ml-2" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push('/mvp')}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl text-lg font-bold"
            >
              Вернуться на главную
            </Button>
          )}
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isAnswered = answers[currentQuestion?.id] !== undefined

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold">Финальный тест уровня {user?.level}</h1>
              <p className="text-gray-400">
                Вопрос {currentIndex + 1} из {questions.length}
              </p>
            </div>
            <div className="text-right">
              <span className="text-blue-400 font-bold">{Math.round(progress)}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
        </div>

        <Card className="bg-[#1e293b] border-slate-800 p-6 md:p-10 rounded-[32px] shadow-xl mb-8">
          <h2 className="text-2xl md:text-3xl font-medium mb-10 leading-relaxed text-center">
            {currentQuestion?.text}
          </h2>

          <div className="grid gap-4">
            {Array.isArray(currentQuestion?.options) &&
              currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full p-5 rounded-2xl text-left transition-all border-2 text-lg ${
                    answers[currentQuestion.id] === idx
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-gray-400 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${
                        answers[currentQuestion.id] === idx
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-slate-700'
                      }`}
                    >
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
            className="flex-1 border-slate-700 h-14 rounded-2xl text-white disabled:opacity-50"
          >
            Назад
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-bold"
            >
              Далее
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isAnswered || submitting}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-900/20"
            >
              {submitting ? <Loader2 className="animate-spin" /> : 'Завершить тест'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
