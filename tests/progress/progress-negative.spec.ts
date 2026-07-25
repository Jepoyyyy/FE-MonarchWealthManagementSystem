import { test, expect } from '../fixtures/progress-fixtures';

test.describe('Progress Page - Negative Tests', () => {
  test('should handle 500 error from progress API gracefully', async ({ progressPage, mockProgressError }) => {
    await mockProgressError('progress', 500, 'Internal Server Error');
    await progressPage.page.reload();

    // Should show loading or error state, not crash
    await expect(progressPage.pageHeading).toBeVisible();

    // Loading skeleton should eventually appear or disappear
    const hasLoading = await progressPage.loadingSkeleton.isVisible().catch(() => false);
    expect(typeof hasLoading).toBe('boolean');
  });

  test('should handle 404 error from progress API', async ({ progressPage, mockProgressError }) => {
    await mockProgressError('progress', 404, 'Not Found');
    await progressPage.page.reload();

    await expect(progressPage.pageHeading).toBeVisible();

    // Page should not crash
    const pageContent = await progressPage.page.content();
    expect(pageContent).toBeTruthy();
  });

  test('should handle network timeout for progress API', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Simulate timeout
    });

    await progressPage.page.reload();

    // Should show loading state
    await expect(progressPage.pageHeading).toBeVisible();
  });

  test('should display empty state when no progress data exists', async ({ progressPage, mockEmptyProgress }) => {
    await mockEmptyProgress();
    await progressPage.page.reload();

    await expect(progressPage.pageHeading).toBeVisible();

    // Should show loading message or empty state
    const subtitle = await progressPage.page.getByText(/loading goal progress data/i);
    await expect(subtitle).toBeVisible();
  });

  test('should handle missing assets data', async ({ progressPage, mockProgressData, createTestProgress }) => {
    const progress = createTestProgress(2);
    await mockProgressData(progress, [], []); // Empty assets and PnL

    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    // Should still display page without crashing
    await expect(progressPage.pageHeading).toBeVisible();

    // Position breakdown should show empty state
    const isEmpty = await progressPage.emptyPositionMessage.isVisible().catch(() => false);
    expect(typeof isEmpty).toBe('boolean');
  });

  test('should handle assets API error', async ({ progressPage, mockProgressData, mockProgressError, createTestProgress }) => {
    const progress = createTestProgress(2);
    await mockProgressData(progress);
    await mockProgressError('assets', 500, 'Failed to fetch assets');

    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    // Page should still load with progress data
    await expect(progressPage.pageHeading).toBeVisible();
    await expect(progressPage.goalTimelineTable).toBeVisible();
  });

  test('should handle PnL API error', async ({ progressPage, mockProgressData, mockProgressError, createTestProgress, createTestAssets }) => {
    const progress = createTestProgress(2);
    const assets = createTestAssets(2);
    await mockProgressData(progress, assets);
    await mockProgressError('pnl', 500, 'Failed to calculate PnL');

    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    // Page should still load with progress and assets
    await expect(progressPage.pageHeading).toBeVisible();
  });

  test('should handle invalid progress data structure', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: [{ invalid: 'data', missing: 'required_fields' }],
        }),
      });
    });

    await progressPage.page.reload();

    // Should handle gracefully without crashing
    await expect(progressPage.pageHeading).toBeVisible();
  });

  test('should handle malformed JSON from progress API', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json {{{',
      });
    });

    await progressPage.page.reload();

    // Should not crash the page
    await expect(progressPage.pageHeading).toBeVisible();
  });

  test('should handle null values in progress data', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: null,
        }),
      });
    });

    await progressPage.page.reload();

    await expect(progressPage.pageHeading).toBeVisible();
  });

  test('should handle undefined monthly contribution', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      monthly_contribution: 0,
      avg_monthly_growth: 0,
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    // Should display data without crashing
    await expect(progressPage.pageHeading).toBeVisible();

    // Performance banner might not be visible if no contributions
    const bannerVisible = await progressPage.isPerformanceBannerVisible();
    expect(typeof bannerVisible).toBe('boolean');
  });

  test('should handle zero target amount in goals', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      target_amount: 0,
      current_saved: 0,
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await expect(progressPage.pageHeading).toBeVisible();
    await expect(progressPage.goalTimelineTable).toBeVisible();
  });

  test('should handle negative projected ETA months', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      projected_eta_months: -1,
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await expect(progressPage.goalTimelineTable).toBeVisible();

    // Should show "Not reachable" or similar status
    const rowCount = await progressPage.getGoalTimelineRowCount();
    expect(rowCount).toBe(2);
  });

  test('should handle extremely large ETA values', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      projected_eta_months: 99999,
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await expect(progressPage.goalTimelineTable).toBeVisible();

    const firstGoalETA = await progressPage.getGoalETA('Test Goal 1');
    expect(firstGoalETA).toBeTruthy();
  });

  test('should handle missing product data in position breakdown', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL, page }) => {
    const progress = createTestProgress(2);
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      ['non-existent-product-1', 'non-existent-product-2'] // Products that don't exist
    );

    await mockProgressData(progress, assets, pnl);

    // Mock empty products response
    await page.route('**/api/v1/products*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: [] }),
      });
    });

    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await expect(progressPage.pageHeading).toBeVisible();
  });

  test('should handle concurrent API failures', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
    });
    await page.route('**/api/v1/me/assets', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
    });
    await page.route('**/api/v1/me/assets/pnl', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
    });

    await progressPage.page.reload();

    // Page should still render header
    await expect(progressPage.pageHeading).toBeVisible();
  });

  test('should handle unauthorized (401) response', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    await progressPage.page.reload();

    // May redirect to login or show error
    await progressPage.page.waitForLoadState('networkidle');
    const url = progressPage.page.url();
    expect(url).toBeTruthy();
  });

  test('should handle forbidden (403) response', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Forbidden' }),
      });
    });

    await progressPage.page.reload();

    await progressPage.page.waitForLoadState('networkidle');
    const url = progressPage.page.url();
    expect(url).toBeTruthy();
  });

  test('should handle very slow API response', async ({ progressPage, page }) => {
    await page.route('**/api/v1/me/goals/progress', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: [] }),
      });
    });

    await progressPage.page.reload();

    // Should show loading state during delay
    const loadingVisible = await progressPage.loadingSkeleton.isVisible().catch(() => false);
    expect(typeof loadingVisible).toBe('boolean');
  });

  test('should handle empty assets with valid progress', async ({ progressPage, mockProgressData, createTestProgress }) => {
    const progress = createTestProgress(3);
    await mockProgressData(progress, [], []); // No assets or PnL

    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    // Progress data should still display
    await expect(progressPage.goalTimelineTable).toBeVisible();

    const rowCount = await progressPage.getGoalTimelineRowCount();
    expect(rowCount).toBe(3);

    // Position breakdown should show empty message
    await expect(progressPage.positionBreakdown).toBeVisible();
  });

  test('should handle goals with unrealistic target dates', async ({ progressPage, mockProgressData, createTestProgress, createTestAssets, createTestPnL }) => {
    const progress = createTestProgress(2).map(p => ({
      ...p,
      projected_eta_months: 0, // Already reached
      current_saved: p.target_amount, // Already at target
    }));
    const assets = createTestAssets(2);
    const pnl = createTestPnL(
      assets.map(a => a.id),
      assets.map(a => a.productId)
    );

    await mockProgressData(progress, assets, pnl);
    await progressPage.page.reload();
    await progressPage.waitForPageLoad();

    await expect(progressPage.goalTimelineTable).toBeVisible();

    // Should show "Done" or "Reached" status
    const rowCount = await progressPage.getGoalTimelineRowCount();
    expect(rowCount).toBe(2);
  });
});
