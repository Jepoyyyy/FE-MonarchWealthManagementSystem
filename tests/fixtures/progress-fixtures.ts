import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { ProgressPage } from '../pages/ProgressPage';
import { setAuthInPage, highTestUser } from '../utils/test-data';
import { AuthApiClient, API_BASE_URL } from '../utils/api-client';

type ProgressFixtures = {
  progressPage: ProgressPage;
  mockProgressData: (progress: any[], assets?: any[], pnl?: any[]) => Promise<void>;
  mockProgressError: (endpoint?: string, status?: number, message?: string) => Promise<void>;
  mockEmptyProgress: () => Promise<void>;
  createTestProgress: (goalCount: number) => any[];
  createTestAssets: (count: number) => any[];
  createTestPnL: (assetIds: string[], productIds: string[]) => any[];
  accessToken: string;
  loginResponse: any;
};

export const test = base.extend<ProgressFixtures>({
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

  progressPage: async ({ page, accessToken }, use) => {
    await setAuthInPage(page, accessToken);
    const progressPage = new ProgressPage(page);
    await progressPage.goto();
    await progressPage.waitForPageLoad();
    await use(progressPage);
  },

  mockProgressData: async ({ page }, use) => {
    await use(async (progress: any[], assets?: any[], pnl?: any[]) => {
      // Mock goal progress endpoint
      await page.route('**/api/v1/me/goals/progress', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: progress,
            data: progress,
          }),
        });
      });

      // Mock assets endpoint
      if (assets) {
        await page.route('**/api/v1/me/assets', (route) => {
          if (route.request().method() === 'GET') {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                result: assets,
                data: assets,
              }),
            });
          } else {
            route.continue();
          }
        });
      }

      // Mock PnL endpoint
      if (pnl) {
        await page.route('**/api/v1/me/assets/pnl', (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              result: pnl,
              data: pnl,
            }),
          });
        });
      }
    });
  },

  mockProgressError: async ({ page }, use) => {
    await use(async (endpoint = 'progress', status = 500, message = 'Internal Server Error') => {
      const routePattern = endpoint === 'progress'
        ? '**/api/v1/me/goals/progress'
        : endpoint === 'assets'
        ? '**/api/v1/me/assets'
        : '**/api/v1/me/assets/pnl';

      await page.route(routePattern, (route) => {
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({
            error: message,
            message: message,
          }),
        });
      });
    });
  },

  mockEmptyProgress: async ({ page }, use) => {
    await use(async () => {
      await page.route('**/api/v1/me/goals/progress', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: [],
            data: [],
          }),
        });
      });
    });
  },

  createTestProgress: async ({}, use) => {
    await use((goalCount: number) => {
      const progress: any[] = [];
      for (let i = 1; i <= goalCount; i++) {
        progress.push({
          goal_id: `goal-${i}`,
          goal_name: `Test Goal ${i}`,
          goal_type: i === 1 ? 'retirement' : i === 2 ? 'savings' : 'vacation',
          target_amount: 10000000 * i,
          current_saved: 2000000 * i,
          monthly_contribution: 500000 * i,
          assigned_assets_count: i,
          total_potential_pnl: 150000 * i,
          total_potential_pnl_percent: 7.5,
          avg_monthly_growth: 150000 * i,
          projected_eta_months: Math.floor(48 / i),
          is_priority: i === 1,
        });
      }
      return progress;
    });
  },

  createTestAssets: async ({}, use) => {
    await use((count: number) => {
      const assets: any[] = [];
      const now = new Date();
      for (let i = 1; i <= count; i++) {
        const purchaseDate = new Date(now);
        purchaseDate.setMonth(purchaseDate.getMonth() - (6 * i));
        assets.push({
          id: `asset-${i}`,
          productId: `product-${i}`,
          userId: 'test-user',
          purchaseDate: purchaseDate.toISOString().split('T')[0],
          units: 100 * i,
          purchasePrice: 10000 * i,
          goalId: `goal-${i}`,
        });
      }
      return assets;
    });
  },

  createTestPnL: async ({}, use) => {
    await use((assetIds: string[], productIds: string[]) => {
      const pnl: any[] = [];
      for (let i = 0; i < assetIds.length; i++) {
        const units = 100 * (i + 1);
        const avgPrice = 10000 * (i + 1);
        const currentPrice = avgPrice * 1.075; // 7.5% gain
        pnl.push({
          assetId: assetIds[i],
          productId: productIds[i],
          units: units,
          avg_price: avgPrice,
          current_price: currentPrice,
          currentValue: units * currentPrice,
          potential_pnl: units * (currentPrice - avgPrice),
          potential_pnl_percent: 7.5,
        });
      }
      return pnl;
    });
  },
});

export { expect };

// Helper functions for test data
export function createProgressData(overrides?: Partial<any>) {
  return {
    goal_id: 'test-goal-1',
    goal_name: 'Test Goal',
    goal_type: 'savings',
    target_amount: 10000000,
    current_saved: 2000000,
    monthly_contribution: 500000,
    assigned_assets_count: 2,
    total_potential_pnl: 150000,
    total_potential_pnl_percent: 7.5,
    avg_monthly_growth: 150000,
    projected_eta_months: 16,
    is_priority: false,
    ...overrides,
  };
}

export function createAssetData(overrides?: Partial<any>) {
  const now = new Date();
  const purchaseDate = new Date(now);
  purchaseDate.setMonth(purchaseDate.getMonth() - 6);

  return {
    id: 'test-asset-1',
    productId: 'test-product-1',
    userId: 'test-user',
    purchaseDate: purchaseDate.toISOString().split('T')[0],
    units: 100,
    purchasePrice: 10000,
    goalId: 'test-goal-1',
    ...overrides,
  };
}

export function createPnLData(overrides?: Partial<any>) {
  const units = 100;
  const avgPrice = 10000;
  const currentPrice = avgPrice * 1.075;

  return {
    assetId: 'test-asset-1',
    productId: 'test-product-1',
    units: units,
    avg_price: avgPrice,
    current_price: currentPrice,
    currentValue: units * currentPrice,
    potential_pnl: units * (currentPrice - avgPrice),
    potential_pnl_percent: 7.5,
    ...overrides,
  };
}
