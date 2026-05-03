import type { ReactNode } from 'react'
import Link from 'next/link'

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  highlights: Array<{ title: string; text: string }>
  children: ReactNode
}

export function AuthShell({ eyebrow, title, description, highlights, children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081225] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(53,122,255,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.18),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <section className="max-w-xl space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
            <span className="text-xl font-semibold">So&apos;zlution</span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs uppercase tracking-[0.24em] text-cyan-300">
              MVP
            </span>
          </Link>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">{eyebrow}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
            <p className="max-w-lg text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
          </div>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div key={highlight.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-2 text-cyan-300">{highlight.title}</div>
                <p>{highlight.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-md">
          {children}
        </section>
      </div>
    </main>
  )
}
