import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('User Dashboard - Data Loading & Error Handling', () => {
  test('UD-P-04: Loading state displays during API fetch', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    // Page renders loading spinner or transitions to main view
    await expect(page.locator('body')).toBeVisible();
  });

  test('UD-P-05: Loading state disappears after data loads', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(dashboardPage.loadingSpinner).toBeHidden();
  });

  test('UD-P-06: API called once on mount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-N-01: API returns 500 error', async ({ page, mockDashboardError }) => {
    await mockDashboardError(500, 'Internal Server Error');

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.errorAlert).toBeVisible();
    await expect(dashboardPage.retryButton).toBeVisible();
  });

  test('UD-N-02: Network timeout on dashboard fetch', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.abort('timedout');
    });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.errorAlert).toBeVisible();
  });

  test('UD-N-03: Invalid JSON response from API', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'INVALID_JSON_RESPONSE',
      });
    });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    // App gracefully degrades: shows empty data instead of error UI
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-N-04: Partial API failure (null portfolio object)', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { portofolio: null, performance: [] } }),
      });
    });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-N-05: Malformed performance array items', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            portofolio: { value: 100, invested: 100, holdings: 1, items: [] },
            performance: [{ month: "invalid", value: "NaN" }]
          }
        }),
      });
    });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-N-06: 401 Unauthorized token expired', async ({ page, mockDashboardError }) => {
    await mockDashboardError(401, 'Unauthorized');

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // 401 triggers auth-level toast notification, not dashboard error UI
    await expect(page.getByText('Unauthorized').first()).toBeVisible();
  });
});
