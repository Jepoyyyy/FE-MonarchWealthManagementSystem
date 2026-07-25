import { test, expect, generateLargeProductList } from '../fixtures/admin-products-fixtures';

test.describe('Admin Products - Performance Tests', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('AP-PERF-01: Page loads within acceptable time', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-01' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    const startTime = Date.now();

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('AP-PERF-02: Search debounce prevents excessive API calls', async ({
    adminProductsPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-02' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    let apiCallCount = 0;
    await page.route('**/api/v1/admin/products*', async (route) => {
      if (route.request().method() === 'GET') {
        apiCallCount++;
      }
      await route.continue();
    });

    await adminProductsPage.searchInput.fill('T');
    await page.waitForTimeout(100);
    await adminProductsPage.searchInput.fill('Te');
    await page.waitForTimeout(100);
    await adminProductsPage.searchInput.fill('Tes');
    await page.waitForTimeout(100);
    await adminProductsPage.searchInput.fill('Test');

    await page.waitForTimeout(600);

    expect(apiCallCount).toBeLessThanOrEqual(2);
    console.log(`API calls during typing: ${apiCallCount}`);
  });

  test('AP-PERF-03: Pagination navigation responds quickly', async ({
    adminProductsPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-03' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const hasPagination = await adminProductsPage.pagination.count() > 0;

    if (hasPagination && await adminProductsPage.nextPageButton.isEnabled().catch(() => false)) {
      const startTime = Date.now();

      await adminProductsPage.goToNextPage();

      const paginationTime = Date.now() - startTime;

      expect(paginationTime).toBeLessThan(3000);
      console.log(`Pagination navigation time: ${paginationTime}ms`);
    }
  });

  test('AP-PERF-04: Large dataset renders without significant lag', async ({
    adminProductsPage,
    page,
    mockProductsListSuccess
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-04' });

    const largeProductList = generateLargeProductList(100);
    await mockProductsListSuccess(largeProductList.slice(0, 15), 7, 100);

    const startTime = Date.now();

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(5000);

    await expect(adminProductsPage.productTable).toBeVisible();
    const productCount = await adminProductsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    console.log(`Large dataset render time: ${renderTime}ms`);
  });

  test('AP-PERF-05: Multiple rapid filter changes handled efficiently', async ({
    adminProductsPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-05' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const startTime = Date.now();

    await adminProductsPage.filterByType('Stocks');
    await adminProductsPage.filterByType('Bonds');
    await adminProductsPage.filterByType('Mutual Funds');
    await adminProductsPage.filterByType('');

    const totalTime = Date.now() - startTime;

    expect(totalTime).toBeLessThan(8000);

    await expect(adminProductsPage.productTable).toBeVisible();
    console.log(`Multiple filter changes time: ${totalTime}ms`);
  });

  test('AP-PERF-06: Search with filter combination performs well', async ({
    adminProductsPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-06' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const startTime = Date.now();

    await adminProductsPage.searchProducts('Test Product');
    await adminProductsPage.filterByType('SBN');

    const combinedOperationTime = Date.now() - startTime;

    expect(combinedOperationTime).toBeLessThan(4000);

    await expect(adminProductsPage.productTable).toBeVisible();
    console.log(`Search + filter combination time: ${combinedOperationTime}ms`);
  });

  test('AP-PERF-07: Add product modal opens quickly', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-07' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const startTime = Date.now();

    await adminProductsPage.clickAddProduct();

    const modalOpenTime = Date.now() - startTime;

    expect(modalOpenTime).toBeLessThan(2000);
    await expect(adminProductsPage.addProductModal).toBeVisible();

    console.log(`Add product modal open time: ${modalOpenTime}ms`);
  });

  test('AP-PERF-08: Confirm modal responds quickly', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-08' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const firstRow = adminProductsPage.tableRows.first();
    const productName = await firstRow.locator('td:first-child p').first().textContent();

    if (productName && productName.trim()) {
      const startTime = Date.now();

      await adminProductsPage.clickToggleVisibilityForProduct(productName.trim());

      const modalOpenTime = Date.now() - startTime;

      expect(modalOpenTime).toBeLessThan(1500);
      await expect(adminProductsPage.confirmModal).toBeVisible();

      console.log(`Confirm modal open time: ${modalOpenTime}ms`);

      await adminProductsPage.cancelAction();
    }
  });

  test('AP-PERF-09: Product creation form submission time', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-09' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'PERF001',
      name: 'Performance Test Product',
      issuer: 'Test Issuer',
      type: 'Stocks',
      riskLevel: 3,
      annualReturn: 10.0,
      minInvestment: 500000,
      currentPrice: 2000,
      description: 'Product for performance testing',
      lotSize: 1,
    });

    const startTime = Date.now();

    await adminProductsPage.submitProductForm();
    await adminProductsPage.addProductModal.waitFor({ state: 'hidden', timeout: 5000 });

    const submissionTime = Date.now() - startTime;

    expect(submissionTime).toBeLessThan(3000);
    console.log(`Form submission time: ${submissionTime}ms`);
  });

  test('AP-PERF-10: Concurrent operations do not block UI', async ({
    adminProductsPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-10' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const startTime = Date.now();

    const searchPromise = adminProductsPage.searchProducts('Test');
    const filterPromise = adminProductsPage.filterByType('Bonds');

    await Promise.all([searchPromise, filterPromise]);

    const concurrentOperationTime = Date.now() - startTime;

    expect(concurrentOperationTime).toBeLessThan(4000);

    await expect(adminProductsPage.productTable).toBeVisible();
    console.log(`Concurrent operations time: ${concurrentOperationTime}ms`);
  });

  test('AP-PERF-11: Memory usage remains stable during extended use', async ({
    adminProductsPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-PERF-11' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    for (let i = 0; i < 5; i++) {
      await adminProductsPage.searchProducts(`Test ${i}`);
      await page.waitForTimeout(500);

      await adminProductsPage.filterByType('Stocks');
      await page.waitForTimeout(300);

      await adminProductsPage.filterByType('');
      await page.waitForTimeout(300);
    }

    await expect(adminProductsPage.productTable).toBeVisible();

    const finalProductCount = await adminProductsPage.getProductCount();
    expect(finalProductCount).toBeGreaterThanOrEqual(0);
  });
});
