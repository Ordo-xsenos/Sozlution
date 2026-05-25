import { test, expect } from '@playwright/test'
import { mvpText } from '../../lib/mvp-i18n'
import { registerAndReachMvp } from './helpers'

test.describe('Login flow', () => {
  const timestamp = Date.now()
  const email = `login_tester_${timestamp}@sozlution.com`
  const password = 'Password123!'
  const t = mvpText.uz

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await registerAndReachMvp(page, email, password, 'uz')
    await page.close()
  })

  test('logs in with existing credentials', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill(email)
    await page.locator('#login-password').fill(password)
    await page.getByRole('button', { name: t.auth.loginButton }).click()

    await expect(page).toHaveURL(/\/mvp/, { timeout: 20000 })
    await expect(page.getByText(t.nav.progress).first()).toBeVisible()
  })

  test('redirects unauthenticated user from MVP to login', async ({ page }) => {
    await page.goto('/mvp')
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
  })
})
