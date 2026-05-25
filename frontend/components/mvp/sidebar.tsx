'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/app-context'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  TrendingUp,
  Trophy,
  Lightbulb,
  HelpCircle,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

const menuItems = [
  {
    labelKey: 'dashboard',
    href: '/mvp',
    icon: LayoutDashboard,
  },
  {
    labelKey: 'learnNow',
    href: '/mvp/learn',
    icon: BookOpen,
  },
  {
    labelKey: 'coach',
    href: '/mvp/coach',
    icon: Zap,
  },
  {
    labelKey: 'progress',
    href: '/mvp/progress',
    icon: TrendingUp,
  },
  {
    labelKey: 'achievements',
    href: '/mvp/achievements',
    icon: Trophy,
  },
  {
    labelKey: 'levelTest',
    href: '/mvp/test',
    icon: Sparkles,
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

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useApp()
  const t = mvpText[getMvpLang(user?.lang)].nav

  return (
    <aside className="hidden md:flex w-64 bg-[#1a2744] border-r border-[#334155] flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#334155]">
        <h1 className="text-2xl font-bold text-white">
          So&apos;<span className="text-blue-400">zlution</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-[#2a3f5f] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{t[item.labelKey]}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile & Actions */}
      <div className="border-t border-[#334155] p-6 space-y-4">
        {user && (
          <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
            <div className="text-sm text-gray-400 mb-2">{t.currentProficiency}</div>
            <div className="text-2xl font-bold text-blue-400">{user.level}</div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
          type="button"
        >
          <LogOut className="w-5 h-5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  )
}
