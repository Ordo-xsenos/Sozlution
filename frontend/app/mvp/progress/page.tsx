'use client'

import { useApp } from '@/context/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

export default function ProgressPage() {
  const { user, stats, plan, results, loading } = useApp()

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const learnedWords = stats?.total_words_learned || 0
  const totalWords = (plan?.days.length || 0) * 20
  const learnedPercentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0
  const t = mvpText[getMvpLang(user.lang)].progress

  // Тренды из реальных результатов
  const chartData = (results || []).slice(-7).map((r) => ({
    day: `${t.dayShort}${r.day}`,
    words: Math.round(r.accuracy),
  }))

  const proficiencyData = [
    { level: 'A1', count: user.level === 'A1' ? learnedWords : 0 },
    { level: 'A2', count: user.level === 'A2' ? learnedWords : 0 },
    { level: 'B1', count: user.level === 'B1' ? learnedWords : 0 },
    { level: 'B2', count: user.level === 'B2' ? learnedWords : 0 },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-sm md:text-base text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{t.learnedWords}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-white">{learnedWords}</div>
              <p className="text-xs text-gray-400 mt-2">{learnedPercentage}%</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400">{t.streak}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-orange-400">
                {stats?.streak || 0}
              </div>
              <p className="text-xs text-gray-400 mt-2">{t.days}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400">
                {t.accuracy}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                {Math.round(stats?.avg_accuracy || 0)}%
              </div>
              <p className="text-xs text-gray-400 mt-2">{t.average}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400 whitespace-nowrap">
                {t.lessons}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                {stats?.total_days_done || 0}
              </div>
              <p className="text-xs text-gray-400 mt-2">{t.total}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base">{t.accuracyByDay}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2744', border: '1px solid #334155' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="words"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2744] border-[#334155] text-white">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base">{t.levelProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={proficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="level" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2744', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="bg-[#1a2744] border-[#334155] mt-6 text-white">
          <CardHeader>
            <CardTitle>{t.detailedStats}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#334155]">
                <span className="text-gray-400">{t.cefrLevel}</span>
                <span className="text-white font-semibold">{user.level}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#334155]">
                <span className="text-gray-400">{t.wordsLearned}</span>
                <span className="text-white font-semibold">{learnedWords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t.averageAccuracy}</span>
                <span className="text-white font-semibold">
                  {Math.round(stats?.avg_accuracy || 0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
