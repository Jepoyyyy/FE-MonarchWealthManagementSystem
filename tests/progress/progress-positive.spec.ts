import { test, expect } from '../fixtures/progress-fixtures';

test.describe('Progress Page - Positive Tests', () => {
  test('should display page header and subtitle correctly', async ({ progressPage }) => {
    await expect(progressPage.pageHeading).toBeVisible();
    await expect(progressPage.pageHeading).toHaveText(/portfolio progress/i);
    await expect(progressPage.pageSubtitle).toBeVisible();
  });

  test('should display all four stat cards', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(3);
    const assets = createTestAssets(3);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await expect(progressPage.portfolioValueCard).toBeVisible();
    await expect(progressPage.totalReturnCard).toBeVisible();
    await expect(progressPage.avgMonthlyIncomeCard).toBeVisible();
    await expect(progressPage.portfolioAgeCard).toBeVisible();
  });

  test('should calculate and display portfolio value correctly', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2);
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const portfolioValue = await progressPage.getStatCardValue('portfolio value');
    expect(portfolioValue).toBeTruthy();
    expect(portfolioValue).not.toBe('—');
  });

  test('should display total return with percentage', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2);
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const totalReturn = await progressPage.getStatCardValue('total return');
    expect(totalReturn).toMatch(/%/);
  });

  test('should render performance status banner with correct status', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(3);
    const assets = createTestAssets(3);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const isBannerVisible = await progressPage.isPerformanceBannerVisible();
    expect(isBannerVisible).toBe(true);

    const status = await progressPage.getPerformanceStatus();
    expect(status.label).toMatch(/(needs attention|on the way|performing well)/i);
    expect(status.percentage).toMatch(/\d+%/);
  });

  test('should display "Performing well" status when growth exceeds targets', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      avg_monthly_growth: p.monthly_contribution * 1.5, // 150% coverage
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const status = await progressPage.getPerformanceStatus();
    expect(status.label).toMatch(/performing well/i);
  });

  test('should display "On the way" status for 70-100% coverage', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      avg_monthly_growth: p.monthly_contribution * 0.85, // 85% coverage
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const status = await progressPage.getPerformanceStatus();
    expect(status.label).toMatch(/on the way/i);
  });

  test('should display "Needs attention" status for low coverage', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      avg_monthly_growth: p.monthly_contribution * 0.5, // 50% coverage
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const status = await progressPage.getPerformanceStatus();
    expect(status.label).toMatch(/needs attention/i);
  });

  test('should render goal projection chart', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(3);
    const assets = createTestAssets(3);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await progressPage.waitForChartToRender();
    const isChartVisible = await progressPage.isChartVisible();
    expect(isChartVisible).toBe(true);
  });

  test('should display goal timeline table with correct headers', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(3);
    const assets = createTestAssets(3);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const isTableVisible = await progressPage.isGoalTimelineVisible();
    expect(isTableVisible).toBe(true);

    const hasCorrectHeaders = await progressPage.verifyTableHeaders([
      'Goal', 'Target', 'Remaining', 'ETA', 'Status'
    ]);
    expect(hasCorrectHeaders).toBe(true);
  });

  test('should display correct number of goal rows in timeline', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const goalCount = 5;
    const progress = createTestProgress(goalCount);
    const assets = createTestAssets(goalCount);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const rowCount = await progressPage.getGoalTimelineRowCount();
    expect(rowCount).toBe(goalCount);
  });

  test('should display priority badge for priority goals', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(3);
    progress[0].is_priority = true;

    const assets = createTestAssets(3);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await expect(progressPage.priorityBadge.first()).toBeVisible();
  });

  test('should display position breakdown section', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(3);
    const assets = createTestAssets(3);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const isBreakdownVisible = await progressPage.isPositionBreakdownVisible();
    expect(isBreakdownVisible).toBe(true);
  });

  test('should display correct number of positions in breakdown', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const positionCount = 4;
    const progress = createTestProgress(positionCount);
    const assets = createTestAssets(positionCount);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const count = await progressPage.getPositionCount();
    expect(count).toBe(positionCount);
  });

  test('should show loading skeleton initially', async ({ page, accessToken }) => {
    await setAuthInPage(page, accessToken);
    const progressPage = new ProgressPage(page);

    const loadingPromise = progressPage.goto();

    await expect(progressPage.loadingSkeleton).toBeVisible();

    await loadingPromise;
  });
});

import { setAuthInPage } from '../utils/test-data';
import { ProgressPage } from '../pages/ProgressPage';
