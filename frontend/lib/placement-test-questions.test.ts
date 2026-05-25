import { describe, it, expect } from 'vitest'
import { determineLevelFromScore, Question } from './placement-test-questions'

describe('determineLevelFromScore', () => {
  const mockQuestions: Question[] = [
    { id: 1, text: 'Q1', options: ['A', 'B'], correctIndex: 0 },
    { id: 2, text: 'Q2', options: ['A', 'B'], correctIndex: 0 },
    { id: 3, text: 'Q3', options: ['A', 'B'], correctIndex: 0 },
    { id: 4, text: 'Q4', options: ['A', 'B'], correctIndex: 0 },
    { id: 5, text: 'Q5', options: ['A', 'B'], correctIndex: 0 },
    { id: 6, text: 'Q6', options: ['A', 'B'], correctIndex: 0 },
    { id: 7, text: 'Q7', options: ['A', 'B'], correctIndex: 0 },
    { id: 8, text: 'Q8', options: ['A', 'B'], correctIndex: 0 },
    { id: 9, text: 'Q9', options: ['A', 'B'], correctIndex: 0 },
    { id: 10, text: 'Q10', options: ['A', 'B'], correctIndex: 0 },
  ]

  it('should return C1 for score >= 90%', () => {
    const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
    expect(determineLevelFromScore(answers, mockQuestions).level).toBe('C1')
    
    const answers9 = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 1 }
    expect(determineLevelFromScore(answers9, mockQuestions).level).toBe('C1')
  })

  it('should return B2 for score >= 70%', () => {
    const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1, 9: 1, 10: 1 }
    expect(determineLevelFromScore(answers, mockQuestions).level).toBe('B2')
  })

  it('should return B1 for score >= 50%', () => {
    const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 }
    expect(determineLevelFromScore(answers, mockQuestions).level).toBe('B1')
  })

  it('should return A2 for score >= 30%', () => {
    const answers = { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 }
    expect(determineLevelFromScore(answers, mockQuestions).level).toBe('A2')
  })

  it('should return A1 for score < 30%', () => {
    const answers = { 1: 0, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 }
    expect(determineLevelFromScore(answers, mockQuestions).level).toBe('A1')
  })
})
