import type { Page } from '@playwright/test';

export const generateTestUser = (suffix = Date.now()) => ({
  name: `Test User ${suffix}`,
  email: `testuser${suffix}@example.com`,
  password: 'SecurePass123!',
});

export const highTestUser = () => ({
  name: `high`,
  email: `high@mail.com`,
  password: `User123!`
})

export const VALID_TEST_USER = {
  name: 'John Doe',
  email: 'john.doe.test@example.com',
  password: 'SecurePassword123',
};

export const INVALID_PASSWORDS = {
  tooShort: 'Pass1',        // < 8 chars
  tooLong: 'P'.repeat(73),  // > 72 chars
  empty: '',
};

export const INVALID_EMAILS = [
  'notanemail',
  'missing@domain',
  '@nodomain.com',
  'spaces in@email.com',
];

export const QUESTIONNAIRE_ANSWERS = {
  riskAverse: [
    { questionnaireAnswer: "Protect my capital — I cannot afford to lose money", score: 0 },
    { questionnaireAnswer: "Less than 1 year — I need liquidity soon", score: 0 },
    { questionnaireAnswer: "Sell everything to stop further losses", score: 0 },
    { questionnaireAnswer: "Less than 10% — only comfortable surplus", score: 0 },
    { questionnaireAnswer: "No experience — this is my first time investing", score: 0 }
  ],
  balanced: [
    { questionnaireAnswer: "Balanced growth — moderate risk for moderate returns", score: 5 },
    { questionnaireAnswer: "3 to 5 years — medium term horizon", score: 5 },
    { questionnaireAnswer: "Hold firm and wait for market recovery", score: 5 },
    { questionnaireAnswer: "10% to 25% — moderate allocation", score: 5 },
    { questionnaireAnswer: "Moderate experience — familiar with basic investments", score: 5 }
  ],
  aggressive: [
    { questionnaireAnswer: "Maximum growth — high risk for high returns", score: 10 },
    { questionnaireAnswer: "More than 5 years — long term growth", score: 10 },
    { questionnaireAnswer: "Buy more at discounted prices", score: 10 },
    { questionnaireAnswer: "More than 25% — aggressive investment", score: 10 },
    { questionnaireAnswer: "Experienced investor — active market knowledge", score: 10 }
  ],
};

export const ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRODUCTS: '/admin/products',
  PRODUCTS: '/products',
  ASSETS: '/assets',
  GOALS: '/goals',
};

export async function setAuthInPage(page: Page, token: string, refreshToken?: string, user?: any) {
  const payload = {
    state: {
      token: token,
      refreshToken: refreshToken || token,
      user: {
        id: user?.id || "test-user-id",
        name: user?.name || "Test User",
        email: user?.email || "test@example.com",
        role: user?.isAdmin ? "admin" : (user?.role || "user"),
        status: user?.status || "active",
        riskProfile: user?.riskProfile || user?.risk_profile || "risk_averse",
        questionnaireCompleted: user?.questionnaireCompleted ?? true,
        createdAt: new Date().toISOString(),
        totalAssets: 0,
      }
    },
    version: 0
  };
  await page.goto('/login');
  await page.evaluate((data) => {
    window.localStorage.setItem('wms-auth', JSON.stringify(data));
  }, payload);
}

