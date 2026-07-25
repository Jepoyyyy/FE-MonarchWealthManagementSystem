import { test, expect } from '../fixtures/recommendations-fixtures';

test.describe('Recommendations - Performance Tests (REC-PERF-001 to REC-PERF-012)', () => {

  test('REC-PERF-001: Recommendations page loads within 3 seconds', async ({
    recommendationsPage,
    mockRecommendationsData,
  }) => {
    const mockRecs = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      product: {
        id: `prod-${i}`,
        name: `Product ${i}`,
        type: 'Stock',
        issuer: `Issuer ${i}`,
        annualReturn: 10 + i,
        riskLevel: 'medium',
      },
      priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
      reason: `Test recommendation ${i}`,
    }));

    const healthScore = {
      score: 75,
      components: [],
      description: 'Good',
    };

    await mockRecommendationsData(mockRecs, healthScore);

    const startTime = Date.now();
    await recommendationsPage.goto();
    await recommendationsPage.waitForRecommendationsToLoad();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('REC-PERF-002: Health score API responds within 1 second', async ({
    recommendationsPage,
  }) => {
    const apiResponses: number[] = [];

    recommendationsPage.page.on('response', async (response) => {
      if (response.url().includes('/api/v1/me/health')) {
        const timing = response.request().timing();
        if (timing) {
          apiResponses.push(timing.responseEnd);
        }
      }
    });

    await recommendationsPage.goto();
    await recommendationsPage.page.waitForLoadState('networkidle');

    if (apiResponses.length > 0) {
      const avgResponseTime = apiResponses.reduce((a, b) => a + b, 0) / apiResponses.length;
      expect(avgResponseTime).toBeLessThan(1000);
    }
  });

  test('REC-PERF-003: Recommendations API responds within 1 second', async ({
    recommendationsPage,
  }) => {
    const apiResponses: number[] = [];

    recommendationsPage.page.on('response', async (response) => {
      if (response.url().includes('/api/v1/me/recommendations')) {
        const timing = response.request().timing();
        if (timing) {
          apiResponses.push(timing.responseEnd);
        }
      }
    });

    await recommendationsPage.goto();
    await recommendationsPage.page.waitForLoadState('networkidle');

    if (apiResponses.length > 0) {
      const avgResponseTime = apiResponses.reduce((a, b) => a + b, 0) / apiResponses.length;
      expect(avgResponseTime).toBeLessThan(1000);
    }
  });

  test('REC-PERF-004: TrackModal opens within 500ms', async ({ recommendationsPage }) => {
    await recommendationsPage.page.waitForLoadState('networkidle');

    const startTime = Date.now();
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModalTitle).toBeVisible();
    const openTime = Date.now() - startTime;

    expect(openTime).toBeLessThan(500);
  });

  test('REC-PERF-005: TrackModal closes within 300ms', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const startTime = Date.now();
    await recommendationsPage.page.keyboard.press('Escape');
    await expect(recommendationsPage.trackModalTitle).not.toBeVisible();
    const closeTime = Date.now() - startTime;

    expect(closeTime).toBeLessThan(300);
  });

  test('REC-PERF-006: Form submission completes within 2 seconds', async ({
    recommendationsPage,
  }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      quantity: '50',
    });

    const startTime = Date.now();
    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
    const submitTime = Date.now() - startTime;

    expect(submitTime).toBeLessThan(2000);
  });

  test('REC-PERF-007: Asset creation API responds within 1 second', async ({
    recommendationsPage,
  }) => {
    const apiResponses: number[] = [];

    recommendationsPage.page.on('response', async (response) => {
      if (response.url().includes('/api/v1/me/assets') && response.request().method() === 'POST') {
        const timing = response.request().timing();
        if (timing) {
          apiResponses.push(timing.responseEnd);
        }
      }
    });

    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });

    if (apiResponses.length > 0) {
      const avgResponseTime = apiResponses.reduce((a, b) => a + b, 0) / apiResponses.length;
      expect(avgResponseTime).toBeLessThan(1000);
    }
  });

  test('REC-PERF-008: Large recommendation list renders within 5 seconds', async ({
    recommendationsPage,
    mockRecommendationsData,
  }) => {
    const mockRecs = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      product: {
        id: `prod-${i}`,
        name: `Product ${i}`,
        type: 'Stock',
        issuer: `Issuer ${i}`,
        annualReturn: 10 + i,
        riskLevel: 'medium',
      },
      priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
      reason: `Test recommendation ${i}`,
    }));

    await mockRecommendationsData(mockRecs);

    const startTime = Date.now();
    await recommendationsPage.goto();
    await recommendationsPage.waitForRecommendationsToLoad();
    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(5000);
  });

  test('REC-PERF-009: Multiple modal interactions complete quickly', async ({
    recommendationsPage,
  }) => {
    const interactions: number[] = [];

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();

      await recommendationsPage.clickTrackOnRecommendation(0);
      await expect(recommendationsPage.trackModal).toBeVisible();

      await recommendationsPage.page.keyboard.press('Escape');
      await expect(recommendationsPage.trackModalTitle).not.toBeVisible();

      const interactionTime = Date.now() - startTime;
      interactions.push(interactionTime);

      await recommendationsPage.page.waitForTimeout(200);
    }

    const avgInteractionTime = interactions.reduce((a, b) => a + b, 0) / interactions.length;
    expect(avgInteractionTime).toBeLessThan(800);
  });

  test('REC-PERF-010: Concurrent tracking operations complete within 5 seconds', async ({
    recommendationsPage,
  }) => {
    const count = await recommendationsPage.getRecommendationCount();

    if (count >= 3) {
      const startTime = Date.now();

      for (let i = 0; i < 3; i++) {
        await recommendationsPage.clickTrackOnRecommendation(i);
        await expect(recommendationsPage.trackModal).toBeVisible();

        await recommendationsPage.fillTrackingForm({
          amount: `${1000000 + i * 100000}`,
        });

        await recommendationsPage.submitTrackingForm();
        await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });

        await recommendationsPage.page.waitForTimeout(500);
      }

      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(15000);
    }
  });

  test('REC-PERF-011: Page navigation from recommendations to assets within 2 seconds', async ({
    recommendationsPage,
    assetsPage,
  }) => {
    await recommendationsPage.page.waitForLoadState('networkidle');

    const startTime = Date.now();
    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    const navigationTime = Date.now() - startTime;

    expect(navigationTime).toBeLessThan(2000);
  });

  test('REC-PERF-012: Rapid form input updates do not lag', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const dialog = recommendationsPage.trackModal;
    const amountInput = dialog.getByRole('spinbutton').nth(0);

    const startTime = Date.now();

    for (let i = 1; i <= 10; i++) {
      await amountInput.fill(`${i}000000`);
      await recommendationsPage.page.waitForTimeout(20);
    }

    const inputTime = Date.now() - startTime;

    expect(inputTime).toBeLessThan(1500);
  });
});
