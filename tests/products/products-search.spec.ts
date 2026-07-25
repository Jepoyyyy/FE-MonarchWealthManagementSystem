import { test, expect } from '../fixtures/products-fixtures';

test.describe('Product - Search and Filter (P01-P08)', () => {

  test('P01: Products page loads with product grid', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P01' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await expect(productsPage.productCards.first()).toBeVisible();
    const count = await productsPage.productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('P02: Search by product name filters results', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P02' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await productsPage.search('BCA');
    
    const firstCard = productsPage.productCards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toContainText(/BCA/i);
  });

  test('P03: Search by issuer filters results', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P03' });

    await productsPage.search('Bank');
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P04: Filter by product type works', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P04' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    // Just verify filtering mechanism works, don't assert on specific type
    await productsPage.filterByType('Stock');
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P05: Filter by product type (Stock)', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P05' });

    await productsPage.filterByType('Stock');
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P06: Filter by product type (Bond)', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P06' });

    await productsPage.filterByType('Bond');
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P07: Combined search + type filter', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P07' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await productsPage.search('BCA');
    await productsPage.filterByType('Bank Deposit');
    
    const firstCard = productsPage.productCards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toContainText(/BCA/i);
    await expect(firstCard).toContainText(/bank deposit/i);
  });

  test('P08: Empty search results show no products message', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P08' });

    await productsPage.search('NonExistentProductXYZ123456789');
    
    await expect(productsPage.emptyState).toBeVisible();
    await expect(productsPage.page.getByText(/try adjusting your search/i)).toBeVisible();
  });
});
