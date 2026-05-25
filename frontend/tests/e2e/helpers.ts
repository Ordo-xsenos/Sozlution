import { expect, type Page } from '@playwright/test'
import { PLACEMENT_TEST_QUESTIONS } from '../../lib/placement-test-questions'
import { mvpText, type MvpLang } from '../../lib/mvp-i18n'

export async function registerUser(
  page: Page,
  options: {
    email: string
    password: string
    name?: string
    lang?: MvpLang
  }
) {
  const lang = options.lang ?? 'uz'
  const t = mvpText[lang]

  await page.goto('/register')
  await page.locator('#register-name').fill(options.name ?? 'E2E User')
  await page.locator('#register-email').fill(options.email)
  await page.locator('#register-password').fill(options.password)

  if (lang === 'uz') {
    await page.locator('#register-lang').click()
    await page.getByRole('option', { name: 'O‘zbekcha' }).click()
  } else if (lang === 'ru') {
    await page.locator('#register-lang').click()
    await page.getByRole('option', { name: 'Русский' }).click()
  }

  await page.getByRole('button', { name: t.auth.registerButton }).click({ force: true })
  await expect(page.getByRole('heading', { name: t.test.placementTitle })).toBeVisible({
    timeout: 20000,
  })
}

export async function completePlacementTest(page: Page, lang: MvpLang = 'uz') {
  const t = mvpText[lang]

  for (let i = 0; i < 20; i++) {
    const question = PLACEMENT_TEST_QUESTIONS[i]
    const correctOption = String.fromCharCode(65 + question.correctIndex)
    await page.getByText(correctOption, { exact: true }).first().click()
    if (i < 19) {
      await page.getByRole('button', { name: t.test.next }).click()
    } else {
      await page.getByRole('button', { name: t.test.knowLevel }).click()
    }
  }

  await expect(page.locator('p:has-text("C1")').first()).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: t.test.startLearning }).click()
  await expect(page).toHaveURL(/\/mvp/, { timeout: 15000 })
}

export async function registerAndReachMvp(
  page: Page,
  email: string,
  password: string,
  lang: MvpLang = 'uz'
) {
  await registerUser(page, { email, password, lang })
  await completePlacementTest(page, lang)
}
