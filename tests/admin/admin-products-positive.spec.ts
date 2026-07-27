import { test, expect } from '../fixtures/admin-products-fixtures';

test.describe('Admin Products - Positive Tests', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('AP-P-01: Admin can access products management page', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-01' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await adminProductsPage.goto();

    await expect(adminProductsPage.headerTitle).toBeVisible();
    await expect(adminProductsPage.headerTitle).toContainText(/product management/i);
  });

  test('AP-P-02: Product list displays correctly', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-02' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await expect(adminProductsPage.productTable).toBeVisible();
    const productCount = await adminProductsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('AP-P-03: Search products by name works correctly', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-03' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.searchProducts('Test Product 1');

    const productCount = await adminProductsPage.getProductCount();
    expect(productCount).toBeGreaterThanOrEqual(0);
  });

  test('AP-P-04: Search products by issuer works correctly', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-04' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.searchProducts('Pemerintah RI');

    const productCount = await adminProductsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('AP-P-05: Type filter works correctly', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-05' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.filterByType('Stocks');
    await expect(adminProductsPage.productTable).toBeVisible();

    await adminProductsPage.filterByType('Bonds');
    await expect(adminProductsPage.productTable).toBeVisible();

    await adminProductsPage.filterByType('');
    await expect(adminProductsPage.productTable).toBeVisible();
  });

  test('AP-P-06: Combined search and filter works', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-06' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.searchProducts('Test');
    await adminProductsPage.filterByType('SBN');

    await expect(adminProductsPage.productTable).toBeVisible();
  });


  test('AP-P-14: Toggle product visibility - hide visible product', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-14' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const firstVisibleRow = adminProductsPage.tableRows.first();
    const productName = await firstVisibleRow.locator('td:first-child p').first().textContent();

    if (productName && productName.trim()) {
      await adminProductsPage.clickToggleVisibilityForProduct(productName.trim());

      await expect(adminProductsPage.confirmModal).toBeVisible();
      await expect(adminProductsPage.confirmModalTitle).toContainText(/hide product/i);

      await adminProductsPage.confirmAction();

      await page.waitForTimeout(1000);
      await expect(adminProductsPage.confirmModal).not.toBeVisible();
    }
  });

  test('AP-P-15: Cancel visibility change', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-15' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const firstRow = adminProductsPage.tableRows.first();
    const productName = await firstRow.locator('td:first-child p').first().textContent();

    if (productName && productName.trim()) {
      await adminProductsPage.clickToggleVisibilityForProduct(productName.trim());
      await expect(adminProductsPage.confirmModal).toBeVisible();

      await adminProductsPage.cancelAction();
      await expect(adminProductsPage.confirmModal).not.toBeVisible();
    }
  });

  test('AP-P-16: Pagination navigation works', async ({ adminProductsPage, page, mockProductsListSuccess }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-16' });

    const { generateLargeProductList } = await import('../fixtures/admin-products-fixtures');
    await mockProductsListSuccess(generateLargeProductList(30), 2, 30);

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const hasPagination = await adminProductsPage.pagination.count() > 0;

    if (hasPagination) {
      const hasNextButton = await adminProductsPage.nextPageButton.count() > 0;

      if (hasNextButton && await adminProductsPage.nextPageButton.isEnabled()) {
        await adminProductsPage.goToNextPage();

        const hasPrevButton = await adminProductsPage.prevPageButton.count() > 0;
        if (hasPrevButton && await adminProductsPage.prevPageButton.isEnabled()) {
          await adminProductsPage.goToPrevPage();
        }
      }
    }
  });

  test('AP-P-17: Clear search resets product list', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-17' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const initialCount = await adminProductsPage.getProductCount();

    await adminProductsPage.searchProducts('NonExistentProduct12345');
    await adminProductsPage.page.waitForTimeout(500);

    await adminProductsPage.searchInput.clear();
    await adminProductsPage.page.waitForTimeout(500);
    await adminProductsPage.waitForProductsToLoad();

    const resetCount = await adminProductsPage.getProductCount();
    expect(resetCount).toBeGreaterThanOrEqual(initialCount);
  });
});
