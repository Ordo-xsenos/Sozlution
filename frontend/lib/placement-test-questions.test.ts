import { describe, it, expect } from 'vitest'
import { determineLevelFromScore, Question } from './placement-test-questions'

describe('determineLevelFromScore', () => {
  const mockQuestions: Question[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: `Q${i + 1}`,
    options: ['A', 'B'],
    correctIndex: 0,
  }))

  const answersWithScore = (score: number) => {
    const answers: Record<number, number> = {}
    for (let i = 1; i <= 20; i++) {
      answers[i] = i <= score ? 0 : 1
    }
    return answers
  }

  it('should return C1 for score >= 18', () => {
    expect(determineLevelFromScore(answersWithScore(20), mockQuestions).level).toBe('C1')
    expect(determineLevelFromScore(answersWithScore(18), mockQuestions).level).toBe('C1')
  })

  it('should return B2 for score 15-17', () => {
    expect(determineLevelFromScore(answersWithScore(17), mockQuestions).level).toBe('B2')
    expect(determineLevelFromScore(answersWithScore(15), mockQuestions).level).toBe('B2')
  })

  it('should return B1 for score 11-14', () => {
    expect(determineLevelFromScore(answersWithScore(14), mockQuestions).level).toBe('B1')
    expect(determineLevelFromScore(answersWithScore(11), mockQuestions).level).toBe('B1')
  })

  it('should return A2 for score 7-10', () => {
    expect(determineLevelFromScore(answersWithScore(10), mockQuestions).level).toBe('A2')
    expect(determineLevelFromScore(answersWithScore(7), mockQuestions).level).toBe('A2')
  })

  it('should return A1 for score < 7', () => {
    expect(determineLevelFromScore(answersWithScore(6), mockQuestions).level).toBe('A1')
    expect(determineLevelFromScore(answersWithScore(0), mockQuestions).level).toBe('A1')
  })

  it('should return the raw score', () => {
    expect(determineLevelFromScore(answersWithScore(13), mockQuestions).score).toBe(13)
  })
})
