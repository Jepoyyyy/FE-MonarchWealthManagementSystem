import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../auth/pages/login.page';
import { highTestUser, adminTest } from '../utils/test-data';

type DashboardFixtures = {
  loginAsHighUser: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  mockDashboardError: (status?: number, message?: string) => Promise<void>;
};

export const test = base.extend<DashboardFixtures>({
  loginAsAdmin: async ({ page }, use) => {
    const fn = async () => {
      const loginPage = new LoginPage(page);
      const adminData = adminTest();
      await loginPage.goto();
      await loginPage.login(adminData.email, adminData.password);
    };
    await use(fn);
  },

  loginAsHighUser: async ({ page }, use) => {
    const fn = async () => {
      const loginPage = new LoginPage(page);
      const userData = highTestUser();
      await loginPage.goto();
      await loginPage.login(userData.email, userData.password);
    };
    await use(fn);
  },

  mockDashboardError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Internal Server Error') => {
      await page.route('**/api/v1/me/dashboard', async (route) => {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message,
          }),
        });
      });
      await page.route('**/api/v1/admin/dashboard', async (route) => {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message,
          }),
        });
      });
    };
    await use(fn);
  },
});

export { expect };
