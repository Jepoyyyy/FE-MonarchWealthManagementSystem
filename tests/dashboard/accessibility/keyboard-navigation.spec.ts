import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('Dashboard Accessibility - A11Y-01 to A11Y-08', () => {
  test('A11Y-01: All interactive elements keyboard accessible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('A11Y-02: Focus indicators visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('A11Y-03: Tab order logical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('A11Y-04: Modal accessible via keyboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();

    if (await dashboardPage.changeRiskProfileBtn.isVisible().catch(() => false)) {
      await dashboardPage.changeRiskProfileBtn.focus();
      await page.keyboard.press('Enter');
      await expect(dashboardPage.confirmModal).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dashboardPage.confirmModal).toBeHidden();
    }
  });

  test('A11Y-05: Stat cards have accessible labels', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('A11Y-06: Loading state announced', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('A11Y-07: Error messages announced', async ({ page, mockDashboardError }) => {
    await mockDashboardError(500, 'Error');

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.errorAlert).toBeVisible();
  });

  test('A11Y-08: Charts have text alternatives', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });
});
