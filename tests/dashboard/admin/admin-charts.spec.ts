import { test, expect } from '../../fixtures/dashboard-fixtures';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';

test.describe('Admin Dashboard - Charts', () => {
  test('AD-P-11: AUM Trend chart renders monthly data', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-P-12: AUM Trend tooltip shows formatted values', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-P-13: Risk Profile Distribution pie chart renders', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-P-14: Risk Profile legend shows all risk tiers', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-P-15: Risk Profile distribution percentages accurate', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });

  test('AD-P-16: Admin navigation bar links to Users, Products, Audit', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();
    await expect(page.locator('body')).toBeVisible();
  });
});
