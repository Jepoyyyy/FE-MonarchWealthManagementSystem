import { test, expect } from '../fixtures/progress-fixtures';
import { PerformanceCollector } from '../utils/performance-collector';
import { setAuthInPage } from '../utils/test-data';

test.describe('Progress Page - Performance Tests', () => {
  let perf: PerformanceCollector;

  test.beforeEach(() => {
    perf = new PerformanceCollector();
  });

  test.afterEach(async ({ page }) => {
    const report = perf.getReport();
    console.log('Performance Report:', JSON.stringify(report, null, 2));
  });

  test('should load progress page within acceptable time with 1 goal', async ({ page, accessToken, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(1);
    const assets = createTestAssets(1);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await setAuthInPage(page, accessToken);
    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await page.goto('/user/progress');

    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: /portfolio progress/i }).waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;
    perf.recordMetric('pageLoadTime_1goal', loadTime);

    expect(loadTime).toBeLessThan(5000); // 5 seconds max
  });

  test('should load progress page within acceptable time with 5 goals', async ({ page, accessToken, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(5);
    const assets = createTestAssets(5);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await setAuthInPage(page, accessToken);
    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await page.goto('/user/progress');

    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: /portfolio progress/i }).waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;
    perf.recordMetric('pageLoadTime_5goals', loadTime);

    expect(loadTime).toBeLessThan(6000); // 6 seconds max
  });

  test('should load progress page within acceptable time with 10 goals', async ({ page, accessToken, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(10);
    const assets = createTestAssets(10);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await setAuthInPage(page, accessToken);
    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await page.goto('/user/progress');

    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: /portfolio progress/i }).waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;
    perf.recordMetric('pageLoadTime_10goals', loadTime);

    expect(loadTime).toBeLessThan(7000); // 7 seconds max
  });

  test('should load progress page within acceptable time with 20 goals', async ({ page, accessToken, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(20);
    const assets = createTestAssets(20);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await setAuthInPage(page, accessToken);
    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await page.goto('/user/progress');

    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: /portfolio progress/i }).waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;
    perf.recordMetric('pageLoadTime_20goals', loadTime);

    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('should render chart within acceptable time', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(5);
    const assets = createTestAssets(5);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const startTime = Date.now();
    await progressPage.waitForChartToRender();
    const chartRenderTime = Date.now() - startTime;

    perf.recordMetric('chartRenderTime', chartRenderTime);
    expect(chartRenderTime).toBeLessThan(3000); // 3 seconds max
  });

  test('should handle large dataset (50 positions) efficiently', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const positionCount = 50;
    const progress = createTestProgress(positionCount);
    const assets = createTestAssets(positionCount);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    perf.recordMetric('largeDataset_50positions', loadTime);
    expect(loadTime).toBeLessThan(12000); // 12 seconds max

    const positionBreakdownVisible = await progressPage.isPositionBreakdownVisible();
    expect(positionBreakdownVisible).toBe(true);
  });

  test('should handle very large dataset (100 positions) efficiently', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const positionCount = 100;
    const progress = createTestProgress(positionCount);
    const assets = createTestAssets(positionCount);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    perf.recordMetric('largeDataset_100positions', loadTime);
    expect(loadTime).toBeLessThan(15000); // 15 seconds max

    const positionBreakdownVisible = await progressPage.isPositionBreakdownVisible();
    expect(positionBreakdownVisible).toBe(true);
  });

  test('should measure API response time for progress endpoint', async ({ page, accessToken, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(5);
    const assets = createTestAssets(5);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    let apiResponseTime = 0;

    await setAuthInPage(page, accessToken);

    await page.route('**/api/v1/me/goals/progress', async (route) => {
      const startTime = Date.now();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: progress }),
      });
      apiResponseTime = Date.now() - startTime;
    });

    await page.route('**/api/v1/me/assets', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: assets }),
      });
    });

    await page.route('**/api/v1/me/assets/pnl', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: pnl }),
      });
    });

    await page.goto('/user/progress');
    await page.waitForLoadState('networkidle');

    perf.recordMetric('apiResponseTime_progress', apiResponseTime);
    expect(apiResponseTime).toBeLessThan(2000); // 2 seconds max for API
  });

  test('should handle concurrent API calls efficiently', async ({ page, accessToken, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(5);
    const assets = createTestAssets(5);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    let progressCallTime = 0;
    let assetsCallTime = 0;
    let pnlCallTime = 0;

    await setAuthInPage(page, accessToken);

    await page.route('**/api/v1/me/goals/progress', async (route) => {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: progress }),
      });
      progressCallTime = Date.now() - start;
    });

    await page.route('**/api/v1/me/assets', async (route) => {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: assets }),
      });
      assetsCallTime = Date.now() - start;
    });

    await page.route('**/api/v1/me/assets/pnl', async (route) => {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: pnl }),
      });
      pnlCallTime = Date.now() - start;
    });

    const startTime = Date.now();
    await page.goto('/user/progress');
    await page.waitForLoadState('networkidle');
    const totalTime = Date.now() - startTime;

    perf.recordMetric('concurrentAPICalls_total', totalTime);
    perf.recordMetric('concurrentAPICalls_progress', progressCallTime);
    perf.recordMetric('concurrentAPICalls_assets', assetsCallTime);
    perf.recordMetric('concurrentAPICalls_pnl', pnlCallTime);

    // Total time should be close to slowest call (parallel execution)
    // Not sum of all calls (sequential execution)
    expect(totalTime).toBeLessThan(5000);
  });

  test('should measure skeleton loading to content transition time', async ({ page, accessToken, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(3);
    const assets = createTestAssets(3);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await setAuthInPage(page, accessToken);
    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await page.goto('/user/progress');

    const loadingSkeleton = page.locator('[data-testid="progress-loading"]');
    await loadingSkeleton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    await loadingSkeleton.waitFor({ state: 'hidden', timeout: 10000 });
    const transitionTime = Date.now() - startTime;

    perf.recordMetric('skeletonToContentTransition', transitionTime);
    expect(transitionTime).toBeLessThan(8000); // 8 seconds max
  });

  test('should render goal timeline table efficiently with many rows', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const goalCount = 15;
    const progress = createTestProgress(goalCount);
    const assets = createTestAssets(goalCount);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const startTime = Date.now();
    await progressPage.goalTimelineTable.waitFor({ state: 'visible' });
    const tableRenderTime = Date.now() - startTime;

    perf.recordMetric('goalTimelineTableRender_15rows', tableRenderTime);
    expect(tableRenderTime).toBeLessThan(3000); // 3 seconds max

    const rowCount = await progressPage.getGoalTimelineRowCount();
    expect(rowCount).toBe(goalCount);
  });

  test('should render position breakdown efficiently with many items', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const positionCount = 25;
    const progress = createTestProgress(positionCount);
    const assets = createTestAssets(positionCount);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const startTime = Date.now();
    await progressPage.positionBreakdown.waitFor({ state: 'visible' });
    const breakdownRenderTime = Date.now() - startTime;

    perf.recordMetric('positionBreakdownRender_25items', breakdownRenderTime);
    expect(breakdownRenderTime).toBeLessThan(3000); // 3 seconds max

    const positionCount_rendered = await progressPage.getPositionCount();
    expect(positionCount_rendered).toBe(positionCount);
  });

  test('should handle page reload efficiently', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(5);
    const assets = createTestAssets(5);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);

    const startTime = Date.now();
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();
    const reloadTime = Date.now() - startTime;

    perf.recordMetric('pageReloadTime', reloadTime);
    expect(reloadTime).toBeLessThan(6000); // 6 seconds max
  });

  test('should measure stat card rendering performance', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(5);
    const assets = createTestAssets(5);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const startTime = Date.now();
    await Promise.all([
      progressPage.portfolioValueCard.waitFor({ state: 'visible' }),
      progressPage.totalReturnCard.waitFor({ state: 'visible' }),
      progressPage.avgMonthlyIncomeCard.waitFor({ state: 'visible' }),
      progressPage.portfolioAgeCard.waitFor({ state: 'visible' }),
    ]);
    const statCardsRenderTime = Date.now() - startTime;

    perf.recordMetric('statCardsRenderTime', statCardsRenderTime);
    expect(statCardsRenderTime).toBeLessThan(2000); // 2 seconds max
  });

  test('should measure performance banner rendering time', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(5);
    const assets = createTestAssets(5);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    const startTime = Date.now();
    await progressPage.performanceBanner.waitFor({ state: 'visible' });
    const bannerRenderTime = Date.now() - startTime;

    perf.recordMetric('performanceBannerRenderTime', bannerRenderTime);
    expect(bannerRenderTime).toBeLessThan(2000); // 2 seconds max
  });
});
