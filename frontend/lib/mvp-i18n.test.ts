import { describe, it, expect } from 'vitest'
import { getMvpLang, mvpText } from './mvp-i18n'

describe('mvp-i18n helpers', () => {
  describe('getMvpLang', () => {
    it('should return "uz" by default if no language is provided', () => {
      expect(getMvpLang()).toBe('uz')
      expect(getMvpLang(null)).toBe('uz')
    })

    it('should return "ru" if "ru" is provided', () => {
      expect(getMvpLang('ru')).toBe('ru')
    })

    it('should return "uz" if "uz" is provided', () => {
      expect(getMvpLang('uz')).toBe('uz')
    })

    it('should return "uz" for any other value', () => {
      // @ts-ignore
      expect(getMvpLang('en')).toBe('uz')
    })
  })

  describe('mvpText object coverage', () => {
    it('should have working dynamic functions in all languages', () => {
      const languages: Array<'ru' | 'uz'> = ['ru', 'uz']
      
      languages.forEach(lang => {
        const t = mvpText[lang]
        
        // Dashboard greeting
        expect(t.dashboard.greeting('User')).toContain('User')
        
        // Dashboard currentPlan
        expect(t.dashboard.currentPlan(5)).toContain('5')
        
        // Dashboard learnedSummary
        expect(t.dashboard.learnedSummary(10)).toContain('10')

        // Achievements unlockedSummary
        expect(t.achievements.unlockedSummary(2, 5)).toContain('2')
        expect(t.achievements.unlockedSummary(2, 5)).toContain('5')
        
        // Learn wordCounter
        expect(t.learn.wordCounter(1, 10)).toContain('1')
        expect(t.learn.wordCounter(1, 10)).toContain('10')
        
        // Tips emptyTip
        expect(t.tips.emptyTip('B1')).toContain('B1')
        
        // Test title
        expect(t.test.title('B1')).toContain('B1')
        expect(t.test.title()).toBeDefined()
        
        // Test question
        expect(t.test.question(1, 20)).toContain('1')
        expect(t.test.question(1, 20)).toContain('20')

        // IELTS masteredFeedback
        expect(t.ielts.masteredFeedback(5)).toContain('5')

        // IELTS outOfCorrect
        expect(t.ielts.outOfCorrect(3, 5)).toContain('3')
        expect(t.ielts.outOfCorrect(3, 5)).toContain('5')
      })
    })
  })
})
