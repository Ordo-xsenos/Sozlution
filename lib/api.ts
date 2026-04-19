const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export function buildApiUrl(path: string) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  if (/^https?:\/\//i.test(path)) return path

  let normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Legacy prefix compatibility to avoid /api/v1/api/mvp/* in mixed clients.
  if (normalizedPath.startsWith('/api/mvp/')) {
    normalizedPath = normalizedPath.replace(/^\/api\/mvp/, '/api/v1')
  }

  // If base already ends with /api/v1, prevent duplicating this prefix.
  if (base.endsWith('/api/v1') && normalizedPath.startsWith('/api/v1/')) {
    return `${base}${normalizedPath.replace('/api/v1', '')}`
  }

  return `${base}${normalizedPath}`
}
