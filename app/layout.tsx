import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import ClickSpark from '@/components/effects/click-spark'
import { AppProvider } from '@/context/app-context'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "So'zlution - Master English with Spaced Repetition & IELTS Prep",
  description: 'Learn English vocabulary systematically with adaptive spaced repetition, IELTS practice, and personalized level tracking.',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    userScalable: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ClickSpark
              sparkColor="#ffffff"
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
              easing="ease-out"
              extraScale={1}
            >
              {children}
            </ClickSpark>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  )
}
