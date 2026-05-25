'use client'

import { useApp } from '@/context/app-context'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Loader2 } from 'lucide-react'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

const allAchievements = [
  {
    id: 'first_word',
    icon: '📚',
    condition: (stats: any) => (stats?.total_words_learned || 0) >= 1,
  },
  {
    id: 'ten_words',
    icon: '✨',
    condition: (stats: any) => (stats?.total_words_learned || 0) >= 10,
  },
  {
    id: 'daily_streak_7',
    icon: '🔥',
    condition: (stats: any) => (stats?.streak || 0) >= 7,
  },
  {
    id: 'master',
    icon: '🎓',
    condition: (stats: any) => (stats?.total_words_learned || 0) >= 30,
  },
  {
    id: 'expert',
    icon: '👑',
    condition: (stats: any) => (stats?.total_words_learned || 0) >= 100,
  },
  {
    id: 'streak_champion',
    icon: '⭐',
    condition: (stats: any) => (stats?.streak || 0) >= 30,
  },
] as const

export default function AchievementsPage() {
  const { user, stats, loading } = useApp()

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const unlockedCount = allAchievements.filter(a => a.condition(stats)).length
  const t = mvpText[getMvpLang(user.lang)].achievements

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-sm md:text-base text-gray-400">
            {t.unlockedSummary(unlockedCount, allAchievements.length)}
          </p>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {allAchievements.map((achievement) => {
            const isUnlocked = achievement.condition(stats)
            const [title, description] = t.items[achievement.id]

            return (
              <Card
                key={achievement.id}
                className={`border-[#334155] transition-all text-white ${
                  isUnlocked
                    ? 'bg-[#1a2744] border-blue-500/50'
                    : 'bg-[#0f172a] border-gray-700 opacity-50'
                }`}
              >
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="text-3xl md:text-4xl">{achievement.icon}</div>
                    {isUnlocked && <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">{description}</p>
                  
                  <div
                    className={`mt-4 py-2 px-3 rounded text-center text-sm font-medium ${
                      isUnlocked
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700/20 text-gray-500'
                    }`}
                  >
                    {isUnlocked ? t.unlocked : t.locked}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
