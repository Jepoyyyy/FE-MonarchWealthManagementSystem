import { test, expect } from '../fixtures/admin-products-fixtures';

test.describe('Admin Products - Negative Tests', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('AP-N-08: API error when loading products list', async ({ adminProductsPage, mockProductsListError }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-08' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await mockProductsListError(500, 'Internal Server Error');

    await adminProductsPage.goto();

    await adminProductsPage.page.waitForTimeout(2000);

    const hasError = await adminProductsPage.page.locator('text=/failed to load|error/i').count() > 0;
    expect(hasError).toBe(true);
  });

  test('AP-N-10: API error when updating product visibility', async ({ adminProductsPage, mockProductActionError, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-10' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    const firstRow = adminProductsPage.tableRows.first();
    const productName = await firstRow.locator('td:first-child p').first().textContent();

    if (productName && productName.trim()) {
      await mockProductActionError(500, 'Failed to update product');

      await adminProductsPage.clickToggleVisibilityForProduct(productName.trim());
      await adminProductsPage.confirmAction();

      await page.waitForTimeout(1000);

      const hasError = await page.locator('text=/failed|error/i').count() > 0;
      expect(hasError).toBe(true);
    }
  });

  test('AP-N-11: Search with no results', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-11' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.searchProducts('NonExistentProduct99999XYZ');

    await expect(adminProductsPage.emptyState).toBeVisible();
  });

  test('AP-N-12: Filter by type with no results', async ({ adminProductsPage, mockProductsListSuccess }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-12' });

    const productsWithoutStocks = [
      {
        id: 'product-1',
        code: 'BND001',
        name: 'Bond Product',
        issuer: 'Test Issuer',
        type: 'Bonds',
        riskLevel: 2,
        annualReturn: 7.0,
        minInvestment: 1000000,
        currentPrice: 5000,
        description: 'A bond product',
        lotSize: 1,
        isFractionalAllowed: false,
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    await mockProductsListSuccess(productsWithoutStocks);

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.filterByType('Stocks');

    await expect(adminProductsPage.emptyState).toBeVisible();
  });
});
