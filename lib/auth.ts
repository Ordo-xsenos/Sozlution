const TOKEN_KEY = 'sozlution_mvp_token'
const DEVICE_ID_KEY = 'sozlution_mvp_device_id'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `device-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export function getAuthToken() {
  if (!canUseStorage()) return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string) {
  if (!canUseStorage()) return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  if (!canUseStorage()) return
  localStorage.removeItem(TOKEN_KEY)
}

export function getDeviceId() {
  if (!canUseStorage()) return null
  return localStorage.getItem(DEVICE_ID_KEY)
}

export function getOrCreateDeviceId() {
  if (!canUseStorage()) return createDeviceId()

  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing

  const next = createDeviceId()
  localStorage.setItem(DEVICE_ID_KEY, next)
  return next
}

export function clearAuthSession() {
  clearAuthToken()
}
