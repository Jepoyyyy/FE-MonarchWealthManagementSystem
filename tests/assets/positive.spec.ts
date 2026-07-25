import { test, expect } from '../fixtures/assets-fixtures';

let cachedProducts: any[] | null = null;


async function setupAndOpenAssetDetail(assetsPage: any, createRealAssets: any, request: any, accessToken: string) {
  await createRealAssets([
    {
      productId: 1,
      amount: 10000000,
      quantity: 100,
      purchaseDate: '2026-01-15',
      platform: 'Platform A',
    }
  ]);
  if (!cachedProducts) {
    const productsResponse = await request.get('http://localhost:8080/api/v1/products', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const productsBody = await productsResponse.json();
    cachedProducts = productsBody.result?.content || productsBody.content || [];
  }

  const products = cachedProducts!;
  const targetProduct = products[0];

  await assetsPage.goto();
  await assetsPage.waitForAssetsToLoad();
  await assetsPage.page.locator('tbody tr').first().click();
  await expect(assetsPage.page.getByText(/loading product details/i)).toBeHidden();
  return targetProduct;
}

test.describe('Assets Page - Positive Tests (PT-001 to PT-020)', () => {

  test('PT-001: Authenticated user can access /user/assets page', async ({ assetsPage }) => {
    await expect(assetsPage.portfolioHeading).toBeVisible();
  });

  test('PT-003: Empty state displays when user has no assets', async ({ assetsPage }) => {
    // clearAssets fixture already cleared all assets before test
    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();

    await expect(assetsPage.emptyStateMessage).toBeVisible();
    await expect(assetsPage.trackInvestmentButton).toBeVisible();
  });

  test('PT-005: Asset table displays all columns correctly', async ({ assetsPage, createRealAssets }) => {
    await createRealAssets([
      {
        productId: 1,
        amount: 10000000,
        quantity: 100,
        purchaseDate: '2026-01-15',
        platform: 'Platform A',
      }
    ]);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();

    // Check table headers
    await expect(assetsPage.productColumn).toBeVisible();
    await expect(assetsPage.qtyColumn).toBeVisible();
    await expect(assetsPage.platformColumn).toBeVisible();
    await expect(assetsPage.dateColumn).toBeVisible();
    await expect(assetsPage.costBasisColumn).toBeVisible();
    await expect(assetsPage.currentValueColumn).toBeVisible();
    await expect(assetsPage.pnlColumn).toBeVisible();

    // Check platform data
    await expect(assetsPage.page.getByText('Platform A')).toBeVisible();
  });

  test('PT-006: Click "Track Investment" opens modal', async ({ assetsPage }) => {
    await assetsPage.openTrackInvestmentModal();
    await expect(assetsPage.modal).toBeVisible();
    await expect(assetsPage.modal.getByRole('heading', { name: 'Choose a Product' })).toBeVisible();
  });

  test('PT-007: Click asset row opens detail page inline', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    await expect(assetsPage.page.getByText(/back to my assets/i)).toBeVisible();
  });

  test('PT-008: Asset detail page displays product information', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    const product = await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    await expect(assetsPage.page.getByRole('heading', { name: product.name }).first()).toBeVisible();
    await expect(assetsPage.page.locator('p', { hasText: product.issuer })).toBeVisible();
  });

  test('PT-009: Asset detail page displays stat cards', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    const product = await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    await expect(assetsPage.page.getByText(/total invested/i)).toBeVisible();

    const isStock = product.type === "Stock";
    const isMF = product.type === "Mutual Fund" || product.type === "Money Market" || product.type === "Balanced Fund";
    const isBond = product.type === "Bond" || product.type === "Sukuk";
    const expectedQtyLabel = isStock ? "Owned Lot" : isMF ? "Owned Units" : isBond ? "Nominal Pokok" : "Quantity";

    await expect(assetsPage.page.getByText(expectedQtyLabel)).toBeVisible();
    await expect(assetsPage.page.getByText(/average value/i)).toBeVisible();
    await expect(assetsPage.page.getByText(/current value/i)).toBeVisible();
  });

  test('PT-010: Asset detail page displays P&L section', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    await expect(assetsPage.page.getByText(/profit.*loss/i)).toBeVisible();
    await expect(assetsPage.page.getByText(/unrealized/i)).toBeVisible();
  });

  test('PT-011: "Buy / Top Up" button opens transaction modal', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    await assetsPage.page.getByRole('button', { name: /buy.*top up/i }).click();
    await expect(assetsPage.modal).toBeVisible();
  });

  test('PT-012: "Sell / Redeem" button opens transaction modal', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    await assetsPage.page.getByRole('button', { name: /sell.*redeem/i }).click();
    await expect(assetsPage.modal).toBeVisible();
  });

  test('PT-014: Save button enables when changes detected', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    // 1. Create a real goal via API
    const goalRes = await request.post('http://localhost:8080/api/v1/me/goals', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: 'Test Goal',
        type: 'retirement',
        target_amount: 100000000,
        monthly_contribution: 1000000,
        target_date: '2030-12-31',
        is_priority: false,
        current_amount: 0,
        notes: 'Test'
      }
    });
    if (!goalRes.ok()) {
      console.error('Goal creation failed:', goalRes.status(), await goalRes.text());
    }
    expect(goalRes.ok()).toBe(true);
    const goalBody = await goalRes.json();
    const createdGoal = goalBody.result || goalBody.data || goalBody;

    // 2. Setup asset and open asset detail page
    await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    const saveButton = assetsPage.page.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeDisabled();

    // 3. Make a change by selecting the newly created goal
    await assetsPage.page.getByRole('combobox', { name: /goal/i }).click();
    await assetsPage.page.getByRole('option', { name: new RegExp(createdGoal.name, 'i') }).first().click();

    // 4. Verify save button is enabled
    await expect(saveButton).toBeEnabled();

    // 5. Clean up the created goal via DELETE api
    await request.delete(`http://localhost:8080/api/v1/me/goals/${createdGoal.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  });

  test('PT-015: Transaction history table displays', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    await expect(assetsPage.page.getByText(/transaction history/i)).toBeVisible();
    await expect(assetsPage.page.getByRole('columnheader', { name: /date/i })).toBeVisible();
    await expect(assetsPage.page.getByRole('columnheader', { name: /action/i })).toBeVisible();
  });

  test('PT-016: Delete asset button displays with confirmation', async ({ assetsPage, createRealAssets, request, accessToken }) => {
    await setupAndOpenAssetDetail(assetsPage, createRealAssets, request, accessToken);
    const deleteButton = assetsPage.page.getByRole('button', { name: /remove asset|delete|remove/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(assetsPage.confirmDialog).toBeVisible();
    await expect(assetsPage.page.getByText(/confirm.*delete/i)).toBeVisible();
  });

  test('PT-018: Mutual Fund asset displays units with decimals', async ({ assetsPage, createRealAssets }) => {
    await createRealAssets([
      {
        productId: 2,
        amount: 5000000,
        quantity: 1250.5678,
        purchaseDate: '2026-01-10',
        platform: 'Platform B',
      }
    ]);

    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();

    // Should display with decimal precision
    await expect(assetsPage.page.getByText(/1250.*5678/)).toBeVisible();
  });
});
