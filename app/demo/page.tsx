'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

const videoUrl = 'https://www.youtube.com/embed/hvL1339luv0'
const youtubeWatchUrl = 'https://www.youtube.com/watch?v=hvL1339luv0'

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
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Demo</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Short product demo for the So&apos;zlution MVP flow: guest onboarding, level test, daily learning loop,
            and progress tracking.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              className="h-full w-full"
              src={videoUrl}
              title="Sozlution MVP Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-2xl font-semibold">Video Description</h2>
            <p className="text-muted-foreground">
              In this demo, we show the core learning loop of the MVP: creating a guest session, taking a 20-question
              level test, generating a 30-day plan, completing the current lesson, and reviewing progress metrics.
              The purpose is to validate product flow, UX clarity, and API readiness for judging.
            </p>
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary/80"
            >
              Open on YouTube <ExternalLink className="h-4 w-4" />
            </a>
          </article>

          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-2xl font-semibold">Prototype Link</h2>
            <p className="text-muted-foreground">
              Open the interactive MVP prototype page. It includes language selection, name-only onboarding, level test,
              level mapping, and generated 30-day plan status.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="inline-flex items-center gap-2">
                <Link href="/register">
                  <PlayCircle className="h-4 w-4" />
                  Create Account
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/">
                  Back to Landing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
