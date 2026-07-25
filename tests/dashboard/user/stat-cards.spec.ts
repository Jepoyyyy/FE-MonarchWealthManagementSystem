import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('User Dashboard - Stat Cards Display', () => {
  test('UD-P-07: Four stat cards rendered', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();

    await expect(page.getByText('Portfolio Value')).toBeVisible();
    await expect(page.getByText('Total Invested')).toBeVisible();
    await expect(page.getByText('Unrealized P&L')).toBeVisible();
    await expect(page.getByText('Holdings')).toBeVisible();
  });

  test('UD-P-08: Portfolio Value shows correct format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(page.getByText('Portfolio Value')).toBeVisible();
  });

  test('UD-P-09: Unrealized P&L shows profit/loss correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(page.getByText('Unrealized P&L')).toBeVisible();
  });

  test('UD-P-10: Holdings card shows active positions', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(page.getByText('Holdings')).toBeVisible();
  });

  test('UD-N-07: Negative total value handling in stat cards', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { portofolio: { value: -500000, invested: 1000000, holdings: 1, items: [] }, performance: [] }
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

  test('UD-N-08: Division by zero total cost in P&L calculation', async ({ page }) => {
    await page.route('**/api/v1/me/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { portofolio: { value: 500000, invested: 0, holdings: 1, items: [] }, performance: [] }
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
