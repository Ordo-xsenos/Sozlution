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
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0618] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_30%)]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <section className="w-full max-w-xl space-y-5 sm:space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 font-bold text-white shadow-lg shadow-violet-500/30">S</span>
            <span className="text-lg sm:text-xl font-semibold">So&apos;zlution</span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] sm:text-xs uppercase tracking-[0.24em] text-cyan-300">
              MVP
            </span>
          </Link>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.32em] text-cyan-300">{eyebrow}</p>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white break-words leading-tight">{title}</h1>
            <p className="max-w-lg text-sm sm:text-base lg:text-lg leading-6 sm:leading-7 text-slate-300 break-words">{description}</p>
          </div>
          <div className="grid w-full gap-3 text-sm text-slate-300 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div key={highlight.title} className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-sm min-w-0">
                <div className="mb-1 sm:mb-2 text-cyan-300 truncate">{highlight.title}</div>
                <p className="text-xs sm:text-sm break-words">{highlight.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-md shrink-0">
          {children}
        </section>
      </div>
    </main>
  )
}
