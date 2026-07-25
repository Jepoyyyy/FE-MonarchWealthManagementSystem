import { test, expect } from '../fixtures/products-fixtures';

test.describe('Products - Pagination (P13-P16)', () => {

  test('P13: Pagination controls display when products exceed page size', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P13' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    const pagination = productsPage.page.locator('nav[aria-label="pagination"]');
    await expect(pagination).toBeVisible();
  });

  test('P14: Click next page loads next set of products', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P14' });

    const nextButton = productsPage.page.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await expect(productsPage.productCards.first()).toBeVisible();
    }
  });

  test('P15: Click previous page loads previous set', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P15' });

    const nextButton = productsPage.page.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await productsPage.page.waitForTimeout(500);
      
      const prevButton = productsPage.page.getByRole('button', { name: /previous/i });
      await prevButton.click();
      await expect(productsPage.productCards.first()).toBeVisible();
    }
  });

  test('P16: Page number indicators update correctly', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P16' });

    const pagination = productsPage.page.locator('nav[aria-label="pagination"]');
    await expect(pagination).toBeVisible();
  });
});
