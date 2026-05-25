import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast, toast, reducer } from './use-toast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('complete toast lifecycle', () => {
    const { result, unmount } = renderHook(() => useToast())

    let tObj: any
    act(() => {
      tObj = toast({ title: 'T1' })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      tObj.update({ id: tObj.id, title: 'U' })
    })

    act(() => {
      result.current.toasts[0].onOpenChange?.(false) 
    })
    expect(result.current.toasts[0].open).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1000001)
    })
    expect(result.current.toasts).toHaveLength(0)
    
    unmount()
  })

  it('dismissal methods', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      toast({ title: '1' })
      toast({ title: '2' })
    })
    
    const id1 = result.current.toasts[0].id
    act(() => {
      result.current.dismiss(id1)
    })
    expect(result.current.toasts.find(t => t.id === id1)?.open).toBe(false)

    act(() => {
      result.current.dismiss()
    })
    expect(result.current.toasts.every(t => !t.open)).toBe(true)
  })

  it('reducer extra coverage', () => {
    const s1 = { toasts: [{ id: '1' }] } as any
    expect(reducer(s1, { type: 'UPDATE_TOAST', toast: { id: '2' } }).toasts[0].id).toBe('1')
    expect(reducer(s1, { type: 'DISMISS_TOAST', toastId: '2' }).toasts[0].open).toBeUndefined()
    
    const s2 = { toasts: [{ id: '1' }, { id: '2' }] } as any
    expect(reducer(s2, { type: 'REMOVE_TOAST', toastId: '1' }).toasts).toHaveLength(1)
    expect(reducer(s1, { type: 'REMOVE_TOAST' }).toasts).toHaveLength(0)
  })

  it('multiple removal triggers', () => {
     const { result } = renderHook(() => useToast())
     act(() => {
       const t = toast({ title: 'X' })
       t.dismiss()
       t.dismiss()
     })
     expect(result.current.toasts[0].open).toBe(false)
  })
})
