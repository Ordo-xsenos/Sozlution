import React, { useEffect } from 'react'
import { render, screen, act, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApp, AppProvider } from './app-context'

// Mock dependencies
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}))

vi.mock('@/lib/auth', () => ({
  getAuthToken: vi.fn(),
  clearAuthSession: vi.fn(),
  setAuthToken: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  buildApiUrl: (p: string) => `http://mock-api${p}`,
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}))

const TestComponent = ({ onReady }: { onReady: (app: any) => void }) => {
  const app = useApp()
  useEffect(() => {
    if (app.authReady) onReady(app)
  }, [app.authReady, app, onReady])
  return (
    <div>
      <div data-testid="ready">{app.authReady ? 'YES' : 'NO'}</div>
      <div data-testid="user">{app.user?.name || ''}</div>
    </div>
  )
}

describe('AppProvider Integration Final', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    cleanup()
  })

  const mockRes = (ok: boolean, status: number, data: any) => Promise.resolve({
    ok,
    status,
    text: () => Promise.resolve(data === undefined ? '' : (typeof data === 'string' ? data : JSON.stringify(data))),
  } as any)

  it('covers everything', async () => {
    const { getAuthToken, setAuthToken, clearAuthSession } = await import('@/lib/auth')
    const { logger } = await import('@/lib/logger')
    const f = vi.mocked(fetch)

    // Initial Hydration (IELTS + No Plan -> Generate)
    vi.mocked(getAuthToken).mockReturnValue('t1')
    f.mockImplementation((url) => {
      const u = url.toString()
      if (u.includes('/user')) return mockRes(true, 200, { user: { id: '1', name: 'Init', level: 'IELTS' } })
      if (u.includes('/ielts-mode/stats')) return mockRes(true, 200, { estimated_band: 7 })
      if (u.includes('/plan/generate')) return mockRes(true, 200, { plan: {} })
      if (u.includes('/plan')) {
         if (f.mock.calls.filter(c => c[0].toString().includes('/plan')).length === 1) return mockRes(true, 200, { plan: { days: [] } })
         return mockRes(true, 200, { plan: { id: 'g', days: [{day:1}] } })
      }
      return mockRes(true, 200, {})
    })

    let app: any
    render(<AppProvider><TestComponent onReady={(a) => { app = a }} /></AppProvider>)
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('YES'))
    await waitFor(() => expect(app).toBeTruthy())
    expect(logger.info).toHaveBeenCalled()

    // 1. updateUser
    f.mockResolvedValueOnce(mockRes(true, 200, { user: { id: '1', name: 'Upd' } }))
    await act(async () => { await app.updateUser({ name: 'Upd' }) })
    expect(screen.getByTestId('user')).toHaveTextContent('Upd')

    // 2. request branches (no token, empty raw, errors)
    vi.mocked(getAuthToken).mockReturnValue(null)
    f.mockResolvedValueOnce(mockRes(true, 200, undefined)) // Empty raw
    await app.request('/api/v1/user' as any)
    
    f.mockResolvedValueOnce(mockRes(false, 400, { detail: 'D' }))
    await expect(app.request('/api/v1/user' as any)).rejects.toThrow('D')

    // 3. logout
    act(() => { app.logout() })
    expect(clearAuthSession).toHaveBeenCalled()

    // 4. login
    f.mockResolvedValueOnce(mockRes(true, 200, { user: { id: '1' } }))
    await act(async () => { await app.login('t2') })
    expect(setAuthToken).toHaveBeenCalledWith('t2')
  })
})
