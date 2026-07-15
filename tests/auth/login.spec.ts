import { test, expect } from '@playwright/test';

test('login as Budi', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  await page.getByLabel('Email address').fill('budi.santoso@example.com');
  await page.getByLabel('Password').fill('Admin123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Let's see what happens next. Wait for network idle or some element.
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'login-result.png', fullPage: true });
});
