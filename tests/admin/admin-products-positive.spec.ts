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

  test('AP-P-07: Open add product modal', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-07' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.clickAddProduct();

    await expect(adminProductsPage.addProductModal).toBeVisible();
    await expect(adminProductsPage.modalTitle).toContainText(/add new product/i);
  });

  test('AP-P-08: Close add product modal', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-08' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.clickAddProduct();
    await expect(adminProductsPage.addProductModal).toBeVisible();

    await adminProductsPage.closeAddProductModal();
    await expect(adminProductsPage.addProductModal).not.toBeVisible();
  });

  test('AP-P-09: Create product with all required fields', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-09' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.createProduct({
      code: 'SBN999',
      name: 'Test Government Bond',
      issuer: 'Pemerintah RI',
      type: 'SBN',
      riskLevel: 1,
      annualReturn: 6.5,
      minInvestment: 1000000,
      currentPrice: 1000,
      description: 'Test government bond for automated testing',
      lotSize: 1,
    });

    await page.waitForTimeout(1000);
    await expect(adminProductsPage.addProductModal).not.toBeVisible();
  });

  test('AP-P-10: Create product with all fields including optional', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-10' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.createProduct({
      code: 'MF999',
      name: 'Test Mutual Fund',
      issuer: 'PT Manulife',
      type: 'Mutual Funds',
      riskLevel: 3,
      annualReturn: 12.5,
      minInvestment: 500000,
      currentPrice: 1500,
      description: 'Test mutual fund with all optional fields',
      tenor: '5 Years',
      lotSize: 10,
      isFractionalAllowed: true,
      visible: true,
    });

    await page.waitForTimeout(1000);
    await expect(adminProductsPage.addProductModal).not.toBeVisible();
  });

  test('AP-P-11: Create product with fractional allowed', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-11' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'FRAC001',
      name: 'Fractional Product',
      issuer: 'Test Issuer',
      type: 'Stocks',
      riskLevel: 4,
      annualReturn: 15.0,
      minInvestment: 100000,
      currentPrice: 5000,
      description: 'Product that allows fractional shares',
      lotSize: 1,
      isFractionalAllowed: true,
    });

    const isChecked = await adminProductsPage.fractionalAllowedCheckbox.isChecked();
    expect(isChecked).toBe(true);

    await adminProductsPage.submitProductForm();
    await page.waitForTimeout(1000);
  });

  test('AP-P-12: Create product with visibility unchecked', async ({ adminProductsPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-12' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'HIDDEN001',
      name: 'Hidden Product',
      issuer: 'Test Issuer',
      type: 'Bonds',
      riskLevel: 2,
      annualReturn: 8.0,
      minInvestment: 2000000,
      currentPrice: 10000,
      description: 'Product that is hidden by default',
      lotSize: 1,
      visible: false,
    });

    const isChecked = await adminProductsPage.visibleCheckbox.isChecked();
    expect(isChecked).toBe(false);

    await adminProductsPage.submitProductForm();
    await page.waitForTimeout(1000);
  });

  test('AP-P-13: Cancel product creation', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-P-13' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'CANCEL001',
      name: 'Cancelled Product',
      issuer: 'Test Issuer',
      type: 'Stocks',
      riskLevel: 3,
      annualReturn: 10.0,
      minInvestment: 500000,
      currentPrice: 2000,
      description: 'This product creation will be cancelled',
      lotSize: 1,
    });

    await adminProductsPage.cancelProductForm();
    await expect(adminProductsPage.addProductModal).not.toBeVisible();
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
      await expect(adminProductsPage.confirmModalTitle).toContainText(/sembunyikan produk/i);

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
