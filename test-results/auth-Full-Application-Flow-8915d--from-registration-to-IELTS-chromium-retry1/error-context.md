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

Locator: getByRole('heading', { name: 'Placement Test' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Placement Test' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - link "So'zlution MVP" [ref=e8] [cursor=pointer]:
          - /url: /
          - generic [ref=e9]: So'zlution
          - generic [ref=e10]: MVP
        - generic [ref=e11]:
          - paragraph [ref=e12]: Register
          - 'heading "Регистрация вынесена в отдельный маршрут `/register`." [level=1] [ref=e13]'
          - paragraph [ref=e14]: "Новый аккаунт создаётся по `username + email + password`. После успешной регистрации пользователь сразу попадает в MVP."
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: Identity
            - paragraph [ref=e18]: Username остаётся публичным именем пользователя, а email становится основным идентификатором для auth-flow.
          - generic [ref=e19]:
            - generic [ref=e20]: Session
            - paragraph [ref=e21]: "После регистрации фронтенд сразу сохраняет `session_token`, чтобы не заставлять пользователя логиниться повторно."
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]: Создать аккаунт
          - generic [ref=e26]: Заполните username, email и пароль. Язык нужен для начальной локализации профиля.
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]: Username
            - generic [ref=e31]:
              - img
              - textbox "Username" [ref=e32]:
                - /placeholder: Например, azizbek
                - text: Mega Tester
          - generic [ref=e33]:
            - generic [ref=e34]: Email
            - generic [ref=e35]:
              - img
              - textbox "Email" [ref=e36]:
                - /placeholder: you@example.com
                - text: mega_tester_1776611289501@sozlution.com
          - generic [ref=e37]:
            - generic [ref=e38]: Пароль
            - generic [ref=e39]:
              - img
              - textbox "Пароль" [ref=e40]:
                - /placeholder: Минимум 8 символов
                - text: Password123!
          - generic [ref=e41]:
            - generic [ref=e42]: Язык интерфейса
            - combobox "Язык интерфейса" [ref=e43]:
              - generic "Русский"
              - img
            - combobox [ref=e44]
          - generic [ref=e45]: Пользователь уже существует
          - button "Создать аккаунт" [ref=e46]
          - paragraph [ref=e47]:
            - text: Уже есть аккаунт?
            - link "Перейти ко входу" [ref=e48] [cursor=pointer]:
              - /url: /login
  - button "Open Next.js Dev Tools" [ref=e54] [cursor=pointer]:
    - img [ref=e55]
  - alert [ref=e58]
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
> 19 |     await expect(page.getByRole('heading', { name: 'Placement Test' })).toBeVisible({ timeout: 20000 });
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
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
  43 |     await expect(card).toBeVisible({ timeout: 15000 });
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