import { expect } from '@playwright/test';
import { AdminAuditPage } from '../pages/AdminAuditPage';
import {
  adminAuditTest,
  mockAuditLogsSuccess,
  generateMockAuditLogs,
} from '../fixtures/admin-audit-fixtures';

adminAuditTest.describe('Admin Audit - Performance Tests', () => {
  let auditPage: AdminAuditPage;

  adminAuditTest.beforeEach(async ({ page, loginAsAdmin }) => {
    auditPage = new AdminAuditPage(page);
  });

  adminAuditTest('AA-PERF-01: Page loads within acceptable time', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-01' });
    testInfo.annotations.push({ type: 'priority', description: 'P0-critical' });

    const mockLogs = generateMockAuditLogs(15);
    await mockAuditLogsSuccess(page, mockLogs);

    const startTime = Date.now();

    await auditPage.goto();
    await expect(auditPage.auditTable).toBeVisible();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
    console.log(`Page load time: ${loadTime}ms`);
  });

  adminAuditTest('AA-PERF-02: Search debounce waits 400ms before triggering request', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-02' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(20);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    let requestCount = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/admin/audit')) {
        requestCount++;
      }
    });

    const initialRequestCount = requestCount;

    await auditPage.searchInput.fill('test');
    await page.waitForTimeout(200);

    const requestsAfter200ms = requestCount;
    expect(requestsAfter200ms).toBe(initialRequestCount);

    await page.waitForTimeout(300);
    await page.waitForLoadState('networkidle');

    const requestsAfter500ms = requestCount;
    expect(requestsAfter500ms).toBeGreaterThan(initialRequestCount);
  });

  adminAuditTest('AA-PERF-03: Handles large dataset (100 items) efficiently', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-03' });
    testInfo.annotations.push({ type: 'priority', description: 'P0-critical' });

    const mockLogs = generateMockAuditLogs(100);
    await mockAuditLogsSuccess(page, mockLogs);

    const startTime = Date.now();

    await auditPage.goto();
    await expect(auditPage.auditTable).toBeVisible();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBe(15);

    console.log(`Large dataset load time: ${loadTime}ms`);
  });

  adminAuditTest('AA-PERF-04: Pagination navigation is responsive', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-04' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(50);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const startTime = Date.now();

    await auditPage.goToNextPage();
    await expect(auditPage.auditTable).toBeVisible();

    const navigationTime = Date.now() - startTime;

    expect(navigationTime).toBeLessThan(2000);

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBeGreaterThan(0);

    console.log(`Pagination navigation time: ${navigationTime}ms`);
  });

  adminAuditTest('AA-PERF-05: Multiple pagination clicks remain responsive', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-05' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(75);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const timings: number[] = [];

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await auditPage.goToNextPage();
      await expect(auditPage.auditTable).toBeVisible();
      const navigationTime = Date.now() - startTime;
      timings.push(navigationTime);
    }

    const averageTime = timings.reduce((a, b) => a + b, 0) / timings.length;

    expect(averageTime).toBeLessThan(2000);

    console.log(`Average pagination time over 3 clicks: ${averageTime.toFixed(2)}ms`);
    console.log(`Individual timings: ${timings.join('ms, ')}ms`);
  });

  adminAuditTest('AA-PERF-06: Category filter switch is instantaneous', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-06' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(30);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const startTime = Date.now();

    await auditPage.filterByCategory('AUTH');
    await expect(auditPage.auditTable).toBeVisible();

    const filterTime = Date.now() - startTime;

    expect(filterTime).toBeLessThan(1500);

    console.log(`Category filter time: ${filterTime}ms`);
  });

  adminAuditTest('AA-PERF-07: Detail drawer opens quickly', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-07' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(15);
    mockLogs[0].changedValue = JSON.stringify([
      { field: 'email', oldValue: 'old@example.com', newValue: 'new@example.com' },
      { field: 'name', oldValue: 'Old Name', newValue: 'New Name' },
      { field: 'status', oldValue: 'inactive', newValue: 'active' },
    ]);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const startTime = Date.now();

    await auditPage.openDetailByRow(0);
    await expect(auditPage.detailDrawer).toBeVisible();

    const drawerOpenTime = Date.now() - startTime;

    expect(drawerOpenTime).toBeLessThan(1000);

    console.log(`Detail drawer open time: ${drawerOpenTime}ms`);
  });

  adminAuditTest('AA-PERF-08: Search with large result set remains performant', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-08' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(200);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const startTime = Date.now();

    await auditPage.search('Test');

    const searchTime = Date.now() - startTime;

    expect(searchTime).toBeLessThan(1000);

    console.log(`Search with large dataset time: ${searchTime}ms`);
  });

  adminAuditTest('AA-PERF-09: Concurrent filter and search operations', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-09' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(50);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const startTime = Date.now();

    await auditPage.filterByCategory('AUTH');
    await auditPage.search('user');
    await expect(auditPage.auditTable).toBeVisible();

    const combinedOperationTime = Date.now() - startTime;

    expect(combinedOperationTime).toBeLessThan(3000);

    console.log(`Combined filter + search time: ${combinedOperationTime}ms`);
  });

  adminAuditTest('AA-PERF-10: API response time is acceptable', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-10' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(15);

    let apiResponseTime = 0;

    await page.route('**/api/v1/admin/audit', async (route) => {
      const requestStartTime = Date.now();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          result: {
            content: mockLogs,
            totalPages: 1,
            totalElements: 15,
            number: 0,
            size: 15,
          },
        }),
      });

      apiResponseTime = Date.now() - requestStartTime;
    });

    await auditPage.goto();

    expect(apiResponseTime).toBeLessThan(500);

    console.log(`API response time: ${apiResponseTime}ms`);
  });

  adminAuditTest('AA-PERF-11: Rapid category switching remains stable', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-11' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(30);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const categories: Array<'AUTH' | 'GOAL' | 'USER' | 'ASSET'> = ['AUTH', 'GOAL', 'USER', 'ASSET'];
    const timings: number[] = [];

    for (const category of categories) {
      const startTime = Date.now();
      await auditPage.filterByCategory(category);
      await expect(auditPage.auditTable).toBeVisible();
      timings.push(Date.now() - startTime);
    }

    const maxTime = Math.max(...timings);
    expect(maxTime).toBeLessThan(2000);

    const averageTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    console.log(`Average category switch time: ${averageTime.toFixed(2)}ms`);
    console.log(`Max category switch time: ${maxTime}ms`);
  });

  adminAuditTest('AA-PERF-12: Table rendering with complex data is efficient', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-PERF-12' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(15);
    mockLogs.forEach((log, index) => {
      log.details = `Complex audit log entry with detailed information about action ${index} including multiple fields and extensive data that needs to be rendered in the table view`;
      log.changedValue = JSON.stringify(
        Array.from({ length: 10 }, (_, i) => ({
          field: `field_${i}`,
          oldValue: `old_value_${i}`,
          newValue: `new_value_${i}`,
        }))
      );
    });
    await mockAuditLogsSuccess(page, mockLogs);

    const startTime = Date.now();

    await auditPage.goto();
    await expect(auditPage.auditTable).toBeVisible();

    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(4000);

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBe(15);

    console.log(`Complex data render time: ${renderTime}ms`);
  });
});
