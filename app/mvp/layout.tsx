'use client'

import { Sidebar } from '@/components/mvp/sidebar'
import { MobileNav } from '@/components/mvp/mobile-nav'
import { useApp } from '@/context/app-context'
import Antigravity from '@/components/effects/antigravity'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'

function MVPFrame({ children }: { children: React.ReactNode }) {
  const { authReady, loading, user, error } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (authReady) {
      if (!getAuthToken()) {
        router.replace('/login')
      } else if (user && !user.level) {
        router.replace('/register/test')
      }
    }
  }, [authReady, user, router])

  if (!authReady || (loading && !user)) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0f172a]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="relative hidden h-screen bg-[#0f172a]/70 md:flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="relative flex h-screen flex-col bg-[#0f172a]/70 md:hidden">
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>
        <MobileNav />
      </div>
    </>
  )
}

export default function MVPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-100 overflow-hidden" style={{ width: '100%', height: '100%' }}>
        <Antigravity
          count={300}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.05}
          color="#5227FF"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={3}
          particleShape="capsule"
          fieldStrength={10}
        />
      </div>
      <MVPFrame>{children}</MVPFrame>
    </>
  )
}
