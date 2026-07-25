import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { AssetsPage } from '../pages/AssetsPage';
import { setAuthInPage, highTestUser } from '../utils/test-data';
import { AuthApiClient, API_BASE_URL } from '../utils/api-client';

type AssetsFixtures = {
  assetsPage: AssetsPage;
  mockAssetsError: (status?: number, message?: string) => Promise<void>;
  mockAssetsData: (assets: any[], pnl: any[], progress?: any[]) => Promise<void>;
  createRealAssets: (assets: any[]) => Promise<any[]>;
  clearAssets: () => Promise<void>;
  accessToken: string;
  loginResponse: any;
};

async function clearUserAssets(request: APIRequestContext, accessToken: string) {
  const response = await request.get(`${API_BASE_URL}/me/assets`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.ok()) {
    const body = await response.json();
    const assets = body.result || body.data || body || [];
    for (const asset of assets) {
      await request.delete(`${API_BASE_URL}/me/assets/${asset.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  }
}

export const test = base.extend<AssetsFixtures>({
  loginResponse: async ({ request }: { request: APIRequestContext }, use: (r: any) => Promise<void>) => {
    const authApi = new AuthApiClient(request);
    const credentials = highTestUser();
    const { response } = await authApi.login({
      email: credentials.email,
      password: credentials.password,
    });

    if (!response.ok()) {
      throw new Error(`Login failed with status ${response.status()}`);
    }

    const body = await response.json();
    const res = body.result || body.data || body;
    await use(res);
  },

  accessToken: async ({ loginResponse }, use) => {
    await use(loginResponse.accessToken);
  },

  clearAssets: async ({ request, accessToken }, use) => {
    const fn = async () => {
      await clearUserAssets(request, accessToken);
    };
    // Run cleanup before test
    await fn();
    await use(fn);
  },

  assetsPage: async ({ page, loginResponse, clearAssets }, use) => {
    const userObj = {
      id: loginResponse.user.id,
      email: loginResponse.user.email,
      name: loginResponse.user.name,
      role: loginResponse.user.isAdmin ? 'admin' : 'user',
      questionnaireCompleted: loginResponse.user.questionnaireCompleted,
      riskProfile: loginResponse.user.risk_profile || 'aggressive',
    };

    // Inject real authentication token and credentials into browser session
    await setAuthInPage(page, loginResponse.accessToken, loginResponse.refreshToken || loginResponse.accessToken, userObj);

    const assetsPage = new AssetsPage(page);
    await assetsPage.goto();
    await assetsPage.waitForAssetsToLoad();

    await use(assetsPage);
  },

  mockAssetsError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Internal Server Error') => {
      await page.route('**/api/v1/me/assets', async (route) => {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({
            code: status,
            message,
            error: { detail: 'INTERNAL_ERROR' },
          }),
        });
      });
      await page.route('**/api/v1/me/assets/pnl', async (route) => {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({
            code: status,
            message,
            error: { detail: 'INTERNAL_ERROR' },
          }),
        });
      });
    };
    await use(fn);
  },

  mockAssetsData: async ({ page }, use) => {
    const fn = async (assets: any[], pnl: any[], progress: any[] = []) => {
      await page.route('**/api/v1/me/assets', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: assets,
          }),
        });
      });
      await page.route('**/api/v1/me/assets/pnl', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: pnl,
          }),
        });
      });
      await page.route('**/api/v1/me/goals/progress', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: progress,
          }),
        });
      });
      await page.route('**/api/v1/me/goals', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: [],
          }),
        });
      });
    };
    await use(fn);
  },

  createRealAssets: async ({ request, accessToken }, use) => {
    const fn = async (assets: any[]) => {
      const createdAssets = [];

      // Get the real products from the backend first to get their UUIDs
      const productsResponse = await request.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!productsResponse.ok()) {
        throw new Error(`Failed to fetch products: ${productsResponse.status()}`);
      }
      const productsBody = await productsResponse.json();
      const products = productsBody.result?.content || productsBody.content || [];

      for (const asset of assets) {
        // Map the asset's productId (1-based index) to a real product UUID
        const targetProduct = products[asset.productId - 1] || products[0];
        if (!targetProduct) {
          throw new Error(`No products available in the database to map productId ${asset.productId}`);
        }

        // Format purchase date to yyyy-MM-dd HH:mm:ss
        let purchaseDateStr = asset.purchaseDate || asset.purchase_date;
        if (purchaseDateStr) {
          if (!purchaseDateStr.includes(' ')) {
            purchaseDateStr = `${purchaseDateStr} 00:00:00`;
          }
        } else {
          purchaseDateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }

        // Create the asset via POST request to the real backend
        const payload = {
          product_id: targetProduct.id,
          units: asset.quantity || asset.units,
          amount: asset.amount,
          purchase_date: purchaseDateStr,
          platform: asset.platform,
        };

        const response = await request.post(`${API_BASE_URL}/me/assets`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: payload,
        });

        if (response.ok()) {
          const body = await response.json();
          const createdAsset = body.result || body.data || body;
          createdAssets.push(createdAsset);
        } else {
          const errorBody = await response.text();
          throw new Error(`Failed to create asset: ${response.status()} - ${errorBody}`);
        }
      }

      return createdAssets;
    };
    await use(fn);
  },
});

export { expect };
