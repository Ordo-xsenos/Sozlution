import { test, expect } from '@playwright/test'
import { mvpText } from '../../lib/mvp-i18n'
import { registerAndReachMvp } from './helpers'

test.describe('Learn day flow', () => {
  const timestamp = Date.now()
  const email = `learn_tester_${timestamp}@sozlution.com`
  const password = 'Password123!'
  const t = mvpText.uz

  test.beforeEach(async ({ page }) => {
    await registerAndReachMvp(page, email, password, 'uz')
    await page.goto('/mvp/learn')
    await expect(page.locator('.perspective-1000').first()).toBeVisible({ timeout: 20000 })
  })

  test('flips cards and enters practice steps', async ({ page }) => {
    const card = page.locator('.perspective-1000').first()
    await card.click()
    await expect(page.getByText(/\d+ dan \d+-so'z/)).toBeVisible()

    const startPractice = page.getByRole('button', { name: t.learn.startPractice })
    if (await startPractice.isVisible().catch(() => false)) {
      await startPractice.click()
      await expect(page.getByPlaceholder(t.learn.inputPlaceholder)).toBeVisible({
        timeout: 15000,
      })
    }
  })
})
