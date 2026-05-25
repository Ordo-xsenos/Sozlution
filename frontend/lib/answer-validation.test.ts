import { describe, it, expect } from 'vitest'
import { validateAnswer } from './answer-validation'

describe('validateAnswer', () => {
  it('should match Uzbek words with different apostrophes', () => {
    expect(validateAnswer("o'zbek", "o‘zbek")).toBe(true)
    expect(validateAnswer("o‘zbek", "o‘zbek")).toBe(true)
    expect(validateAnswer("ozbek", "o‘zbek")).toBe(true)
    expect(validateAnswer("o’zbek", "o‘zbek")).toBe(true)
  })

  it('should match words with different types of apostrophes in correct answer', () => {
    expect(validateAnswer("sogliq", "sog'liq")).toBe(true)
    expect(validateAnswer("sog'liq", "sog'liq")).toBe(true)
  })

  it('should match Russian words with dashes and special characters', () => {
    expect(validateAnswer("кое-как", "коекак")).toBe(true)
    expect(validateAnswer("коекак", "кое-как")).toBe(true)
  })

  it('should be case-insensitive', () => {
    expect(validateAnswer("Health", "health")).toBe(true)
    expect(validateAnswer("HEALTH", "Health")).toBe(true)
  })

  it('should support multiple variants separated by comma, semicolon or slash', () => {
    const variants = "способность, умение / навык; талант"
    expect(validateAnswer("способность", variants)).toBe(true)
    expect(validateAnswer("умение", variants)).toBe(true)
    expect(validateAnswer("навык", variants)).toBe(true)
    expect(validateAnswer("талант", variants)).toBe(true)
  })

  it('should allow partial matches for words with at least 3 characters', () => {
    expect(validateAnswer("heal", "health")).toBe(true)
    expect(validateAnswer("hea", "health")).toBe(true)
    expect(validateAnswer("he", "health")).toBe(false)
  })

  it('should return false for completely wrong answers', () => {
    expect(validateAnswer("apple", "banana")).toBe(false)
    expect(validateAnswer("world", "word")).toBe(false)
    expect(validateAnswer("xyz", "abc")).toBe(false)
  })

  it('should return false for empty input', () => {
    expect(validateAnswer("", "test")).toBe(false)
    expect(validateAnswer("  ", "test")).toBe(false)
  })
})
