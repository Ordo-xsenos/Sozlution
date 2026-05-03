'use client'

import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold">
            So&apos;zlution
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Go to Login
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center">Demo</h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex items-center justify-center min-h-[400px] mb-12">
          <h2 className="text-9xl font-black text-white opacity-10 tracking-tighter">MVP</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <article className="rounded-xl border border-border bg-card p-8 text-center space-y-6">
            <h2 className="text-2xl font-semibold">Interactive Prototype</h2>
            <p className="text-muted-foreground">
              Open the interactive MVP prototype page. It includes language selection, name-only onboarding, level test,
              level mapping, and generated 30-day plan status.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="h-12 px-8 inline-flex items-center gap-2 text-lg">
                <Link href="/register">
                  <PlayCircle className="h-5 w-5" />
                  Create Account
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-8 bg-transparent text-lg">
                <Link href="/">
                  Back to Landing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
