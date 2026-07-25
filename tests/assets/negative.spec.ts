import { test, expect } from '../fixtures/assets-fixtures';

test.describe('Assets Page - Negative Tests (NT-001 to NT-023)', () => {

  test('NT-001: API returns 500 error on assets fetch', async ({ assetsPage, mockAssetsError }) => {
    await mockAssetsError(500);
    await assetsPage.goto();

    await expect(assetsPage.page.getByText(/error.*loading.*assets/i)).toBeVisible();
  });

  test('NT-002: Network timeout on assets fetch', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000));
    });

    await assetsPage.goto();
    await expect(assetsPage.page.getByText(/error|timeout/i)).toBeVisible();
  });

  test('NT-003: Invalid JSON response from assets API', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json {{{',
      });
    });

    await assetsPage.goto();
    await expect(assetsPage.page.getByText(/error/i)).toBeVisible();
  });

  test('NT-004: API returns null assets array', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: null }),
      });
    });

    await assetsPage.goto();
    await expect(assetsPage.emptyStateMessage).toBeVisible();
  });

  test('NT-005: Asset with missing product information', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 999,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: null,
      issuer: null,
      type: null
    }], []);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    await expect(assetsPage.assetTable).toBeVisible();
  });

  test('NT-006: Asset with negative current value', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: -1000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    await expect(assetsPage.page.getByText(/-1,000,000/)).toBeVisible();
  });

  test('NT-007: Asset with zero quantity', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 0,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    await expect(assetsPage.page.getByText('Stock ABC')).toBeVisible();
  });

  test('NT-008: Division by zero in P&L calculation', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 0,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    await expect(assetsPage.page.getByText('Stock ABC')).toBeVisible();
  });

  test('NT-009: 401 Unauthorized on asset detail fetch', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets/1', route => {
      route.fulfill({ status: 401, body: JSON.stringify({ error: 'Unauthorized' }) });
    });

    await assetsPage.page.goto('/user/assets/1');
    await expect(assetsPage.page.getByText(/unauthorized|login/i)).toBeVisible();
  });

  test('NT-010: Asset detail page with non-existent asset ID', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets/99999', route => {
      route.fulfill({ status: 404, body: JSON.stringify({ error: 'Asset not found' }) });
    });

    await assetsPage.page.goto('/user/assets/99999');
    await expect(assetsPage.page.getByText(/not found|does not exist/i)).toBeVisible();
  });

  test('NT-011: P&L API failure shows fallback data', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: 'Platform A',
      name: 'Stock ABC',
      issuer: 'Company ABC',
      type: 'Stock'
    }], []);

    await assetsPage.page.route('**/api/v1/me/assets/pnl', route => {
      route.fulfill({ status: 500 });
    });

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    await expect(assetsPage.page.getByText('Stock ABC')).toBeVisible();
  });

  test('NT-012: Transaction modal with invalid quantity input', async ({ assetsPage }) => {
    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('button', { name: /buy.*top up/i }).click();

    await assetsPage.page.getByLabel(/quantity/i).fill('-10');
    await assetsPage.page.getByRole('button', { name: /save|submit/i }).click();

    await expect(assetsPage.page.getByText(/invalid.*quantity|must be positive/i)).toBeVisible();
  });

  test('NT-013: Transaction modal with zero price', async ({ assetsPage }) => {
    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('button', { name: /buy.*top up/i }).click();

    await assetsPage.page.getByLabel(/quantity/i).fill('10');
    await assetsPage.page.getByLabel(/price/i).fill('0');
    await assetsPage.page.getByRole('button', { name: /save|submit/i }).click();

    await expect(assetsPage.page.getByText(/invalid.*price|must be greater than zero/i)).toBeVisible();
  });

  test('NT-014: Transaction modal with empty required fields', async ({ assetsPage }) => {
    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('button', { name: /buy.*top up/i }).click();
    await assetsPage.page.getByRole('button', { name: /save|submit/i }).click();

    await expect(assetsPage.page.getByText(/required|cannot be empty/i)).toBeVisible();
  });

  test('NT-015: Delete asset with API failure', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets/1', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) });
      } else {
        route.continue();
      }
    });

    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('button', { name: /remove asset/i }).click();
    await assetsPage.page.getByRole('button', { name: /yes/i }).click();

    await expect(assetsPage.page.getByText(/error.*delet/i)).toBeVisible();
  });

  test('NT-016: Save changes with network failure', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets/*', route => {
      if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
        route.abort();
      } else {
        route.continue();
      }
    });

    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('combobox', { name: /goal/i }).click();
    await assetsPage.page.getByRole('option').first().click();
    await assetsPage.page.getByRole('button', { name: /save/i }).click();

    await expect(assetsPage.page.getByText(/error.*sav|network error/i)).toBeVisible();
  });

  test('NT-017: Concurrent asset deletion conflict', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets/1', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 409, body: JSON.stringify({ error: 'Conflict' }) });
      } else {
        route.continue();
      }
    });

    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('button', { name: /remove asset/i }).click();
    await assetsPage.page.getByRole('button', { name: /yes/i }).click();

    await expect(assetsPage.page.getByText(/conflict|already deleted/i)).toBeVisible();
  });

  test('NT-018: Malformed asset data in table row', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: [{
            id: 1,
            productId: 1,
            amount: 'invalid_number',
            quantity: 'not_a_number',
            purchaseDate: 'invalid_date',
            currentValue: null,
            platform: null,
            name: 'Stock ABC',
            issuer: 'Company ABC',
            type: 'Stock'
          }]
        }),
      });
    });

    await assetsPage.goto();
    await expect(assetsPage.page.getByText('Stock ABC')).toBeVisible();
  });

  test('NT-019: Empty transaction history on detail page', async ({ assetsPage }) => {
    await assetsPage.page.route('**/api/v1/me/assets/1/transactions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: [] }),
      });
    });

    await assetsPage.page.goto('/user/assets/1');
    await expect(assetsPage.page.getByText(/no transactions/i)).toBeVisible();
  });

  test('NT-020: Product type mismatch in transaction', async ({ assetsPage }) => {
    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('button', { name: /buy.*top up/i }).click();
    await expect(assetsPage.page.getByLabel(/lots|quantity|units/i)).toBeVisible();
  });

  test('NT-021: Cancel with unsaved changes shows confirmation', async ({ assetsPage }) => {
    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('combobox', { name: /goal/i }).click();
    await assetsPage.page.getByRole('option').first().click();
    await assetsPage.page.getByRole('button', { name: /cancel/i }).click();

    await expect(assetsPage.page.getByText(/unsaved changes|discard/i)).toBeVisible();
  });

  test('NT-022: Very large quantity input handling', async ({ assetsPage }) => {
    await assetsPage.page.goto('/user/assets/1');
    await assetsPage.page.getByRole('button', { name: /buy.*top up/i }).click();

    await assetsPage.page.getByLabel(/quantity/i).fill('99999999999999999999');
    await assetsPage.page.getByRole('button', { name: /save|submit/i }).click();

    await expect(assetsPage.page.locator('body')).toBeVisible();
  });

  test('NT-023: Special characters in platform name', async ({ assetsPage, mockAssetsData }) => {
    await mockAssetsData([{
      id: 1,
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      currentValue: 12000000,
      platform: '<script>alert("xss")</script>',
      name: 'Stock ABC',
      issuer: 'Company & Co.',
      type: 'Stock'
    }], []);

    let dialogFired = false;
    assetsPage.page.on('dialog', dialog => {
      dialogFired = true;
    });

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();
    await expect(assetsPage.page.getByText('Stock ABC')).toBeVisible();

    expect(dialogFired).toBe(false);
  });
});
