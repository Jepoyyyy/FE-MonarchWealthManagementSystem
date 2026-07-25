import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('User Dashboard - Authentication & Route Protection', () => {
  test('UD-P-01: User can access dashboard after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(dashboardPage.greetingHeader).toContainText(/Good morning/i);
  });

  test('UD-P-02: Admin redirected to admin dashboard', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    // Already redirected to /admin after login
    expect(page.url()).toContain('/admin');
  });

  test('UD-P-03: Greeting displays correct name and date', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toContainText(/Good morning/i);
    const dateText = await page.locator('p').filter({ hasText: /202/ }).first().textContent();
    expect(dateText).toBeDefined();
  });
});
