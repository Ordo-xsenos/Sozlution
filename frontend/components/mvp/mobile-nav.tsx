'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  TrendingUp,
  Trophy,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useApp } from '@/context/app-context'
import { getMvpLang, mvpText, type MvpLang } from '@/lib/mvp-i18n'

// Compact one-word labels for the bottom bar (full names live in the "More" sheet)
const tabLabels: Record<MvpLang, { home: string; learn: string; coach: string; progress: string; more: string }> = {
  uz: { home: 'Bosh', learn: "O'rganish", coach: 'Coach', progress: 'Taraqqiyot', more: 'Menyu' },
  ru: { home: 'Главная', learn: 'Учить', coach: 'Коуч', progress: 'Прогресс', more: 'Меню' },
}

const primaryTabs = [
  {
    key: 'home',
    href: '/mvp',
    icon: LayoutDashboard,
  },
  {
    key: 'learn',
    href: '/mvp/learn',
    icon: BookOpen,
  },
  {
    key: 'coach',
    href: '/mvp/coach',
    icon: Zap,
  },
  {
    key: 'progress',
    href: '/mvp/progress',
    icon: TrendingUp,
  },
] as const

const moreItems = [
  {
    labelKey: 'levelTest',
    href: '/mvp/test',
    icon: Sparkles,
  },
  {
    labelKey: 'achievements',
    href: '/mvp/achievements',
    icon: Trophy,
  },
  {
    labelKey: 'tips',
    href: '/mvp/tips',
    icon: Lightbulb,
  },
  {
    labelKey: 'help',
    href: '/mvp/help',
    icon: HelpCircle,
  },
  {
    labelKey: 'settings',
    href: '/mvp/settings',
    icon: Settings,
  },
] as const

export function MobileNav() {
  const pathname = usePathname()
  const { user, logout } = useApp()
  const lang = getMvpLang(user?.lang)
  const t = mvpText[lang].nav
  const labels = tabLabels[lang]
  const [moreOpen, setMoreOpen] = useState(false)

  // Close the sheet whenever the route changes
  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  const isMoreActive = moreItems.some((item) => pathname === item.href)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="grid grid-cols-5 overflow-hidden rounded-3xl border border-white/10 bg-[#141f38]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {primaryTabs.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 flex-col items-center justify-center gap-1.5 py-2.5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className={`flex h-8 items-center justify-center rounded-2xl px-5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/40'
                    : 'bg-transparent'
                }`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </span>
                <span className={`w-full truncate px-1 text-center text-[10px] font-medium leading-tight ${
                  isActive ? 'text-white' : ''
                }`}>
                  {labels[item.key]}
                </span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-label={labels.more}
            className={`flex min-w-0 flex-col items-center justify-center gap-1.5 py-2.5 transition-colors ${
              moreOpen || isMoreActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className={`flex h-8 items-center justify-center rounded-2xl px-5 transition-all ${
              moreOpen || isMoreActive
                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/40'
                : 'bg-transparent'
            }`}>
              {moreOpen ? <X className="w-5 h-5 shrink-0" /> : <Menu className="w-5 h-5 shrink-0" />}
            </span>
            <span className="w-full truncate px-1 text-center text-[10px] font-medium leading-tight">
              {labels.more}
            </span>
          </button>
        </div>
      </nav>

      {/* "More" bottom sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={labels.more}>
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-[#334155] bg-[#1a2744] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#334155]" />
            <div className="grid gap-1">
              {moreItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-gray-200 hover:bg-[#2a3f5f]'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{t[item.labelKey]}</span>
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="truncate">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
