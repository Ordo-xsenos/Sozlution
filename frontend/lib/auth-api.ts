import type { components } from '@/lib/api-types'
import { buildApiUrl } from '@/lib/api'

type SessionCreate = components['schemas']['SessionCreate']
type SessionResponse = components['schemas']['SessionResponse']
type PasswordResetRequestIn = components['schemas']['PasswordResetRequestIn']
type PasswordResetConfirmIn = components['schemas']['PasswordResetConfirmIn']
type OkOut = components['schemas']['OkOut']

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = await response.text()
  const parsed = raw ? JSON.parse(raw) as T | { detail?: string; message?: string } : null

  if (!response.ok) {
    if (parsed && typeof parsed === 'object' && ('detail' in parsed || 'message' in parsed)) {
      throw new Error(parsed.detail || parsed.message || `HTTP ${response.status}`)
    }
    throw new Error(`HTTP ${response.status}`)
  }

  return parsed as T
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return parseResponse<T>(response)
}

export function createSession(payload: SessionCreate) {
  return postJson<SessionResponse>('/api/v1/session', payload)
}

export function requestPasswordReset(payload: PasswordResetRequestIn) {
  return postJson<OkOut>('/api/v1/password-reset/request', payload)
}

export function confirmPasswordReset(payload: PasswordResetConfirmIn) {
  return postJson<OkOut>('/api/v1/password-reset/confirm', payload)
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
