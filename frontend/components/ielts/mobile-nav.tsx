'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  FileText,
  TrendingUp,
} from 'lucide-react'

const menuItems = [
  {
    name: 'Dashboard',
    shortName: 'Dash',
    href: '/ielts/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Vocab',
    shortName: 'Vocab',
    href: '/ielts/vocabulary',
    icon: BookOpen,
  },
  {
    name: 'Writing',
    shortName: 'Writing',
    href: '/ielts/writing',
    icon: PenTool,
  },
  {
    name: 'Mock',
    shortName: 'Mock',
    href: '/ielts/mock-tests',
    icon: FileText,
  },
  {
    name: 'Progress',
    shortName: 'Stat',
    href: '/ielts/progress',
    icon: TrendingUp,
  },
]

export function IeltsMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#050810] border-t border-amber-500/20 z-50">
      <div className="flex justify-around overflow-x-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 min-w-[70px] transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-500 border-t-2 border-amber-500'
                  : 'text-gray-500 hover:text-amber-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.shortName}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
