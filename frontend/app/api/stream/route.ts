import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

function getBackendBaseUrl(): string {
  const configured = process.env.BACKEND_INTERNAL_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  const publicApi = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (publicApi && !publicApi.includes('backend:')) {
    try {
      const url = new URL(publicApi)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return `${url.protocol}//${url.hostname}:8000`
      }
    } catch {
      // fall through to docker default
    }
  }

  return 'http://backend:8000'
}

export async function POST(req: NextRequest) {
  const endpoint = `${getBackendBaseUrl()}/api/v1/ai/chat-stream`
  const authHeader = req.headers.get('Authorization')

  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Backend AI request failed', details: errorText },
        { status: response.status }
      )
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    logger.error('AI API Proxy Error:', error)
    return NextResponse.json({ error: 'Failed to connect to AI API' }, { status: 502 })
  }
}