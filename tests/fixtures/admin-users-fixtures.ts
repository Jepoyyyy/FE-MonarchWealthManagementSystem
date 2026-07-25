import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../auth/pages/login.page';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { adminTest } from '../utils/test-data';

type AdminUsersFixtures = {
  loginAsAdmin: () => Promise<void>;
  adminUsersPage: AdminUsersPage;
  mockUsersListError: (status?: number, message?: string) => Promise<void>;
  mockUserActionError: (status?: number, message?: string) => Promise<void>;
  mockDashboardStatsError: (status?: number, message?: string) => Promise<void>;
  mockUsersListSuccess: (users?: any[], totalPages?: number, totalElements?: number) => Promise<void>;
};

export const test = base.extend<AdminUsersFixtures>({
  loginAsAdmin: async ({ page }, use) => {
    const fn = async () => {
      const loginPage = new LoginPage(page);
      const adminData = adminTest();
      await loginPage.goto();
      await loginPage.login(adminData.email, adminData.password);
      await page.waitForURL(/\/admin|\//);
    };
    await use(fn);
  },

  adminUsersPage: async ({ page }, use) => {
    const adminUsersPage = new AdminUsersPage(page);
    // Set default route handler for GET /api/v1/admin/users*
    await page.route('**/api/v1/admin/users*', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      const url = new URL(route.request().url());
      const statusParam = url.searchParams.get('status');
      const searchParam = url.searchParams.get('search');
      let filtered = generateMockUsers(10);
      if (statusParam) {
        filtered = filtered.filter((u) => u.status.toLowerCase() === statusParam.toLowerCase());
      }
      if (searchParam) {
        const q = searchParam.toLowerCase();
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          result: {
            content: filtered,
            totalPages: Math.ceil(filtered.length / 10) || 1,
            totalElements: filtered.length,
            number: 0,
            size: 10,
          },
        }),
      });
    });

    // Set default route handler for GET /api/v1/admin/dashboard
    await page.route('**/api/v1/admin/dashboard', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          result: {
            user_count: 10,
            active_user_count: 6,
          },
        }),
      });
    });

    await use(adminUsersPage);
  },

  mockUsersListError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Failed to fetch users') => {
      await page.route('**/api/v1/admin/users*', async (route) => {
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

  mockUserActionError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Failed to update user') => {
      await page.route('**/api/v1/admin/users/*', async (route) => {
        if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message,
            }),
          });
        } else {
          await route.continue();
        }
      });
    };
    await use(fn);
  },

  mockDashboardStatsError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Failed to fetch dashboard stats') => {
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

  mockUsersListSuccess: async ({ page }, use) => {
    const fn = async (users = generateMockUsers(10), totalPages = 1, totalElements = 10) => {
      await page.route('**/api/v1/admin/users*', async (route) => {
        if (route.request().method() !== 'GET') {
          return route.continue();
        }
        const url = new URL(route.request().url());
        const statusParam = url.searchParams.get('status');
        const searchParam = url.searchParams.get('search');
        let filtered = users;
        if (statusParam) {
          filtered = filtered.filter((u) => u.status.toLowerCase() === statusParam.toLowerCase());
        }
        if (searchParam) {
          const q = searchParam.toLowerCase();
          filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: {
              content: filtered,
              totalPages,
              totalElements: filtered.length,
              number: 0,
              size: 10,
            },
          }),
        });
      });
    };
    await use(fn);
  },
});

export { expect };

// Mock data generators
export function generateMockUsers(count: number = 10) {
  const users = [];
  const statuses = ['active', 'suspended', 'disabled'];
  const riskProfiles = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'];

  for (let i = 1; i <= count; i++) {
    users.push({
      id: `user-${i}`,
      name: `Test User ${i}`,
      email: `testuser${i}@example.com`,
      role: 'USER',
      status: statuses[i % statuses.length],
      riskProfile: i % 3 === 0 ? null : riskProfiles[i % riskProfiles.length],
      questionnaireCompleted: i % 2 === 0,
      createdAt: new Date(2024, 0, i).toISOString(),
      updatedAt: new Date(2024, 6, i).toISOString(),
    });
  }

  return users;
}

export function generateMockUser(overrides: Partial<any> = {}) {
  return {
    id: `user-${Date.now()}`,
    name: 'Mock User',
    email: 'mockuser@example.com',
    role: 'USER',
    status: 'active',
    riskProfile: 'MODERATE',
    questionnaireCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function generateLargeUserList(count: number = 100) {
  return generateMockUsers(count);
}
