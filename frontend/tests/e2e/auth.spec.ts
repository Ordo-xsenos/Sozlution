import { test, expect } from '@playwright/test';
import { PLACEMENT_TEST_QUESTIONS } from '../../lib/placement-test-questions';

test.describe('Full Application Flow (E2E)', () => {
  const timestamp = Date.now();
  const email = `mega_tester_${timestamp}@sozlution.com`;
  const password = 'Password123!';

  test('should complete the entire user journey from registration to IELTS', async ({ page }) => {
    // 1. REGISTRATION
    await page.goto('/register');
    await page.locator('#register-name').fill('Mega Tester');
    await page.locator('#register-email').fill(email);
    await page.locator('#register-password').fill(password);
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click({ force: true });

    // 2. PLACEMENT TEST
    await expect(page.getByRole('heading', { name: 'Placement Test' })).toBeVisible({ timeout: 20000 });
    
    // Answer questions to get C1/IELTS level
    for (let i = 0; i < 20; i++) {
      const question = PLACEMENT_TEST_QUESTIONS[i];
      const correctOption = String.fromCharCode(65 + question.correctIndex);
      await page.getByText(correctOption, { exact: true }).first().click();
      if (i < 19) await page.getByRole('button', { name: 'Далее' }).click();
      else await page.getByRole('button', { name: 'Узнать свой уровень' }).click();
    }

    await expect(page.locator('p:has-text("C1")').first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Начать обучение' }).click();

    // 3. MVP DASHBOARD & NAVIGATION
    await expect(page).toHaveURL(/\/mvp/, { timeout: 15000 });
    await expect(page.getByText('Прогресс').first()).toBeVisible();
    
    await page.getByText('Достижения').first().click();
    await expect(page).toHaveURL(/\/mvp\/achievements/);

    // 4. LEARN MODE (3D CARDS)
    await page.goto('/mvp/learn');
    const card = page.locator('.perspective-1000').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.click();
    await expect(page.locator('text=Translation')).toBeVisible();

    // 5. IELTS MODE
    await page.goto('/ielts/dashboard');
    await expect(page.getByRole('heading', { name: /Hello/ })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=IELTS Candidate')).toBeVisible();

    // 6. WRITING PRACTICE
    await page.goto('/ielts/writing');
    await expect(page.getByRole('tab', { name: 'Task 1' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Start Timer' }).click();
    await page.locator('textarea').fill('This is a comprehensive E2E test for the writing module of Sozlution IELTS mode.');
    await expect(page.locator('text=Word Count')).toBeVisible();

    // 7. MOCK TESTS
    await page.goto('/ielts/mock-tests');
    await page.getByText('Academic Reading').first().click();
    await expect(page.locator('text=Academic Reading Simulation')).toBeVisible();
  });
});
