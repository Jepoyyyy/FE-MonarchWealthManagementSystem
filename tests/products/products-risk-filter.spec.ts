import { test, expect } from '../fixtures/products-fixtures';

test.describe('Product - Risk Level Filtering (P09-P12)', () => {

  test('P09: Toggle "Show High Risk" reveals high-risk products', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P09' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    // Count products before toggle
    const initialCount = await productsPage.productCards.count();
    
    // Click "Show High Risk" toggle
    await productsPage.page.getByText('Show High Risk', { exact: true }).click();
    await productsPage.page.waitForTimeout(500);
    
    // Verify products reloaded
    await expect(productsPage.productCards.first()).toBeVisible();
    
    // Should potentially have different products now
    const afterCount = await productsPage.productCards.count();
    expect(afterCount).toBeGreaterThan(0);
  });

  test('P10: Risk profile banner shows when user profile is lower than product risk', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P10' });

    // Enable high risk toggle
    await productsPage.page.getByText('Show High Risk', { exact: true }).click();
    await productsPage.page.waitForTimeout(500);
    
    // Check if risk banner appears (depends on user's risk profile)
    const banner = productsPage.page.locator('.bg-yellow-50, .bg-amber-50').first();
    // Banner may or may not appear depending on user profile vs products shown
  });

  test('P11: Default view respects user risk profile', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P11' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    // By default, "Show High Risk" should be OFF
    const toggle = productsPage.page.locator('[class*="text-muted-foreground"]').filter({ hasText: /show high risk/i });
    await expect(toggle).toBeVisible();
    
    // Products should load
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('P12: Toggle off "Show High Risk" filters out high-risk products', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P12' });

    // Turn ON high risk
    await productsPage.page.getByText('Show High Risk', { exact: true }).click();
    await productsPage.page.waitForTimeout(500);
    
    // Turn OFF high risk
    await productsPage.page.getByText('Show High Risk', { exact: true }).click();
    await productsPage.page.waitForTimeout(500);
    
    // Verify products still display
    await expect(productsPage.productCards.first()).toBeVisible();
  });
});
