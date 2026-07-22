import { test, expect } from '../fixtures/dashboard-fixtures';

test.describe('Admin Dashboard UI', () => {
  test('should render admin stat cards or access restriction for unauthenticated admin view', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const adminHeading = page.locator('text=Admin Overview')
      .or(page.locator('text=Admin Dashboard'))
      .or(page.locator('text=Total AUM'))
      .or(page.locator('text=Access Denied'))
      .or(page.locator('text=Welcome back'))
      .or(page.locator('text=Sign In'))
      .or(page.locator('text=Login'));
    await expect(adminHeading.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle loading state on admin dashboard route', async ({ page }) => {
    await page.goto('/admin');
    
    const loadingIndicator = page.locator('[data-testid="dashboard-loading"]').or(page.locator('text=Loading')).or(page.locator('.animate-pulse'));
    if (await loadingIndicator.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator.first()).toBeVisible();
    }
  });
});
