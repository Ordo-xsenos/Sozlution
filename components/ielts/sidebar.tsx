'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/app-context'
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  FileText,
  TrendingUp,
  ArrowLeft,
  LogOut,
  Sparkles,
} from 'lucide-react'

const menuItems = [
  {
    name: 'IELTS Dashboard',
    href: '/ielts/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Academic Vocabulary',
    href: '/ielts/vocabulary',
    icon: BookOpen,
  },
  {
    name: 'Writing Practice',
    href: '/ielts/writing',
    icon: PenTool,
  },
  {
    name: 'Mock Tests',
    href: '/ielts/mock-tests',
    icon: FileText,
  },
  {
    name: 'IELTS Progress',
    href: '/ielts/progress',
    icon: TrendingUp,
  },
]

export function IeltsSidebar() {
  const pathname = usePathname()
  const { user, logout } = useApp()

  return (
    <aside className="hidden md:flex w-64 bg-[#050810] border-r border-amber-500/20 flex-col h-screen shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Logo */}
      <div className="p-6 border-b border-amber-500/10">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          So&apos;<span className="text-amber-500">zlution</span>
          <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black tracking-tighter">IELTS</span>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-900/40 translate-x-1'
                      : 'text-gray-400 hover:bg-amber-500/10 hover:text-amber-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Return to MVP & Profile */}
      <div className="border-t border-amber-500/10 p-6 space-y-4">
        <Link
          href="/mvp"
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit IELTS Mode</span>
        </Link>

        {user && (
          <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/20">
            <div className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest mb-1">Status</div>
            <div className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              IELTS Candidate
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-sm"
          type="button"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
