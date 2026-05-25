import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('a', 'b')).toBe('a b')
      expect(cn('a', { 'b': true, 'c': false })).toBe('a b')
    })

    it('should handle tailwind conflicts', () => {
      expect(cn('px-2 py-2', 'p-4')).toBe('p-4')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn(null, undefined, false)).toBe('')
    })
  })
})
