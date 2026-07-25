import { expect } from '@playwright/test';
import { AdminAuditPage } from '../pages/AdminAuditPage';
import {
  adminAuditTest,
  mockAuditLogsSuccess,
  mockAuditLogsEmpty,
  mockAuditLogsError,
  mockAuditLogsNetworkError,
  generateMockAuditLogs,
} from '../fixtures/admin-audit-fixtures';

adminAuditTest.describe('Admin Audit - Negative Tests', () => {
  let auditPage: AdminAuditPage;

  adminAuditTest.beforeEach(async ({ page, loginAsAdmin }) => {
    auditPage = new AdminAuditPage(page);
  });

  adminAuditTest('AA-N-01: Displays empty state when no audit logs exist', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-01' });
    testInfo.annotations.push({ type: 'priority', description: 'P0-critical' });

    await mockAuditLogsEmpty(page);

    await auditPage.goto();

    await expect(auditPage.emptyState).toBeVisible();
    await expect(auditPage.auditTable).not.toBeVisible();

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBe(0);
  });

  adminAuditTest('AA-N-02: Handles 500 server error gracefully', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-02' });
    testInfo.annotations.push({ type: 'priority', description: 'P0-critical' });

    await mockAuditLogsError(page, 500, 'Internal Server Error');

    await auditPage.goto();

    const errorMessage = page.getByText(/error|failed|something went wrong/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  adminAuditTest('AA-N-03: Handles 400 bad request error', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-03' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    await mockAuditLogsError(page, 400, 'Bad Request');

    await auditPage.goto();

    const errorMessage = page.getByText(/error|invalid|bad request/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  adminAuditTest('AA-N-04: Handles 404 not found error', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-04' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    await mockAuditLogsError(page, 404, 'Not Found');

    await auditPage.goto();

    const errorMessage = page.getByText(/not found|error/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  adminAuditTest('AA-N-05: Handles network failure gracefully', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-05' });
    testInfo.annotations.push({ type: 'priority', description: 'P0-critical' });

    await mockAuditLogsNetworkError(page);

    await auditPage.goto();

    const errorMessage = page.getByText(/network|connection|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  adminAuditTest('AA-N-06: Shows empty state when search returns no results', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-06' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(10);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.search('nonexistent query xyz123');

    await expect(auditPage.emptyState).toBeVisible();
    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBe(0);
  });

  adminAuditTest('AA-N-07: Shows empty state when category filter has no results', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-07' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(5);
    mockLogs.forEach(log => log.category = 'AUTH');
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.filterByCategory('FINANCES');

    await expect(auditPage.emptyState).toBeVisible();
  });

  adminAuditTest('AA-N-08: Handles malformed changedValue in detail drawer', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-08' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(5);
    mockLogs[0].changedValue = 'invalid json {{{';
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.openDetailByRow(0);

    await expect(auditPage.detailDrawer).toBeVisible();
  });

  adminAuditTest('AA-N-09: Handles empty changedValue gracefully', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-09' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(5);
    mockLogs[0].changedValue = undefined;
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.openDetailByRow(0);

    await expect(auditPage.detailDrawer).toBeVisible();
  });

  adminAuditTest('AA-N-10: Next page button disabled on last page', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-10' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(15);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const isNextDisabled = await auditPage.isNextPageButtonDisabled();
    expect(isNextDisabled).toBe(true);
  });

  adminAuditTest('AA-N-11: Previous page button disabled on first page', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-11' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    const mockLogs = generateMockAuditLogs(30);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const isPrevDisabled = await auditPage.isPrevPageButtonDisabled();
    expect(isPrevDisabled).toBe(true);
  });

  adminAuditTest('AA-N-12: Search with special characters', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-12' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(10);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.search('<script>alert("xss")</script>');

    await expect(page).not.toHaveURL(/script|alert/);
    await expect(auditPage.searchInput).toHaveValue(/<script>/);
  });

  adminAuditTest('AA-N-13: Search with very long query', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-13' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(10);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const longQuery = 'a'.repeat(500);
    await auditPage.search(longQuery);

    await expect(auditPage.searchInput).toHaveValue(longQuery);
  });

  adminAuditTest('AA-N-14: Handles API timeout gracefully', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-14' });
    testInfo.annotations.push({ type: 'priority', description: 'P1-important' });

    await mockAuditLogsError(page, 408, 'Request Timeout');

    await auditPage.goto();

    const errorMessage = page.getByText(/timeout|error|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  adminAuditTest('AA-N-15: Handles concurrent search requests correctly', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-15' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(20);
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    await auditPage.searchInput.fill('first');
    await page.waitForTimeout(100);
    await auditPage.searchInput.fill('second');
    await page.waitForTimeout(100);
    await auditPage.searchInput.fill('third');

    await page.waitForLoadState('networkidle');

    const inputValue = await auditPage.searchInput.inputValue();
    expect(inputValue).toBe('third');
  });

  adminAuditTest('AA-N-16: Handles missing audit log fields gracefully', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'test_id', description: 'AA-N-16' });
    testInfo.annotations.push({ type: 'priority', description: 'P2-normal' });

    const mockLogs = generateMockAuditLogs(5);
    mockLogs[0].userName = '';
    mockLogs[1].action = '';
    mockLogs[2].details = '';
    await mockAuditLogsSuccess(page, mockLogs);

    await auditPage.goto();

    const logCount = await auditPage.getAuditLogCount();
    expect(logCount).toBe(5);

    await expect(auditPage.auditTable).toBeVisible();
  });
});
