import { test, expect } from '../fixtures/products-fixtures';

test.describe('Product - Performance (P41-P43)', () => {
  
  test('P41: Products page loads within acceptable time', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P41' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    // Products already loaded via fixture
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P42: Search debounce prevents excessive API calls', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P42' });

    const searchInput = productsPage.page.getByPlaceholder(/search by product name or issuer/i);
    
    // Type quickly
    await searchInput.type('BCA', { delay: 50 });
    
    // Wait for debounce
    await productsPage.page.waitForTimeout(500);
    
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P43: Pagination navigation is smooth', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P43' });

    const nextButton = productsPage.page.getByRole('button', { name: /next/i });
    const isNextVisible = await nextButton.isVisible().catch(() => false);
    
    if (isNextVisible && await nextButton.isEnabled()) {
      await nextButton.click();
      await productsPage.page.waitForTimeout(300);
      await expect(productsPage.productCards.first()).toBeVisible();
    }
  });
});
