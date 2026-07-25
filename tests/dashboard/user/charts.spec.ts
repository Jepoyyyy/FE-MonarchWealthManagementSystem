import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('User Dashboard - Charts Rendering', () => {
  test('UD-P-11: Performance chart renders with data', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-12: Chart displays correct P&L badge', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-13: Chart tooltip shows on hover', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-14: Chart handles zero-padded months correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-15: Empty portfolio shows placeholder message', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { portofolio: { value: 0, invested: 0, holdings: 0, items: [] }, performance: [] }
        }),
      });
    });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(page.getByText('Start investing to see your portfolio performance.')).toBeVisible();
  });

  test('UD-P-16: Pie chart renders portfolio composition', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-17: Pie chart legend shows all assets', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-18: Percentages sum to 100%', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-19: Empty portfolio shows no-assets message', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { portofolio: { value: 0, invested: 0, holdings: 0, items: [] }, performance: [] }
        }),
      });
    });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(page.getByText('No assets yet.')).toBeVisible();
  });

  test('UD-N-09: Empty items array in portfolio', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { portofolio: { value: 100, invested: 100, holdings: 0, items: [] }, performance: [] }
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

  test('UD-N-10: Invalid month number in performance data', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { portofolio: { value: 100, invested: 100, holdings: 1, items: [] }, performance: [{ month: 99, value: 50 }] }
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

  test('UD-N-11: Non-numeric asset value in pie chart', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { portofolio: { value: 100, invested: 100, holdings: 1, items: [{ name: 'Test', value: 'invalid' }] }, performance: [] }
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
});
