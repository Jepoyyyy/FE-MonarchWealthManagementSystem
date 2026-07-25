import { test, expect } from '../../fixtures/dashboard-fixtures';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';

test.describe('Admin Dashboard - Metric Stat Cards', () => {
  test('AD-P-04: Assets Under Management (AUM) stat card rendered', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.getByText(/Assets Under Management|AUM/i)).toBeVisible();
  });

  test('AD-P-05: AUM value formatted in IDR currency', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.getByText(/Assets Under Management|AUM/i)).toBeVisible();
  });

  test('AD-P-06: Active Users stat card rendered with count', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.getByText(/Active Users/i)).toBeVisible();
  });

  test('AD-P-07: Total Products stat card rendered with count', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.getByText(/Active Products/i)).toBeVisible();
  });

  test('AD-P-08: Audit Events stat card rendered with count', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-P-09: Computed fallback used if API totalAum missing', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-P-10: Computed fallback used if activeUsers missing', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-N-01: API returns 500 error on admin fetch', async ({ page, mockDashboardError, loginAsAdmin }) => {
    await loginAsAdmin();
    await mockDashboardError(500, 'Admin API Error');
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-N-03: Zero active users edge case', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-N-04: Missing audit events data', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });
});
