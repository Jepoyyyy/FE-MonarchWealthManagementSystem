import { type Page, expect } from '@playwright/test';

/**
 * Wait for user to be authenticated in UI
 */
export async function waitForAuthentication(page: Page, timeout = 15000) {
  await expect(
    page.getByRole('button', { name: /logout|sign out/i })
      .or(page.locator('text=Overview'))
      .or(page.locator('text=Welcome'))
  ).toBeVisible({ timeout });
}

/**
 * Wait for redirect to login page
 */
export async function waitForLoginRedirect(page: Page, timeout = 5000) {
  await expect(page).toHaveURL(/\/(login)?$/, { timeout });
}

/**
 * Check if localStorage auth is present
 */
export async function getAuthFromStorage(page: Page): Promise<any | null> {
  return page.evaluate(() => {
    const data = window.localStorage.getItem('wms-auth');
    return data ? JSON.parse(data) : null;
  });
}

/**
 * Clear authentication from localStorage
 */
export async function clearAuthStorage(page: Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem('wms-auth');
  });
}

/**
 * Verify user is logged out in UI and storage
 */
export async function verifyLoggedOut(page: Page) {
  const auth = await getAuthFromStorage(page);
  expect(auth).toBeNull();
  await expect(
    page.getByRole('button', { name: /sign in/i })
      .or(page.getByRole('button', { name: /create account/i }))
  ).toBeVisible();
}

/**
 * Navigate to protected route and verify redirect
 */
export async function attemptProtectedAccess(page: Page, route: string) {
  await page.goto(route);
  await waitForLoginRedirect(page);
}

/**
 * Measure login performance
 */
export async function measureLoginPerformance(
  page: Page,
  loginFn: () => Promise<void>
): Promise<number> {
  const startTime = Date.now();
  await loginFn();
  await waitForAuthentication(page);
  return Date.now() - startTime;
}
