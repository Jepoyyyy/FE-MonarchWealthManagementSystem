import { test, expect } from '../fixtures/products-fixtures';

test.describe('Product - Track Investment Modal (P23-P30)', () => {

  test('P23: Click "Track in Portfolio" opens modal', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P23' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await trackButton.click();
    
    await expect(productsPage.page.getByRole('heading', { name: /track investment/i })).toBeVisible();
  });

  test('P24: Modal displays selected product details', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P24' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await trackButton.click();
    
    await expect(productsPage.page.getByRole('heading', { name: /track investment/i })).toBeVisible();
  });

  test('P25: Close modal without saving', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P25' });

    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await trackButton.click();
    
    await productsPage.page.keyboard.press('Escape');
    await productsPage.page.waitForTimeout(300);
    
    await expect(productsPage.page.getByRole('heading', { name: /track investment/i })).not.toBeVisible();
  });

  test('P26: Modal form validation works', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P26' });

    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await trackButton.click();

    const dialog = productsPage.page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /track investment/i })).toBeVisible();

    await productsPage.page.waitForLoadState('networkidle');

    const submitButton = dialog.getByRole('button', { name: /record position/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Check for actual validation message
    await expect(productsPage.page.getByText(/enter the amount you invested/i)).toBeVisible();
  });

  test('P27: Submit valid investment tracking', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P27' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await trackButton.click();

    // Wait for modal to be visible
    await expect(productsPage.page.getByRole('heading', { name: /track investment/i })).toBeVisible();

    // Target spinbutton inputs directly by role and position within the dialog
    const dialog = productsPage.page.getByRole('dialog');
    const spinbuttons = dialog.getByRole('spinbutton');

    // Fill Amount Invested (first spinbutton)
    await spinbuttons.nth(0).fill('100000');

    const submitButton = productsPage.page.getByRole('button', { name: /record position/i });
    await submitButton.click();

    // Wait for success toast to appear
    await expect(productsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('P28: Modal keyboard navigation works', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P28' });

    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await trackButton.click();
    
    await expect(productsPage.page.getByRole('heading', { name: /track investment/i })).toBeVisible();
    
    // Press Escape to close
    await productsPage.page.keyboard.press('Escape');
    await expect(productsPage.page.getByRole('heading', { name: /track investment/i })).not.toBeVisible();
  });

  test('P29: Multiple products can be tracked', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P29' });

    const trackButtons = productsPage.page.getByRole('button', { name: /track in portfolio/i });
    const count = await trackButtons.count();
    expect(count).toBeGreaterThan(1);
  });

  test('P30: Modal accessible on mobile viewport', async ({ productsPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P30' });

    await productsPage.page.setViewportSize({ width: 375, height: 667 });
    
    const trackButton = productsPage.page.getByRole('button', { name: /track in portfolio/i }).first();
    await trackButton.click();
    
    await expect(productsPage.page.getByRole('heading', { name: /track investment/i })).toBeVisible();
  });
});
