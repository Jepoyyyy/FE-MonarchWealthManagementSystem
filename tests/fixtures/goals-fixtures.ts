import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { GoalsPage } from '../pages/GoalsPage';
import { setAuthInPage, highTestUser } from '../utils/test-data';
import { AuthApiClient, API_BASE_URL } from '../utils/api-client';

type GoalsFixtures = {
  goalsPage: GoalsPage;
  mockGoalsError: (status?: number, message?: string) => Promise<void>;
  mockGoalsData: (goals: any[], progress?: any[], projections?: any[]) => Promise<void>;
  createRealGoals: (goals: any[]) => Promise<any[]>;
  createFinancialProfile: (profile: any) => Promise<void>;
  clearGoals: () => Promise<void>;
  clearFinancialProfile: () => Promise<void>;
  accessToken: string;
  loginResponse: any;
};

async function clearUserGoals(request: APIRequestContext, accessToken: string) {
  const response = await request.get(`${API_BASE_URL}/me/goals`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.ok()) {
    const body = await response.json();
    const goals = body.result || body.data || body || [];
    for (const goal of goals) {
      await request.delete(`${API_BASE_URL}/me/goals/${goal.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  }
}

async function clearUserFinancialProfile(request: APIRequestContext, accessToken: string) {
  // Financial profile deletion might not be needed, but we can reset it to defaults
  await request.put(`${API_BASE_URL}/me/finances`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      monthly_income: 0,
      expense: {
        housing: 0,
        food: 0,
        transport: 0,
        utilities: 0,
        healthcare: 0,
        entertainment: 0,
        insurance: 0,
        other: 0,
      },
    },
  });
}

export const test = base.extend<GoalsFixtures>({
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

  clearGoals: async ({ request, accessToken }, use) => {
    await clearUserGoals(request, accessToken);
    await use(async () => {
      await clearUserGoals(request, accessToken);
    });
    await clearUserGoals(request, accessToken);
  },

  clearFinancialProfile: async ({ request, accessToken }, use) => {
    await use(async () => {
      await clearUserFinancialProfile(request, accessToken);
    });
  },

  goalsPage: async ({ page, accessToken }, use) => {
    await setAuthInPage(page, accessToken);
    const goalsPage = new GoalsPage(page);
    await goalsPage.goto();
    await goalsPage.waitForPageLoad();
    await use(goalsPage);
  },

  mockGoalsError: async ({ page }, use) => {
    await use(async (status = 500, message = 'Internal Server Error') => {
      await page.route('**/api/v1/me/goals*', (route) => {
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

  mockGoalsData: async ({ page }, use) => {
    await use(async (goals: any[], progress?: any[], projections?: any[]) => {
      // Mock goals list
      await page.route('**/api/v1/me/goals', (route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              result: goals,
              data: goals,
            }),
          });
        } else {
          route.continue();
        }
      });

      // Mock progress endpoint
      if (progress) {
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
      }

      // Mock projections endpoint
      if (projections) {
        await page.route('**/api/v1/me/goals/projections', (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              result: projections,
              data: projections,
            }),
          });
        });
      }
    });
  },

  createRealGoals: async ({ request, accessToken }, use) => {
    const createdGoals: any[] = [];

    await use(async (goals: any[]) => {
      await clearUserGoals(request, accessToken);
      for (const goal of goals) {
        const response = await request.post(`${API_BASE_URL}/me/goals`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          data: goal,
        });

        if (response.ok()) {
          const body = await response.json();
          const createdGoal = body.result || body.data || body;
          createdGoals.push(createdGoal);
        } else {
          throw new Error(`Failed to create goal: ${response.status()} ${await response.text()}`);
        }
      }

      return createdGoals;
    });

    // Cleanup after test
    for (const goal of createdGoals) {
      await request.delete(`${API_BASE_URL}/me/goals/${goal.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  },

  createFinancialProfile: async ({ request, accessToken }, use) => {
    await use(async (profile: any) => {
      const response = await request.put(`${API_BASE_URL}/me/finances`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          monthly_income: profile.monthlyIncome || profile.monthly_income || 0,
          expense: {
            housing: profile.housing || 0,
            food: profile.food || 0,
            transport: profile.transport || 0,
            utilities: profile.utilities || 0,
            healthcare: profile.healthcare || 0,
            entertainment: profile.entertainment || 0,
            insurance: profile.insurance || 0,
            other: profile.other || 0,
          },
        },
      });

      if (!response.ok()) {
        throw new Error(`Failed to create financial profile: ${response.status()} ${await response.text()}`);
      }
    });
  },
});

export { expect };

// Helper functions for test data
export function createGoalData(overrides?: Partial<any>) {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setMonth(targetDate.getMonth() + 12);

  return {
    name: 'Test Goal',
    type: 'savings',
    target_amount: 10000000,
    current_amount: 0,
    monthly_contribution: 1000000,
    target_date: targetDate.toISOString().split('T')[0],
    is_priority: false,
    notes: '',
    ...overrides,
  };
}

export function createFinancialProfileData(overrides?: Partial<any>) {
  return {
    monthlyIncome: 15000000,
    housing: 3000000,
    food: 2000000,
    transport: 1500000,
    utilities: 500000,
    healthcare: 500000,
    entertainment: 1000000,
    insurance: 1000000,
    other: 500000,
    ...overrides,
  };
}
