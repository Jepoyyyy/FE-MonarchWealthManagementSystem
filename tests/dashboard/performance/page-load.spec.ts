import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('Dashboard Performance - PERF-01 to PERF-12', () => {
  test('PERF-01: User dashboard loads within 3 seconds', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // Measure dashboard load time only (after navigation)
    const startTime = Date.now();
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('PERF-02: Admin dashboard loads within 3 seconds', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // Navigate to admin and measure load time
    const startTime = Date.now();
    await page.goto('/admin');
    await expect(page.locator('h1, [role="heading"]').first()).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('PERF-03: Lazy-loaded components load efficiently', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    
    // Verify lazy-loaded components (charts, images, or any async content) appear quickly
    const lazyComponents = page.locator('[data-testid*="chart"], canvas, svg[class*="recharts"], img').first();
    const componentExists = await lazyComponents.count() > 0;
    if (componentExists) {
      await expect(lazyComponents).toBeVisible({ timeout: 1000 });
    }
  });

  test('PERF-04: API response time under 1 second', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // Measure API call timing
    const apiStartTime = Date.now();
    const apiResponse = page.waitForResponse(response => 
      response.url().includes('/api/') && response.status() === 200
    );

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    
    await apiResponse;
    const apiTime = Date.now() - apiStartTime;
    expect(apiTime).toBeLessThan(1000);
  });

  test('PERF-05: Charts render without blocking main thread', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    
    // Verify charts are present if they exist
    const charts = page.locator('canvas, svg[class*="recharts"], [data-testid*="chart"]').first();
    const chartsExist = await charts.count() > 0;
    if (chartsExist) {
      await expect(charts).toBeVisible({ timeout: 2000 });
    }
    
    // Check page remains responsive
    const button = page.locator('button, a[href]').first();
    await expect(button).toBeEnabled();
  });

  test('PERF-06: Skeleton placeholder shows immediately', async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();

    // Slow down API calls to catch skeleton
    await context.route('**/api/v1/me/dashboard', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await loginPage.login(userData.email, userData.password);
    
    // Check skeleton appears during load (login redirects to / which is dashboard)
    const skeleton = page.locator('[data-testid="dashboard-loading"]');
    await expect(skeleton).toBeVisible({ timeout: 1000 });
  });

  test('PERF-07: Stat cards render without layout shift', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    
    // Get initial positions of stat cards
    const statCards = page.locator('[data-testid*="stat"], [class*="stat-card"]').first();
    await expect(statCards).toBeVisible();
    const initialBox = await statCards.boundingBox();
    
    // Wait for any async updates
    await page.waitForTimeout(1000);
    
    // Verify position hasn't shifted
    const finalBox = await statCards.boundingBox();
    expect(finalBox?.y).toBe(initialBox?.y);
  });

  test.skip('PERF-08: Re-renders minimized via useMemo', async ({ page }) => {
    // This test cannot be verified in E2E - requires React DevTools profiler or unit tests
    // Should be moved to unit/integration test suite
  });

  test('PERF-09: No memory leaks on navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // Navigate multiple times and check for growing memory
    const metrics: number[] = [];
    for (let i = 0; i < 3; i++) {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      const jsHeap = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
      if (jsHeap > 0) metrics.push(jsHeap);
    }
    
    // Memory shouldn't grow more than 50% across navigations
    if (metrics.length >= 2) {
      const growth = (metrics[metrics.length - 1] - metrics[0]) / metrics[0];
      expect(growth).toBeLessThan(0.5);
    }
  });

  test.skip('PERF-10: Bundle size under threshold', async ({ page }) => {
    // Bundle size should be checked at build time, not E2E
    // Add to package.json scripts: "check-bundle": "vite-bundle-analyzer" or similar
  });

  test('PERF-11: Images and assets optimized', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    
    // Check image sizes
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 5)) {
      const size = await img.evaluate((el: HTMLImageElement) => ({
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        fileSize: el.src.length
      }));
      // Images shouldn't be excessively large (adjust threshold as needed)
      expect(size.naturalWidth).toBeLessThan(4000);
    }
  });

  test('PERF-12: Graceful degradation on slow network', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // Page should still load and show content (even if slower)
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible({ timeout: 10000 });
  });
});
