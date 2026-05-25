'use client'

import { useApp } from '@/context/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TrendingUp, Trophy, Flame, BookOpen, Loader2 } from 'lucide-react'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

export default function DashboardPage() {
  const { user, stats, plan, loading } = useApp()

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const learnedWords = stats?.total_words_learned || 0
  const totalWords = (plan?.days.length || 0) * 20 // Assuming 20 words per day
  const learnedPercentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0
  const selectedDay =
    plan?.days?.find((d: { status?: string }) => d.status === 'current') ?? null
  const t = mvpText[getMvpLang(user.lang)].dashboard

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{t.greeting(user.name)}</h1>
          <p className="text-sm md:text-base text-gray-400">{t.subtitle}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t.learnedWords}</span>
                <span className="sm:hidden">{t.words}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{learnedWords}</div>
              <div className="text-xs text-gray-400 mt-2">{t.of} {totalWords || '...'}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">{t.currentStreak}</span>
                <span className="sm:hidden">{t.streak}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-orange-400">{stats?.streak || 0}</div>
              <div className="text-xs text-gray-400 mt-2">{t.daysInARow}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {t.progress}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{learnedPercentage}%</div>
              <div className="text-xs text-gray-400 mt-2">{t.completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t.level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{user.level}</div>
              <div className="text-xs text-gray-400 mt-2">{t.currentLevel}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-[#1a2744] border-[#334155] mb-8 text-white">
          <CardHeader>
            <CardTitle>{t.currentPlan(selectedDay?.day || 1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-[#334155] rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${learnedPercentage}%` }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <span className="text-white font-semibold">{t.learnedSummary(learnedWords)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/mvp/learn">
            <Button className="w-full h-24 text-lg bg-blue-500 hover:bg-blue-600">
              📚 {t.startLesson}
            </Button>
          </Link>
          <Link href="/mvp/progress">
            <Button variant="outline" className="w-full h-24 text-lg border-[#334155] text-white hover:bg-[#2a3f5f]">
              📊 {t.viewStats}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
