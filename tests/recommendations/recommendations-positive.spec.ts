import { test, expect } from '../fixtures/recommendations-fixtures';
import { API_BASE_URL } from '../utils/api-client';

test.describe('Recommendations - Positive Tests (REC-PT-001 to REC-PT-020)', () => {

  test('REC-PT-001: Authenticated user can access recommendations page', async ({ recommendationsPage }) => {
    await expect(recommendationsPage.pageTitle).toBeVisible();
  });

  test('REC-PT-002: Health score section displays correctly', async ({ recommendationsPage }) => {
    await expect(recommendationsPage.healthScoreSection).toBeVisible();
    const score = await recommendationsPage.getHealthScore();
    expect(score).toMatch(/\d+/);
  });

  test('REC-PT-003: Health score description is visible', async ({ recommendationsPage }) => {
    await expect(recommendationsPage.healthScoreDescription).toBeVisible();
  });

  test('REC-PT-004: Recommendation cards are displayed', async ({ recommendationsPage }) => {
    const count = await recommendationsPage.getRecommendationCount();
    expect(count).toBeGreaterThan(0);
  });

  test('REC-PT-005: Each recommendation card has Track button', async ({ recommendationsPage }) => {
    const firstCard = recommendationsPage.recommendationCards.first();
    await expect(firstCard.getByRole('button', { name: /track/i })).toBeVisible();
  });

  test('REC-PT-006: Recommendation cards show product details', async ({ recommendationsPage }) => {
    const title = await recommendationsPage.getRecommendationTitle(0);
    expect(title.length).toBeGreaterThan(0);
  });

  test('REC-PT-007: Click Track button opens TrackModal', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModalTitle).toBeVisible();
  });

  test('REC-PT-008: TrackModal can be closed without saving', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.page.keyboard.press('Escape');
    await recommendationsPage.page.waitForTimeout(300);

    await expect(recommendationsPage.trackModalTitle).not.toBeVisible();
  });

  test('REC-PT-009: Successfully track recommendation with minimum fields', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-PT-010: Successfully track recommendation with all fields', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const today = new Date().toISOString().split('T')[0];

    await recommendationsPage.fillTrackingForm({
      amount: '5000000',
      quantity: '100',
      date: today,
      platform: 'Test Platform',
      notes: 'Investment from recommendation',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-PT-011: Tracked recommendation creates asset in backend', async ({
    recommendationsPage,
    assetsPage,
    request,
    accessToken,
  }) => {
    await recommendationsPage.goto();
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const productTitle = await recommendationsPage.getRecommendationTitle(0);

    await recommendationsPage.fillTrackingForm({
      amount: '3000000',
      quantity: '50',
      platform: 'Integration Test',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });

    await recommendationsPage.page.waitForTimeout(1000);

    const assetsResponse = await request.get(`${API_BASE_URL}/me/assets`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(assetsResponse.ok()).toBeTruthy();
    const body = await assetsResponse.json();
    const assets = body.result || body.data || body || [];
    expect(assets.length).toBeGreaterThan(0);
  });

  test('REC-PT-012: Tracked asset appears in assets page', async ({
    recommendationsPage,
    assetsPage,
  }) => {
    await recommendationsPage.goto();
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const productTitle = await recommendationsPage.getRecommendationTitle(0);

    await recommendationsPage.fillTrackingForm({
      amount: '2500000',
      quantity: '75',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });

    await recommendationsPage.page.waitForTimeout(1000);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();

    const hasAssets = await assetsPage.page.locator('tbody tr').count();
    expect(hasAssets).toBeGreaterThan(0);
  });

  test('REC-PT-013: Multiple recommendations can be tracked', async ({ recommendationsPage }) => {
    const count = await recommendationsPage.getRecommendationCount();

    if (count >= 2) {
      await recommendationsPage.clickTrackOnRecommendation(0);
      await expect(recommendationsPage.trackModal).toBeVisible();

      await recommendationsPage.fillTrackingForm({
        amount: '1500000',
        quantity: '30',
      });

      await recommendationsPage.submitTrackingForm();
      await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });

      await recommendationsPage.page.waitForTimeout(1000);

      await recommendationsPage.clickTrackOnRecommendation(1);
      await expect(recommendationsPage.trackModal).toBeVisible();

      await recommendationsPage.fillTrackingForm({
        amount: '2000000',
        quantity: '40',
      });

      await recommendationsPage.submitTrackingForm();
      await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
    }
  });

  test('REC-PT-014: Track recommendation with large amount', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '50000000',
      quantity: '1000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-PT-015: Track recommendation with decimal quantity', async ({ recommendationsPage }) => {
    const count = await recommendationsPage.getRecommendationCount();
    let cardIndex = 0;
    for (let i = 0; i < count; i++) {
      const card = recommendationsPage.recommendationCards.nth(i);
      const text = await card.textContent();
      if (text && !text.includes('Stock') && !text.includes('📊')) {
        cardIndex = i;
        break;
      }
    }

    await recommendationsPage.clickTrackOnRecommendation(cardIndex);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      quantity: '10.5',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-PT-016: Track recommendation with past date', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const pastDate = '2026-01-15';

    await recommendationsPage.fillTrackingForm({
      amount: '2000000',
      quantity: '50',
      date: pastDate,
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-PT-017: Track recommendation with long notes', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1500000',
      notes: 'This is a long note describing the investment decision and rationale for tracking this recommendation from the portfolio health score analysis.',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-PT-018: Modal accessible on mobile viewport', async ({ recommendationsPage }) => {
    await recommendationsPage.page.setViewportSize({ width: 375, height: 667 });

    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModalTitle).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-PT-019: Modal accessible on tablet viewport', async ({ recommendationsPage }) => {
    await recommendationsPage.page.setViewportSize({ width: 768, height: 1024 });

    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModalTitle).toBeVisible();
  });

  test('REC-PT-020: Keyboard navigation works in modal', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.page.keyboard.press('Tab');
    await recommendationsPage.page.keyboard.press('Tab');
    await recommendationsPage.page.keyboard.press('Escape');

    await expect(recommendationsPage.trackModalTitle).not.toBeVisible();
  });
});
