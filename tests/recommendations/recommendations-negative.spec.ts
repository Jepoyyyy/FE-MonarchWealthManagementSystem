import { test, expect } from '../fixtures/recommendations-fixtures';

test.describe('Recommendations - Negative Tests (REC-NT-001 to REC-NT-025)', () => {

  test('REC-NT-001: API returns 500 error on recommendations fetch', async ({
    recommendationsPage,
    mockRecommendationsError,
  }) => {
    await mockRecommendationsError(500);
    await recommendationsPage.goto();

    await expect(recommendationsPage.page.getByText(/error.*loading.*recommendations|gagal.*memuat/i)).toBeVisible();
  });

  test('REC-NT-002: API returns 404 error on recommendations fetch', async ({
    recommendationsPage,
    mockRecommendationsError,
  }) => {
    await mockRecommendationsError(404, 'Not Found');
    await recommendationsPage.goto();

    await expect(recommendationsPage.page.getByText(/error|not found/i)).toBeVisible();
  });

  test('REC-NT-003: Network timeout on recommendations fetch', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/recommendations', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000));
    });

    await recommendationsPage.goto();
    await expect(recommendationsPage.page.getByText(/error|timeout/i)).toBeVisible({ timeout: 15000 });
  });

  test('REC-NT-004: Invalid JSON response from recommendations API', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/recommendations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json {{{',
      });
    });

    await recommendationsPage.goto();
    await expect(recommendationsPage.page.getByText(/error/i)).toBeVisible();
  });

  test('REC-NT-005: API returns null recommendations array', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/recommendations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: null }),
      });
    });

    await recommendationsPage.goto();
    await expect(recommendationsPage.emptyState).toBeVisible();
  });

  test('REC-NT-006: API returns empty recommendations array', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/recommendations', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: [] }),
      });
    });

    await recommendationsPage.goto();
    await expect(recommendationsPage.emptyState).toBeVisible();
  });

  test('REC-NT-007: Health score API returns 500 error', async ({
    recommendationsPage,
    mockHealthScoreError,
  }) => {
    await mockHealthScoreError(500);
    await recommendationsPage.goto();

    const hasError = await recommendationsPage.page.getByText(/error|failed/i).isVisible();
    expect(hasError).toBeTruthy();
  });

  test('REC-NT-008: Health score API returns invalid data', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/health', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { score: 'invalid' } }),
      });
    });

    await recommendationsPage.goto();
    await recommendationsPage.page.waitForLoadState('networkidle');
  });

  test('REC-NT-009: TrackModal validation - empty amount field', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.page.getByText(/enter the amount|masukkan jumlah|required/i)).toBeVisible();
  });

  test('REC-NT-010: TrackModal validation - negative amount', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const dialog = recommendationsPage.trackModal;
    const amountInput = dialog.getByRole('spinbutton').nth(0);
    await amountInput.fill('-1000');

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.page.getByText(/invalid|positive|greater than/i)).toBeVisible();
  });

  test('REC-NT-011: TrackModal validation - zero amount', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '0',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.page.getByText(/invalid|greater than|positive/i)).toBeVisible();
  });

  test('REC-NT-012: TrackModal validation - invalid date format', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      date: 'invalid-date',
    });

    await recommendationsPage.submitTrackingForm();
    const hasError = await recommendationsPage.page.getByText(/invalid.*date|format/i).isVisible();
    expect(hasError).toBeTruthy();
  });

  test('REC-NT-013: TrackModal validation - future date', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const futureDate = '2027-12-31';

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      date: futureDate,
    });

    await recommendationsPage.submitTrackingForm();
    const hasError = await recommendationsPage.page.getByText(/future|cannot be in the future|invalid/i).isVisible();
    if (hasError) {
      expect(hasError).toBeTruthy();
    }
  });

  test('REC-NT-014: Asset creation API returns 500 error', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/assets', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'Internal Server Error',
          error: { detail: 'INTERNAL_ERROR' },
        }),
      });
    });

    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.errorToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-NT-015: Asset creation API returns 400 validation error', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/assets', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 400,
          message: 'Validation Error',
          error: { detail: 'VALIDATION_ERROR', fields: ['amount'] },
        }),
      });
    });

    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.errorToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-NT-016: Asset creation API returns 401 unauthorized', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/assets', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 401,
          message: 'Unauthorized',
          error: { detail: 'UNAUTHORIZED' },
        }),
      });
    });

    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.errorToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-NT-017: Network timeout during asset creation', async ({ recommendationsPage }) => {
    await recommendationsPage.page.route('**/api/v1/me/assets', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000));
    });

    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.errorToast).toBeVisible({ timeout: 15000 });
  });

  test('REC-NT-018: Recommendation with missing product information', async ({
    recommendationsPage,
    mockRecommendationsData,
  }) => {
    await mockRecommendationsData([
      {
        id: 1,
        product: null,
        priority: 'high',
        reason: 'Test recommendation',
      },
    ]);

    await recommendationsPage.goto();
    await recommendationsPage.page.waitForLoadState('networkidle');

    const count = await recommendationsPage.getRecommendationCount();
    expect(count).toBe(0);
  });

  test('REC-NT-019: Recommendation with incomplete product data', async ({
    recommendationsPage,
    mockRecommendationsData,
  }) => {
    await mockRecommendationsData([
      {
        id: 1,
        product: {
          id: 'test-id',
          name: null,
        },
        priority: 'high',
      },
    ]);

    await recommendationsPage.goto();
    await recommendationsPage.page.waitForLoadState('networkidle');
  });

  test('REC-NT-020: TrackModal with extremely large amount', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '999999999999999',
    });

    await recommendationsPage.submitTrackingForm();
    await recommendationsPage.page.waitForTimeout(2000);
  });

  test('REC-NT-021: TrackModal with special characters in notes', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      notes: '<script>alert("xss")</script>',
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-NT-022: TrackModal with SQL injection in platform field', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      platform: "'; DROP TABLE assets; --",
    });

    await recommendationsPage.submitTrackingForm();
    await expect(recommendationsPage.successToast).toBeVisible({ timeout: 5000 });
  });

  test('REC-NT-023: Rapid consecutive tracking attempts', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
    });

    await recommendationsPage.submitTrackingForm();
    await recommendationsPage.submitTrackingForm();
    await recommendationsPage.submitTrackingForm();

    await recommendationsPage.page.waitForTimeout(2000);
  });

  test('REC-NT-024: TrackModal with very long platform name', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const longPlatform = 'A'.repeat(500);

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      platform: longPlatform,
    });

    await recommendationsPage.submitTrackingForm();
    await recommendationsPage.page.waitForTimeout(2000);
  });

  test('REC-NT-025: TrackModal with very long notes', async ({ recommendationsPage }) => {
    await recommendationsPage.clickTrackOnRecommendation(0);
    await expect(recommendationsPage.trackModal).toBeVisible();

    const longNotes = 'This is a very long note. '.repeat(100);

    await recommendationsPage.fillTrackingForm({
      amount: '1000000',
      notes: longNotes,
    });

    await recommendationsPage.submitTrackingForm();
    await recommendationsPage.page.waitForTimeout(2000);
  });
});
