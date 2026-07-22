import { test, expect } from '@playwright/test';
import { generateTestUser } from '../utils/test-data';
import { AuthApiClient } from '../utils/api-client';

test.describe('UI Login Flow', () => {
  test('should login via UI and redirect to dashboard', async ({ page, request }) => {
    // Setup: Register user via API
    const authApi = new AuthApiClient(request);
    const userData = generateTestUser();
    await authApi.register(userData);

    // Navigate to login page
    await page.goto('/');

    // Measure UI login flow performance
    const startTime = Date.now();

    // Fill login form using placeholder / selector
    const emailInput = page.getByPlaceholder('you@example.com').or(page.locator('input[type="email"]'));
    const passInput = page.getByPlaceholder('Enter your password').or(page.locator('input[type="password"]'));

    await emailInput.fill(userData.email);
    await passInput.fill(userData.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for user to be authenticated in UI (logout/sign out button or overview content)
    await expect(
      page.getByRole('button', { name: /logout|sign out/i }).or(page.locator('text=Overview')).or(page.locator('text=Welcome'))
    ).toBeVisible({ timeout: 15000 });

    const loginDuration = Date.now() - startTime;

    // Performance assertion
    expect(loginDuration).toBeLessThan(10000);
    console.log(`UI login flow completed in ${loginDuration}ms`);
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByPlaceholder('you@example.com').or(page.locator('input[type="email"]'));
    const passInput = page.getByPlaceholder('Enter your password').or(page.locator('input[type="password"]'));

    await emailInput.fill('invalid@example.com');
    await passInput.fill('WrongPassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify error message container appears in form
    await expect(page.locator('form p.text-red-500')).toBeVisible({ timeout: 10000 });
  });
});
