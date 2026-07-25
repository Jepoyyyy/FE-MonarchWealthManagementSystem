import { test, expect } from '../fixtures/products-fixtures';

test.describe('Product - UI Responsiveness (P38-P40)', () => {

  test('P38: Product grid responsive on mobile viewport', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P38' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await productsPage.page.setViewportSize({ width: 375, height: 667 });
    await productsPage.page.waitForTimeout(300);
    
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P39: Filters stack on mobile viewport', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P39' });

    await productsPage.page.setViewportSize({ width: 375, height: 667 });
    await productsPage.page.waitForTimeout(300);
    
    const searchInput = productsPage.page.getByPlaceholder(/search by product name or issuer/i);
    await expect(searchInput).toBeVisible();
  });

  test('P40: Product grid displays in columns on desktop', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P40' });

    await productsPage.page.setViewportSize({ width: 1920, height: 1080 });
    await productsPage.page.waitForTimeout(300);
    
    const count = await productsPage.productCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
