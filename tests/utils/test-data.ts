import type { Page } from '@playwright/test';

export const generateTestUser = (suffix = Date.now()) => ({
  name: `Test User ${suffix}`,
  email: `testuser${suffix}@example.com`,
  password: 'SecurePass123!',
});

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
  await page.addInitScript((data) => {
    window.localStorage.setItem('wms-auth', JSON.stringify(data));
  }, payload);
}
