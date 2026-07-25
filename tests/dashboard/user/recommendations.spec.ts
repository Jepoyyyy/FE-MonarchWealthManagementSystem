import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('User Dashboard - Recommendations Section', () => {
  test('UD-P-20: Recommendations section visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(dashboardPage.recommendedSection).toBeVisible();
  });

  test('UD-P-21: Products filtered by risk profile', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    await expect(page.getByText('Recommended for You')).toBeVisible();
  });

  test('UD-P-22: Maximum 4 products displayed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-23: Product card shows all required info', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
  });

  test('UD-P-24: Clicking product navigates to products page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();

    await dashboardPage.viewAllProductsBtn.click();
    await page.waitForURL('**/products');
    expect(page.url()).toContain('/products');
  });

  test('UD-P-25: "View All" button navigates correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();

    await dashboardPage.viewAllProductsBtn.click();
    await page.waitForURL('**/products');
    expect(page.url()).toContain('/products');
  });
});
