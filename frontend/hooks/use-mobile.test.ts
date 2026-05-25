import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useIsMobile } from './use-mobile'

describe('useIsMobile', () => {
  it('should return true if window width is less than breakpoint', () => {
    vi.stubGlobal('innerWidth', 500)
    
    let changeHandler: any
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn().mockImplementation((event, handler) => {
        if (event === 'change') changeHandler = handler
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    // Test resize
    vi.stubGlobal('innerWidth', 1024)
    act(() => {
      if (changeHandler) changeHandler()
    })
    expect(result.current).toBe(false)
  })

  it('should return false if window width is greater than or equal to breakpoint', () => {
    vi.stubGlobal('innerWidth', 1024)
    
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})
