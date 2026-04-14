'use client'

import { Sidebar } from '@/components/mvp/sidebar'
import { MobileNav } from '@/components/mvp/mobile-nav'
import { AppProvider } from '@/context/app-context'

export default function MVPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen bg-[#0f172a]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen bg-[#0f172a]">
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>
        <MobileNav />
      </div>
    </AppProvider>
  )
}
