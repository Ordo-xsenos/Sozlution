import { test, expect } from '@playwright/test';

test.describe('AI Chatbot Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open and close the chatbot window', async ({ page }) => {
    // Click on the floating action button to open
    await page.click('button[aria-label="Open chat"]', { force: true });
    
    // Check if the chat window is visible (using a more specific locator for the header)
    const header = page.locator('h3:has-text("Sozlution Assistant")');
    await expect(header).toBeVisible({ timeout: 10000 });
    
    // Click close button (The label in component is "Close")
    await page.click('button[aria-label="Close"]', { force: true });
    
    // Check if the window is closed
    await expect(header).not.toBeVisible();
  });

  test('should send a message and receive an AI response', async ({ page }) => {
    await page.click('button[aria-label="Open chat"]', { force: true });
    
    const input = page.getByPlaceholder('Ask me about Sozlution...');
    await input.fill('What is the pricing model?', { force: true });
    await page.keyboard.press('Enter');
    
    // Verify user message is in chat
    await expect(page.locator('.bg-cyan-500\\/20 >> text="What is the pricing model?"').first()).toBeVisible({ timeout: 10000 });
    
    // Wait for AI response
    await expect(page.locator('.bg-purple-500\\/20').first()).toBeVisible({ timeout: 20000 });
  });

  test('should work with quick suggestion buttons', async ({ page }) => {
    await page.click('button[aria-label="Open chat"]', { force: true });
    
    // Click on a quick question button
    await page.click('button:has-text("How does spaced repetition work?")', { force: true });
    
    // Verify response
    await expect(page.locator('.bg-purple-500\\/20').first()).toBeVisible({ timeout: 20000 });
  });
});
