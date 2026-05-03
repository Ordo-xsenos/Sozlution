'use client'

import { IeltsSidebar } from '@/components/ielts/sidebar'
import { IeltsMobileNav } from '@/components/ielts/mobile-nav'
import { AppProvider, useApp } from '@/context/app-context'
import Antigravity from '@/components/effects/antigravity'
import { Loader2, ShieldCheck } from 'lucide-react'

function IeltsFrame({ children }: { children: React.ReactNode }) {
  const { authReady, loading, user, error } = useApp()

  if (!authReady || (loading && !user)) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#050810]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    )
  }

  // В реальном приложении здесь была бы проверка: if (user?.level !== 'IELTS') redirect('/mvp')
  // Но для разработки мы позволяем просмотр.

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050810] text-amber-400 p-6 text-center">
        <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-gray-500 max-w-md">Please complete your level tests to unlock the professional IELTS preparation mode.</p>
        {error && <div className="mt-4 text-xs text-red-500/50">{error}</div>}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="relative hidden h-screen bg-[#050810]/80 md:flex">
        <IeltsSidebar />
        <main className="flex-1 overflow-auto border-l border-white/5">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="relative flex h-screen flex-col bg-[#050810]/80 md:hidden">
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>
        <IeltsMobileNav />
      </div>
    </>
  )
}

export default function IeltsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-100 overflow-hidden bg-[#020408]" style={{ width: '100%', height: '100%' }}>
        <Antigravity
          count={200}
          magnetRadius={8}
          ringRadius={10}
          waveSpeed={0.2}
          waveAmplitude={0.5}
          particleSize={1}
          lerpSpeed={0.03}
          color="#F59E0B" // Золотой/Янтарный для IELTS Mode
          autoAnimate
          particleVariance={1}
          rotationSpeed={0.1}
          depthFactor={1.2}
          pulseSpeed={2}
          particleShape="sphere"
          fieldStrength={15}
        />
      </div>
      <IeltsFrame>{children}</IeltsFrame>
    </>
  )
}
