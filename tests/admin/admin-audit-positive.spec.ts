import { expect } from '@playwright/test';
import { AdminAuditPage } from '../pages/AdminAuditPage';
import {
  adminAuditTest,
  mockAuditLogsSuccess,
  generateMockAuditLogs,
  generateMockAuditLogsByCategory,
} from '../fixtures/admin-audit-fixtures';

adminAuditTest.describe('Admin Audit - Positive Tests', () => {
  let auditPage: AdminAuditPage;

  adminAuditTest.beforeEach(async ({ page, loginAsAdmin }) => {
    auditPage = new AdminAuditPage(page);
  });

  adminAuditTest('AA-P-01: Admin can access audit page', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-01' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const mockLogs = generateMockAuditLogs(15);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(auditPage.auditTable).toBeVisible();
    await expect(auditPage.searchInput).toBeVisible();
    await expect(auditPage.allCategoryButton).toBeVisible();
  });

  adminAuditTest('AA-P-02: Displays audit logs table with data', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-02' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const mockLogs = generateMockAuditLogs(15);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBe(15);

    const firstLog = await auditPage.getAuditLogByIndex(0);
    expect(firstLog.user).toBeTruthy();
    expect(firstLog.action).toBeTruthy();
    expect(firstLog.category).toBeTruthy();
  });

  adminAuditTest('AA-P-03: Search filters audit logs by query', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-03' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const mockLogs = generateMockAuditLogs(20);
    mockLogs[0].userName = 'John Doe';
    mockLogs[0].action = 'Updated profile settings';
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.search('John');
    await page.waitForLoadState('networkidle');

    const firstLog = await auditPage.getAuditLogByIndex(0);
    expect(firstLog.user).toContain('John');
  });

  adminAuditTest('AA-P-04: Filter by AUTH category', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-04' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const authLogs = generateMockAuditLogsByCategory('AUTH', 10);
    await mockAuditLogsSuccess(page, authLogs);

    await auditPage.goto();

    await auditPage.filterByCategory('AUTH');

    const isActive = await auditPage.isCategoryButtonActive('AUTH');
    expect(isActive).toBe(true);

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(logCount, 5); i++) {
      const log = await auditPage.getAuditLogByIndex(i);
      expect(log.category).toBe('AUTH');
    }
  });

  adminAuditTest('AA-P-05: Filter by GOAL category', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-05' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const goalLogs = generateMockAuditLogsByCategory('GOAL', 10);
    await mockAuditLogsSuccess(page, goalLogs);

    await auditPage.goto();

    await auditPage.filterByCategory('GOAL');

    const isActive = await auditPage.isCategoryButtonActive('GOAL');
    expect(isActive).toBe(true);

    const logCount = await auditPage.getAuditLogCount();
    const firstLog = await auditPage.getAuditLogByIndex(0);
    expect(firstLog.category).toBe('GOAL');
  });

  adminAuditTest('AA-P-06: Filter by USER category', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-06' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const userLogs = generateMockAuditLogsByCategory('USER', 10);
    await mockAuditLogsSuccess(page, userLogs);

    await auditPage.goto();

    await auditPage.filterByCategory('USER');

    const isActive = await auditPage.isCategoryButtonActive('USER');
    expect(isActive).toBe(true);
  });

  adminAuditTest('AA-P-07: Pagination navigates to next page', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-07' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const mockLogs = generateMockAuditLogs(30);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const isPrevDisabled = await auditPage.isPrevPageButtonDisabled();
    expect(isPrevDisabled).toBe(true);

    await auditPage.goToNextPage();

    const pageInfo = await auditPage.getPageInfo();
    expect(pageInfo).toContain('2');
  });

  adminAuditTest('AA-P-08: Pagination navigates to previous page', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-08' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(30);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.goToNextPage();
    await auditPage.goToPrevPage();

    const pageInfo = await auditPage.getPageInfo();
    expect(pageInfo).toContain('1');

    const isPrevDisabled = await auditPage.isPrevPageButtonDisabled();
    expect(isPrevDisabled).toBe(true);
  });

  adminAuditTest('AA-P-09: Detail drawer displays audit log information', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-09' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const mockLogs = generateMockAuditLogs(15);
    mockLogs[0].changedValue = JSON.stringify([
      { field: 'email', oldValue: 'old@example.com', newValue: 'new@example.com' },
      { field: 'name', oldValue: 'Old Name', newValue: 'New Name' },
    ]);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.openDetailByRow(0);

    await expect(auditPage.detailDrawer).toBeVisible();

    const title = await auditPage.getDetailDrawerTitle();
    expect(title).toBeTruthy();
  });

  adminAuditTest('AA-P-10: Detail drawer shows field changes', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-10' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(15);
    mockLogs[0].changedValue = JSON.stringify([
      { field: 'status', oldValue: 'inactive', newValue: 'active' },
    ]);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.openDetailByRow(0);

    await expect(auditPage.fieldChangesSection).toBeVisible();

    await auditPage.closeDetail();

    await expect(auditPage.detailDrawer).not.toBeVisible();
  });

  adminAuditTest('AA-P-11: Clear search resets audit logs', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-11' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(20);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.search('specific query');
    await page.waitForLoadState('networkidle');

    await auditPage.clearSearch();

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBeGreaterThan(0);
  });

  adminAuditTest('AA-P-12: Combined search and filter works correctly', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-12' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(20);
    mockLogs[0].category = 'AUTH';
    mockLogs[0].userName = 'Search User';
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.filterByCategory('AUTH');
    await auditPage.search('Search User');

    const firstLog = await auditPage.getAuditLogByIndex(0);
    expect(firstLog.category).toBe('AUTH');
    expect(firstLog.user).toContain('Search User');
  });

  adminAuditTest('AA-P-13: All categories button shows all logs', async ({ page }) => {
    adminAuditTest.info().annotations.push({ type: 'test_id', description: 'AA-P-13' });
    adminAuditTest.info().annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(20);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.filterByCategory('AUTH');
    await auditPage.filterByCategory('All');

    const isActive = await auditPage.isCategoryButtonActive('All');
    expect(isActive).toBe(true);

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBeGreaterThan(0);
  });
});
