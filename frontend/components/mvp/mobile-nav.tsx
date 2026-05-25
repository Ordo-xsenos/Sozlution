'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  TrendingUp,
  Trophy,
  Lightbulb,
  HelpCircle,
  Settings,
} from 'lucide-react'
import { useApp } from '@/context/app-context'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

const menuItems = [
  {
    labelKey: 'dashboard',
    shortLabelKey: 'home',
    href: '/mvp',
    icon: LayoutDashboard,
  },
  {
    labelKey: 'learn',
    shortLabelKey: 'learn',
    href: '/mvp/learn',
    icon: BookOpen,
  },
  {
    labelKey: 'coach',
    shortLabelKey: 'coach',
    href: '/mvp/coach',
    icon: Zap,
  },
  {
    labelKey: 'progress',
    shortLabelKey: 'progress',
    href: '/mvp/progress',
    icon: TrendingUp,
  },
  {
    labelKey: 'awards',
    shortLabelKey: 'awards',
    href: '/mvp/achievements',
    icon: Trophy,
  },
  {
    labelKey: 'tips',
    shortLabelKey: 'tips',
    href: '/mvp/tips',
    icon: Lightbulb,
  },
  {
    labelKey: 'help',
    shortLabelKey: 'help',
    href: '/mvp/help',
    icon: HelpCircle,
  },
  {
    labelKey: 'settings',
    shortLabelKey: 'settings',
    href: '/mvp/settings',
    icon: Settings,
  },
] as const

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useApp()
  const t = mvpText[getMvpLang(user?.lang)].nav

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a2744] border-t border-[#334155] z-50">
      <div className="flex justify-around overflow-x-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 min-w-max transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border-t-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6 mb-1" />
              <span className="text-xs text-center">{t[item.shortLabelKey]}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
