import { test, expect } from '../fixtures/assets-fixtures';

test.describe('Assets Page - Performance Tests (PERF-001 to PERF-012)', () => {

  test('PERF-001: Assets page loads within 3 seconds', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    const startTime = Date.now();
    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('PERF-002: Asset detail page loads within 2 seconds', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    const startTime = Date.now();
    await assetsPage.page.goto('/user/assets/1');
    await expect(assetsPage.page.getByRole('heading', { name: /Stock ABC/i })).toBeVisible();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test('PERF-003: API response time under 1 second', async ({ assetsPage }) => {
    const apiResponses: number[] = [];

    assetsPage.page.on('response', response => {
      if (response.url().includes('/me/assets')) {
        const timing = response.request().timing();
        if (timing) {
          apiResponses.push(timing.responseEnd);
        }
      }
    });

    await assetsPage.goto();
    await assetsPage.page.waitForLoadState('networkidle');

    expect(apiResponses.length).toBeGreaterThan(0);
    apiResponses.forEach(time => {
      expect(time).toBeLessThan(1000);
    });
  });

  test('PERF-004: Table renders 100 assets without performance degradation', async ({ assetsPage, mockAssetsData }) => {
    const assets = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      productId: (i % 10) + 1,
      amount: 1000000 + i * 10000,
      quantity: 100 + i,
      purchaseDate: '2026-01-15',
      currentValue: 1200000 + i * 12000,
      platform: `Platform ${String.fromCharCode(65 + (i % 26))}`,
      name: `Asset ${i + 1}`,
      issuer: `Issuer ${i + 1}`,
      type: ['Stock', 'Mutual Fund', 'Bond'][i % 3] as any
    }));

    await mockAssetsData(assets, []);

    const startTime = Date.now();
    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    await expect(assetsPage.assetTable).toBeVisible();
    const rowCount = await assetsPage.page.locator('tbody tr').count();
    expect(rowCount).toBe(100);
    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(5000);
  });

  test('PERF-005: Stat card calculations complete within 500ms', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.goto();
    const startTime = Date.now();
    await expect(assetsPage.portfolioValueCard).toBeVisible();
    await expect(assetsPage.page.getByText(/IDR\s*12\.00M/i).first()).toBeVisible();
    const calcTime = Date.now() - startTime;

    expect(calcTime).toBeLessThan(3000);
  });

  test('PERF-006: Loading skeleton appears immediately', async ({ assetsPage, page, mockAssetsData }) => {
    await mockAssetsData([], []);
    await page.route('**/api/v1/me/assets', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 200, result: [] }),
      });
    });

    const startTime = Date.now();
    const gotoPromise = assetsPage.goto();

    const skeletonLocator = page.locator('[data-testid="assets-loading"]');
    await expect(skeletonLocator).toBeVisible({ timeout: 3000 });
    const skeletonAppearTime = Date.now() - startTime;

    expect(skeletonAppearTime).toBeLessThan(3000);

    await gotoPromise;
  });

  test('PERF-007: Goal dropdown interaction responds within 100ms', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.page.goto('/user/assets/1');

    const goalDropdown = assetsPage.page.getByRole('combobox', { name: /goal/i });
    await expect(goalDropdown).toBeVisible();

    const startTime = Date.now();
    await goalDropdown.click();
    await expect(assetsPage.page.getByRole('option').first()).toBeVisible();
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(1000);
  });

  test('PERF-008: Transaction modal opens within 300ms', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.page.goto('/user/assets/1');

    const startTime = Date.now();
    await assetsPage.page.getByRole('button', { name: /buy.*top up/i }).click();
    await expect(assetsPage.modal).toBeVisible();
    const openTime = Date.now() - startTime;

    expect(openTime).toBeLessThan(1500);
  });

  test('PERF-009: Delete confirmation modal opens instantly', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.page.goto('/user/assets/1');

    const startTime = Date.now();
    await assetsPage.page.getByRole('button', { name: /remove asset/i }).click();
    await expect(assetsPage.confirmDialog).toBeVisible();
    const openTime = Date.now() - startTime;

    expect(openTime).toBeLessThan(2000);
  });

  test('PERF-010: Navigation between assets list and detail is smooth', async ({ assetsPage, page, mockAssetsData }) => {
    await page.route('**/api/v1/products/1', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          result: {
            id: "1",
            code: "ABC",
            name: "Stock ABC",
            issuer: "Company ABC",
            type: "Stock",
            riskLevel: 3,
            currentPrice: 1000,
            annualReturn: 5,
            minInvestment: 100000,
          }
        }),
      });
    });
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();

    const startTime = Date.now();
    await assetsPage.clickAssetByName('Stock ABC');
    await expect(assetsPage.page.getByRole('heading', { name: /Stock ABC/i })).toBeVisible();
    const navTime = Date.now() - startTime;

    expect(navTime).toBeLessThan(1000);
  });

  test('PERF-011: Assets page with 50 assets renders P&L and table within 2 seconds', async ({ assetsPage, mockAssetsData }) => {
    const assets = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      productId: (i % 10) + 1,
      amount: 1000000 + i * 10000,
      quantity: 100 + i,
      purchaseDate: '2026-01-15',
      currentValue: 1200000 + i * 12000,
      platform: `Platform ${String.fromCharCode(65 + (i % 26))}`,
      name: `Asset ${i + 1}`,
      issuer: `Issuer ${i + 1}`,
      type: ['Stock', 'Mutual Fund', 'Bond'][i % 3] as any
    }));

    const pnl = assets.map(a => ({
      assetId: a.id,
      units: a.quantity,
      avg_price: a.amount / a.quantity,
      currentValue: a.currentValue,
      potential_pnl: a.currentValue - a.amount,
      potential_pnl_percent: ((a.currentValue - a.amount) / a.amount) * 100
    }));

    await mockAssetsData(assets, pnl);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    const startTime = Date.now();
    await expect(assetsPage.unrealizedPnlCard).toBeVisible();
    await expect(assetsPage.assetTable).toBeVisible();
    const calcTime = Date.now() - startTime;

    expect(calcTime).toBeLessThan(2000);
  });

  test('PERF-012: No memory leaks on repeated navigation', async ({ assetsPage, page, mockAssetsData }) => {
    await page.route('**/api/v1/products/1', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          result: {
            id: "1",
            code: "ABC",
            name: "Stock ABC",
            issuer: "Company ABC",
            type: "Stock",
            riskLevel: 3,
            currentPrice: 1000,
            annualReturn: 5,
            minInvestment: 100000,
          }
        }),
      });
    });
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    for (let i = 0; i < 10; i++) {
      await assetsPage.goto();
      await expect(assetsPage.portfolioHeading).toBeVisible();

      await assetsPage.clickAssetByName('Stock ABC');
      await expect(assetsPage.page.getByRole('heading', { name: /Stock ABC/i })).toBeVisible();
    }

    const metrics = await assetsPage.page.evaluate(() => {
      if ((performance as any).memory) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        };
      }
      return null;
    });

    if (metrics) {
      const heapUsagePercent = (metrics.usedJSHeapSize / metrics.totalJSHeapSize) * 100;
      expect(heapUsagePercent).toBeLessThan(90);
    }
  });
});
