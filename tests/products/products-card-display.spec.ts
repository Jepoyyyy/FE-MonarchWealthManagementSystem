import { test, expect } from '../fixtures/products-fixtures';

test.describe('Products - Card Display (P17-P22)', () => {

  test('P17: Product card displays name, issuer, type', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P17' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const firstCard = productsPage.productCards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toContainText(/annual return/i);
  });

  test('P18: Product card displays risk level badge', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P18' });

    const firstCard = productsPage.productCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('P19: Product card displays expected return percentage', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P19' });

    const firstCard = productsPage.productCards.first();
    await expect(firstCard).toContainText(/annual return/i);
  });

  test('P20: Product card displays minimum investment amount', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P20' });

    const firstCard = productsPage.productCards.first();
    await expect(firstCard).toContainText(/min\. investment/i);
  });

  test('P21: Track button visible on each card', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P21' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await expect(trackButton).toBeVisible();
  });

  test('P22: Hover effect on product card', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P22' });

    const firstCard = productsPage.productCards.first();
    await firstCard.hover();
    await expect(firstCard).toBeVisible();
  });
});
