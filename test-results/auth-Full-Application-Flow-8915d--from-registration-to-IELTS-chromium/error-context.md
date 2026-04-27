# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Full Application Flow (E2E) >> should complete the entire user journey from registration to IELTS
- Location: tests/e2e/auth.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.perspective-1000').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('.perspective-1000').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e7]:
    - complementary [ref=e8]:
      - heading "So'zlution" [level=1] [ref=e10]
      - navigation [ref=e11]:
        - list [ref=e12]:
          - listitem [ref=e13]:
            - link "Дашбород" [ref=e14] [cursor=pointer]:
              - /url: /mvp
              - img [ref=e15]
              - generic [ref=e20]: Дашбород
          - listitem [ref=e21]:
            - link "Учить сейчас" [ref=e22] [cursor=pointer]:
              - /url: /mvp/learn
              - img [ref=e23]
              - generic [ref=e25]: Учить сейчас
          - listitem [ref=e26]:
            - link "So'zlution AI Coach" [ref=e27] [cursor=pointer]:
              - /url: /mvp/coach
              - img [ref=e28]
              - generic [ref=e30]: So'zlution AI Coach
          - listitem [ref=e31]:
            - link "Прогресс" [ref=e32] [cursor=pointer]:
              - /url: /mvp/progress
              - img [ref=e33]
              - generic [ref=e36]: Прогресс
          - listitem [ref=e37]:
            - link "Достижения" [ref=e38] [cursor=pointer]:
              - /url: /mvp/achievements
              - img [ref=e39]
              - generic [ref=e45]: Достижения
          - listitem [ref=e46]:
            - link "Сдать тест уровня" [ref=e47] [cursor=pointer]:
              - /url: /mvp/test
              - img [ref=e48]
              - generic [ref=e51]: Сдать тест уровня
          - listitem [ref=e52]:
            - link "Советы" [ref=e53] [cursor=pointer]:
              - /url: /mvp/tips
              - img [ref=e54]
              - generic [ref=e56]: Советы
          - listitem [ref=e57]:
            - link "Помощь" [ref=e58] [cursor=pointer]:
              - /url: /mvp/help
              - img [ref=e59]
              - generic [ref=e62]: Помощь
          - listitem [ref=e63]:
            - link "Настройки" [ref=e64] [cursor=pointer]:
              - /url: /mvp/settings
              - img [ref=e65]
              - generic [ref=e68]: Настройки
      - generic [ref=e69]:
        - generic [ref=e70]:
          - generic [ref=e71]: Current Proficiency
          - generic [ref=e72]: C1
        - button "Выход" [ref=e73]:
          - img [ref=e74]
          - generic [ref=e77]: Выход
    - main [ref=e78]:
      - generic [ref=e80]:
        - generic [ref=e81]: 🗓️
        - heading "План не найден" [level=1] [ref=e82]
        - paragraph [ref=e83]: На сегодня заданий нет. Вернитесь позже!
        - link "На главную" [ref=e84] [cursor=pointer]:
          - /url: /mvp
          - button "На главную" [ref=e85]
  - generic [ref=e90] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e91]:
      - img [ref=e92]
    - generic [ref=e95]:
      - button "Open issues overlay" [ref=e96]:
        - generic [ref=e97]:
          - generic [ref=e98]: "0"
          - generic [ref=e99]: "1"
        - generic [ref=e100]: Issue
      - button "Collapse issues badge" [ref=e101]:
        - img [ref=e102]
  - alert [ref=e104]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { PLACEMENT_TEST_QUESTIONS } from '../../lib/placement-test-questions';
  3  | 
  4  | test.describe('Full Application Flow (E2E)', () => {
  5  |   const timestamp = Date.now();
  6  |   const email = `mega_tester_${timestamp}@sozlution.com`;
  7  |   const password = 'Password123!';
  8  | 
  9  |   test('should complete the entire user journey from registration to IELTS', async ({ page }) => {
  10 |     // 1. REGISTRATION
  11 |     await page.goto('/register');
  12 |     await page.locator('#register-name').fill('Mega Tester');
  13 |     await page.locator('#register-email').fill(email);
  14 |     await page.locator('#register-password').fill(password);
  15 |     await page.waitForTimeout(1000);
  16 |     await page.getByRole('button', { name: 'Создать аккаунт' }).click({ force: true });
  17 | 
  18 |     // 2. PLACEMENT TEST
  19 |     await expect(page.getByRole('heading', { name: 'Placement Test' })).toBeVisible({ timeout: 20000 });
  20 |     
  21 |     // Answer questions to get C1/IELTS level
  22 |     for (let i = 0; i < 20; i++) {
  23 |       const question = PLACEMENT_TEST_QUESTIONS[i];
  24 |       const correctOption = String.fromCharCode(65 + question.correctIndex);
  25 |       await page.getByText(correctOption, { exact: true }).first().click();
  26 |       if (i < 19) await page.getByRole('button', { name: 'Далее' }).click();
  27 |       else await page.getByRole('button', { name: 'Узнать свой уровень' }).click();
  28 |     }
  29 | 
  30 |     await expect(page.locator('p:has-text("C1")').first()).toBeVisible({ timeout: 15000 });
  31 |     await page.getByRole('button', { name: 'Начать обучение' }).click();
  32 | 
  33 |     // 3. MVP DASHBOARD & NAVIGATION
  34 |     await expect(page).toHaveURL(/\/mvp/, { timeout: 15000 });
  35 |     await expect(page.getByText('Прогресс').first()).toBeVisible();
  36 |     
  37 |     await page.getByText('Достижения').first().click();
  38 |     await expect(page).toHaveURL(/\/mvp\/achievements/);
  39 | 
  40 |     // 4. LEARN MODE (3D CARDS)
  41 |     await page.goto('/mvp/learn');
  42 |     const card = page.locator('.perspective-1000').first();
> 43 |     await expect(card).toBeVisible({ timeout: 15000 });
     |                        ^ Error: expect(locator).toBeVisible() failed
  44 |     await card.click();
  45 |     await expect(page.locator('text=Translation')).toBeVisible();
  46 | 
  47 |     // 5. IELTS MODE
  48 |     await page.goto('/ielts/dashboard');
  49 |     await expect(page.getByRole('heading', { name: /Hello/ })).toBeVisible({ timeout: 15000 });
  50 |     await expect(page.locator('text=IELTS Candidate')).toBeVisible();
  51 | 
  52 |     // 6. WRITING PRACTICE
  53 |     await page.goto('/ielts/writing');
  54 |     await expect(page.getByRole('tab', { name: 'Task 1' }).first()).toBeVisible();
  55 |     await page.getByRole('button', { name: 'Start Timer' }).click();
  56 |     await page.locator('textarea').fill('This is a comprehensive E2E test for the writing module of Sozlution IELTS mode.');
  57 |     await expect(page.locator('text=Word Count')).toBeVisible();
  58 | 
  59 |     // 7. MOCK TESTS
  60 |     await page.goto('/ielts/mock-tests');
  61 |     await page.getByText('Academic Reading').first().click();
  62 |     await expect(page.locator('text=Academic Reading Simulation')).toBeVisible();
  63 |   });
  64 | });
  65 | 
```