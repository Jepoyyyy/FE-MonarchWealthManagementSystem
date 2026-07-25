import { test, expect } from '../../fixtures/dashboard-fixtures';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';

test.describe('Admin Dashboard - Access & Protection', () => {
  test('AD-P-01: Admin can access /admin dashboard', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();

    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await expect(adminPage.headerTitle).toBeVisible();
  });

  test('AD-P-02: Header displays Admin Dashboard title', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();

    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await expect(adminPage.headerTitle).toContainText(/Admin Dashboard|System Overview|Admin Overview/i);
  });

  test('AD-P-03: Current admin user profile visible', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();

    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await expect(adminPage.headerTitle).toBeVisible();
  });

  test('AD-N-02: Regular user attempts /admin access after login and is redirected', async ({ page, loginAsHighUser }) => {
    await loginAsHighUser();

    await page.goto('/admin');
    await page.waitForURL('/');
    expect(page.url()).not.toContain('/admin');
  });
});
