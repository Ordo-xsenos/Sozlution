import { test, expect } from '@playwright/test'
import { mvpText } from '../../lib/mvp-i18n'
import { registerAndReachMvp } from './helpers'

test.describe('Registration to IELTS journey', () => {
  const timestamp = Date.now()
  const email = `mega_tester_${timestamp}@sozlution.com`
  const password = 'Password123!'
  const t = mvpText.uz

  test('register, placement, MVP nav, learn, IELTS modules', async ({ page }) => {
    await registerAndReachMvp(page, email, password, 'uz')

    await expect(page.getByText(t.nav.progress).first()).toBeVisible()

    await page.getByText(t.nav.achievements).first().click()
    await expect(page).toHaveURL(/\/mvp\/achievements/)

    await page.goto('/mvp/learn')
    const card = page.locator('.perspective-1000').first()
    await expect(card).toBeVisible({ timeout: 15000 })
    await card.click()
    await expect(page.getByText(/\d+ dan \d+-so'z/)).toBeVisible()

    await page.goto('/ielts/dashboard')
    await expect(page.getByRole('heading', { name: /Salom/ })).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=IELTS Candidate')).toBeVisible()

    await page.goto('/ielts/writing')
    await expect(page.getByRole('tab', { name: 'Task 1' }).first()).toBeVisible()
    await page.getByRole('button', { name: 'Start Timer' }).click()
    await page.locator('textarea').fill('E2E writing sample for Sozlution IELTS mode.')
    await expect(page.locator('text=Word Count')).toBeVisible()

    await page.goto('/ielts/mock-tests')
    await page.getByText('Academic Reading').first().click()
    await expect(page.locator('text=Academic Reading Simulation')).toBeVisible()
  })
})
