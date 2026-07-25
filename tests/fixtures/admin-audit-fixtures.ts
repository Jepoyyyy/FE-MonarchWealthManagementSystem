import { type Page, test, expect } from '@playwright/test';
import { LoginPage } from '../auth/pages/login.page';
import { adminTest } from '../utils/test-data';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'AUTH' | 'GOAL' | 'ASSET' | 'PRODUCT' | 'USER' | 'RISK_PROFILE' | 'FINANCES';
  changedValue?: string;
}

export interface FieldChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export function generateMockAuditLogs(count: number = 15): AuditLog[] {
  const categories: AuditLog['category'][] = ['AUTH', 'GOAL', 'ASSET', 'PRODUCT', 'USER', 'RISK_PROFILE', 'FINANCES'];
  const actions = [
    'Created new goal',
    'Updated user profile',
    'Deleted asset',
    'Modified product',
    'Changed risk profile',
    'Updated financial data',
    'User login',
    'User logout',
    'Password changed',
    'Email verified',
  ];

  const logs: AuditLog[] = [];

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const action = actions[i % actions.length];
    const hasChangedValue = i % 3 === 0;

    const log: AuditLog = {
      id: `audit-${1000 + i}`,
      userId: `user-${100 + (i % 5)}`,
      userName: `Test User ${(i % 5) + 1}`,
      action,
      details: `${action} at ${new Date(Date.now() - i * 3600000).toISOString()}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      category,
    };

    if (hasChangedValue) {
      const changes: FieldChange[] = [
        { field: 'name', oldValue: 'Old Name', newValue: 'New Name' },
        { field: 'email', oldValue: 'old@example.com', newValue: 'new@example.com' },
        { field: 'status', oldValue: 'inactive', newValue: 'active' },
      ];
      log.changedValue = JSON.stringify(changes.slice(0, (i % 3) + 1));
    }

    logs.push(log);
  }

  return logs;
}

export function generateMockAuditLogsByCategory(category: AuditLog['category'], count: number = 10): AuditLog[] {
  const allLogs = generateMockAuditLogs(count);
  return allLogs.map(log => ({ ...log, category }));
}

export async function mockAuditLogsSuccess(page: Page, logs?: AuditLog[], totalPages: number = 1) {
  const mockLogs = logs || generateMockAuditLogs(15);

  await page.route('**/api/v1/admin/audit*', async (route) => {
    if (route.request().url().includes('/search')) return route.continue();
    const url = new URL(route.request().url());
    const pageParam = url.searchParams.get('page') || '0';
    const sizeParam = url.searchParams.get('size') || '15';
    const categoryParam = url.searchParams.get('category');
    const searchParam = url.searchParams.get('search');

    let filteredLogs = [...mockLogs];

    if (categoryParam && categoryParam !== 'All') {
      filteredLogs = filteredLogs.filter(log => log.category === categoryParam);
    }

    if (searchParam) {
      const search = searchParam.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.userName.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.details.toLowerCase().includes(search)
      );
    }

    const page = parseInt(pageParam, 10);
    const size = parseInt(sizeParam, 10);
    const start = page * size;
    const end = start + size;
    const paginatedLogs = filteredLogs.slice(start, end);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        result: {
          content: paginatedLogs,
          totalPages: Math.ceil(filteredLogs.length / size),
          totalElements: filteredLogs.length,
          number: page,
          size: size,
        },
      }),
    });
  });

  await page.route('**/api/v1/admin/audit/search*', async (route) => {
    const url = new URL(route.request().url());
    const searchParam = url.searchParams.get('search') || '';
    const categoryParam = url.searchParams.get('category');
    const pageParam = url.searchParams.get('page') || '0';
    const sizeParam = url.searchParams.get('size') || '15';

    let filteredLogs = [...mockLogs];

    if (categoryParam && categoryParam !== 'All') {
      filteredLogs = filteredLogs.filter(log => log.category === categoryParam);
    }

    if (searchParam) {
      const search = searchParam.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.userName.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.details.toLowerCase().includes(search)
      );
    }

    const page = parseInt(pageParam, 10);
    const size = parseInt(sizeParam, 10);
    const start = page * size;
    const end = start + size;
    const paginatedLogs = filteredLogs.slice(start, end);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        result: {
          content: paginatedLogs,
          totalPages: Math.ceil(filteredLogs.length / size),
          totalElements: filteredLogs.length,
          number: page,
          size: size,
        },
      }),
    });
  });
}

export async function mockAuditLogsEmpty(page: Page) {
  await page.route('**/api/v1/admin/audit*', async (route) => {
    if (route.request().url().includes('/search')) return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        result: {
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: 15,
        },
      }),
    });
  });

  await page.route('**/api/v1/admin/audit/search*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        result: {
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: 15,
        },
      }),
    });
  });
}

export async function mockAuditLogsError(page: Page, statusCode: number = 500, message: string = 'Internal Server Error') {
  await page.route('**/api/v1/admin/audit*', async (route) => {
    if (route.request().url().includes('/search')) return route.continue();
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        code: statusCode,
        message: message,
      }),
    });
  });

  await page.route('**/api/v1/admin/audit/search*', async (route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        code: statusCode,
        message: message,
      }),
    });
  });
}

export async function mockAuditLogsNetworkError(page: Page) {
  await page.route('**/api/v1/admin/audit*', async (route) => {
    if (route.request().url().includes('/search')) return route.continue();
    await route.abort('failed');
  });

  await page.route('**/api/v1/admin/audit/search*', async (route) => {
    await route.abort('failed');
  });
}

export async function loginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page);
  const adminCredentials = adminTest();

  await loginPage.goto();
  await loginPage.login(adminCredentials.email, adminCredentials.password);
  await page.waitForURL(/\/admin|\//);

  const authData = await page.evaluate(() => {
    return localStorage.getItem('wms-auth');
  });

  expect(authData).toBeTruthy();
}

export const adminAuditTest = test.extend<{ loginAsAdmin: void }>({
  loginAsAdmin: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use();
  },
});
