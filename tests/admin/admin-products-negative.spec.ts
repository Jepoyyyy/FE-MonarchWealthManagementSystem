import { test, expect } from '../fixtures/admin-products-fixtures';

test.describe('Admin Products - Negative Tests', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('AP-N-01: Create product with missing code field', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-01' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: '',
      name: 'Product Without Code',
      issuer: 'Test Issuer',
      type: 'Stocks',
      riskLevel: 3,
      annualReturn: 10.0,
      minInvestment: 500000,
      currentPrice: 2000,
      description: 'This product has no code',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });

  test('AP-N-02: Create product with missing name field', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-02' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'TEST001',
      name: '',
      issuer: 'Test Issuer',
      type: 'Bonds',
      riskLevel: 2,
      annualReturn: 7.0,
      minInvestment: 1000000,
      currentPrice: 5000,
      description: 'This product has no name',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });

  test('AP-N-03: Create product with missing required fields', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-03' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.codeInput.fill('PARTIAL001');
    await adminProductsPage.nameInput.fill('Partial Product');

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });

  test('AP-N-04: Create product with invalid risk level - too high', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-04' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'HIGHRISK001',
      name: 'Too High Risk',
      issuer: 'Test Issuer',
      type: 'Stocks',
      riskLevel: 10,
      annualReturn: 10.0,
      minInvestment: 500000,
      currentPrice: 2000,
      description: 'Risk level exceeds maximum',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });

  test('AP-N-05: Create product with invalid risk level - too low', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-05' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'LOWRISK001',
      name: 'Too Low Risk',
      issuer: 'Test Issuer',
      type: 'Bonds',
      riskLevel: 0,
      annualReturn: 5.0,
      minInvestment: 1000000,
      currentPrice: 5000,
      description: 'Risk level below minimum',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });

  test('AP-N-06: Create product with negative min investment', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-06' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'NEG001',
      name: 'Negative Investment',
      issuer: 'Test Issuer',
      type: 'Stocks',
      riskLevel: 3,
      annualReturn: 10.0,
      minInvestment: -100000,
      currentPrice: 2000,
      description: 'Product with negative min investment',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });

  test('AP-N-07: Create product with negative current price', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-07' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'NEGPRICE001',
      name: 'Negative Price',
      issuer: 'Test Issuer',
      type: 'Mutual Funds',
      riskLevel: 2,
      annualReturn: 8.0,
      minInvestment: 500000,
      currentPrice: -1000,
      description: 'Product with negative price',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
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

  test('AP-N-09: API error when creating product', async ({ adminProductsPage, mockProductActionError, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-09' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await mockProductActionError(400, 'Product code already exists');

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();

    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'DUPLICATE001',
      name: 'Duplicate Product',
      issuer: 'Test Issuer',
      type: 'SBN',
      riskLevel: 1,
      annualReturn: 6.0,
      minInvestment: 1000000,
      currentPrice: 1000,
      description: 'This product code already exists',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();
    await page.waitForTimeout(1000);

    const errorVisible = await adminProductsPage.errorMessage.isVisible().catch(() => false);
    expect(errorVisible).toBe(true);

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
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

  test('AP-N-13: Create product with empty description', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-13' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.fillProductForm({
      code: 'NODESC001',
      name: 'No Description Product',
      issuer: 'Test Issuer',
      type: 'Sukuk',
      riskLevel: 1,
      annualReturn: 6.0,
      minInvestment: 1000000,
      currentPrice: 1000,
      description: '',
      lotSize: 1,
    });

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });

  test('AP-N-14: Create product without selecting type', async ({ adminProductsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AP-N-14' });

    await adminProductsPage.goto();
    await adminProductsPage.waitForProductsToLoad();
    await adminProductsPage.clickAddProduct();

    await adminProductsPage.codeInput.fill('NOTYPE001');
    await adminProductsPage.nameInput.fill('No Type Product');
    await adminProductsPage.issuerInput.fill('Test Issuer');
    await adminProductsPage.riskLevelInput.fill('3');
    await adminProductsPage.annualReturnInput.fill('10');
    await adminProductsPage.minInvestmentInput.fill('500000');
    await adminProductsPage.currentPriceInput.fill('2000');
    await adminProductsPage.descriptionTextarea.fill('Product without type selected');
    await adminProductsPage.lotSizeInput.fill('1');

    await adminProductsPage.submitProductForm();

    const isModalStillVisible = await adminProductsPage.addProductModal.isVisible();
    expect(isModalStillVisible).toBe(true);
  });
});
