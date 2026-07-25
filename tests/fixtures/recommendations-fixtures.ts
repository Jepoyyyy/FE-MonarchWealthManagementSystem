import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { RecommendationsPage } from '../pages/RecommendationsPage';
import { AssetsPage } from '../pages/AssetsPage';
import { setAuthInPage, highTestUser } from '../utils/test-data';
import { AuthApiClient, API_BASE_URL } from '../utils/api-client';

type RecommendationsFixtures = {
  recommendationsPage: RecommendationsPage;
  assetsPage: AssetsPage;
  accessToken: string;
  loginResponse: any;
  clearAssets: () => Promise<void>;
  mockRecommendationsError: (status?: number, message?: string) => Promise<void>;
  mockRecommendationsData: (recommendations: any[], healthScore?: any) => Promise<void>;
  mockHealthScoreError: (status?: number, message?: string) => Promise<void>;
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

export const test = base.extend<RecommendationsFixtures>({
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
    await fn();
    await use(fn);
  },

  recommendationsPage: async ({ page, loginResponse, clearAssets }, use) => {
    const userObj = {
      id: loginResponse.user.id,
      email: loginResponse.user.email,
      name: loginResponse.user.name,
      role: loginResponse.user.isAdmin ? 'admin' : 'user',
      questionnaireCompleted: loginResponse.user.questionnaireCompleted,
      riskProfile: loginResponse.user.risk_profile || 'aggressive',
    };

    await setAuthInPage(page, loginResponse.accessToken, loginResponse.refreshToken || loginResponse.accessToken, userObj);

    const recommendationsPage = new RecommendationsPage(page);
    await recommendationsPage.goto();
    await use(recommendationsPage);
  },

  assetsPage: async ({ page, loginResponse }, use) => {
    const userObj = {
      id: loginResponse.user.id,
      email: loginResponse.user.email,
      name: loginResponse.user.name,
      role: loginResponse.user.isAdmin ? 'admin' : 'user',
      questionnaireCompleted: loginResponse.user.questionnaireCompleted,
      riskProfile: loginResponse.user.risk_profile || 'aggressive',
    };

    await setAuthInPage(page, loginResponse.accessToken, loginResponse.refreshToken || loginResponse.accessToken, userObj);

    const assetsPage = new AssetsPage(page);
    await use(assetsPage);
  },

  mockRecommendationsError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Internal Server Error') => {
      await page.route('**/api/v1/me/recommendations', async (route) => {
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

  mockHealthScoreError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Internal Server Error') => {
      await page.route('**/api/v1/me/health', async (route) => {
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

  mockRecommendationsData: async ({ page }, use) => {
    const fn = async (recommendations: any[], healthScore?: any) => {
      await page.route('**/api/v1/me/recommendations', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: recommendations,
          }),
        });
      });

      if (healthScore) {
        await page.route('**/api/v1/me/health', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 200,
              result: healthScore,
            }),
          });
        });
      }
    };
    await use(fn);
  },
});

export { expect };
