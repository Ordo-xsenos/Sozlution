import { describe, it, expect, vi } from 'vitest'
import { rateLimit } from './rate-limit'

describe('rateLimit', () => {
  it('should allow requests within limit', () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })
    
    expect(limiter.check(3, 'test-token').success).toBe(true)
    expect(limiter.check(3, 'test-token').success).toBe(true)
    expect(limiter.check(3, 'test-token').success).toBe(false)
  })

  it('should return correct remaining count', () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })
    
    expect(limiter.check(5, 'token-1').remaining).toBe(4)
    expect(limiter.check(5, 'token-1').remaining).toBe(3)
    expect(limiter.check(5, 'token-1').remaining).toBe(2)
  })

  it('should use different buckets for different tokens', () => {
    const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })
    
    expect(limiter.check(1, 'token-A').success).toBe(false)
    expect(limiter.check(1, 'token-B').success).toBe(false)
  })

  it('should handle default options if not provided', () => {
    // @ts-ignore
    const limiter = rateLimit({})
    expect(limiter.check(2, 'token').success).toBe(true)
    expect(limiter.check(2, 'token').success).toBe(false)
  })
})
