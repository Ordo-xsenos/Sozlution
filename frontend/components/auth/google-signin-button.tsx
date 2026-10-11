'use client'

import { useEffect, useRef, useState } from 'react'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

let gsiLoadPromise: Promise<void> | null = null

function loadGsi(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('No window'))
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }
  if (!gsiLoadPromise) {
    gsiLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => {
        gsiLoadPromise = null
        reject(new Error('Failed to load Google Sign-In'))
      }
      document.head.appendChild(script)
    })
  }
  return gsiLoadPromise
}

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void
  onError: (message: string) => void
}

export default function GoogleSignInButton({ onCredential, onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return
    let cancelled = false
    loadGsi()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response.credential) {
                onCredential(response.credential)
              } else {
                onError('Google sign-in failed. Please try again.')
              }
            },
          })
          const width = Math.max(200, Math.min(400, containerRef.current.clientWidth || 320))
          window.google.accounts.id.renderButton(containerRef.current, {
            theme: 'filled_black',
            size: 'large',
            width,
            text: 'continue_with',
            shape: 'rectangular',
          })
          setReady(true)
        } catch (error) {
          logger.error('Google button render failed:', error)
          onError('Google sign-in failed. Please try again.')
        }
      })
      .catch((error) => {
        logger.error('Google GSI load failed:', error)
        if (!cancelled) onError('Google sign-in failed. Please try again.')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  if (!clientId) return null

  return (
    <div ref={containerRef} className={`flex w-full justify-center ${ready ? '' : 'min-h-[44px]'}`} />
  )
}
