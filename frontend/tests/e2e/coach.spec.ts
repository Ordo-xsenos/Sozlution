import { test, expect } from '@playwright/test'
import { mvpText } from '../../lib/mvp-i18n'
import { registerAndReachMvp } from './helpers'

test.describe('AI Coach', () => {
  const timestamp = Date.now()
  const email = `coach_tester_${timestamp}@sozlution.com`
  const password = 'Password123!'
  const t = mvpText.uz

  test.beforeEach(async ({ page }) => {
    await registerAndReachMvp(page, email, password, 'uz')
    await page.goto('/mvp/coach')
    await expect(page.getByText(t.coach.greeting).first()).toBeVisible({ timeout: 15000 })
  })

  test('sends a message and receives assistant reply', async ({ page }) => {
    const input = page.getByPlaceholder(t.coach.placeholder)
    await input.fill('How can I improve my vocabulary?')
    await input.press('Enter')

    await expect(page.locator('.bg-\\[\\#2a3f5f\\]').nth(1)).toBeVisible({ timeout: 60000 })
  })
})
