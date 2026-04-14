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
} from 'lucide-react'

const menuItems = [
  {
    name: 'Дашбород',
    shortName: 'Главная',
    href: '/mvp',
    icon: LayoutDashboard,
  },
  {
    name: 'Учить',
    shortName: 'Учить',
    href: '/mvp/learn',
    icon: BookOpen,
  },
  {
    name: 'Coach',
    shortName: 'Coach',
    href: '/mvp/coach',
    icon: Zap,
  },
  {
    name: 'Прогресс',
    shortName: 'Прогресс',
    href: '/mvp/progress',
    icon: TrendingUp,
  },
  {
    name: 'Награды',
    shortName: 'Награды',
    href: '/mvp/achievements',
    icon: Trophy,
  },
  {
    name: 'Советы',
    shortName: 'Советы',
    href: '/mvp/tips',
    icon: Lightbulb,
  },
  {
    name: 'Помощь',
    shortName: 'Помощь',
    href: '/mvp/help',
    icon: HelpCircle,
  },
  {
    name: 'Настройки',
    shortName: 'Настройки',
    href: '/mvp/settings',
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()

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
              <span className="text-xs text-center">{item.shortName}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
