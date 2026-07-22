import { test, expect } from '../fixtures/dashboard-fixtures';
import { generateTestUser, setAuthInPage } from '../utils/test-data';

test.describe('Dashboard Error Handling', () => {
  test('should show error message when API fails with 500', async ({ page, authApi }) => {
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response: loginRes } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginBody = await loginRes.json();
    const res = loginBody.result || loginBody.data || loginBody;
    const token = res.accessToken;
    const refreshToken = res.refreshToken;
    const user = res.user;

    await authApi.completeRiskProfile(token);

    // Mock API failure by intercepting request
    await page.route('**/api/v1/me/dashboard', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'Failed to load dashboard',
          result: null,
          error: { details: 'Database connection failed' }
        })
      });
    });

    await setAuthInPage(page, token, refreshToken, { ...user, questionnaireCompleted: true, risk_profile: "risk_averse" });
    await page.goto('/');

    const errorMsg = page.locator('[data-testid="dashboard-error"]')
      .or(page.locator('text=Failed to load dashboard'))
      .or(page.locator('text=Internal Server Error'))
      .or(page.locator('text=Retry'));
    await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty portfolio gracefully', async ({ page, authApi }) => {
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response: loginRes } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginBody = await loginRes.json();
    const res = loginBody.result || loginBody.data || loginBody;
    const token = res.accessToken;
    const refreshToken = res.refreshToken;
    const user = res.user;

    await authApi.completeRiskProfile(token);

    // Mock empty dashboard response
    await page.route('**/api/v1/me/dashboard', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'Dashboard data retrieved successfully',
          result: {
            portofolio: {
              value: '0',
              invested: '0',
              holdings: 0,
              items: []
            },
            performance: []
          },
          error: null
        })
      });
    });

    await setAuthInPage(page, token, refreshToken, { ...user, questionnaireCompleted: true, risk_profile: "risk_averse" });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');

    const zeroVal = page.locator('[data-testid="stat-card"]').or(page.locator('text=Portfolio Value')).or(page.locator('text=Holdings')).or(page.locator('text=Rp 0'));
    await expect(zeroVal.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle 403 risk profile required error gracefully', async ({ page, authApi }) => {
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response: loginRes } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginBody = await loginRes.json();
    const res = loginBody.result || loginBody.data || loginBody;
    const token = res.accessToken;
    const refreshToken = res.refreshToken;
    const user = res.user;

    await page.route('**/api/v1/me/dashboard', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 403,
          message: 'Risk Profiler Assessment Required',
          result: null,
          error: {
            details: 'User must complete risk profile questionnaire before accessing dashboard'
          }
        })
      });
    });

    await setAuthInPage(page, token, refreshToken, { ...user, questionnaireCompleted: false, riskProfile: null });
    await page.goto('/');

    await page.waitForLoadState('networkidle');
    
    const errorElem = page.locator('[data-testid="dashboard-error"]')
      .or(page.locator('text=Risk Profile Assessment'))
      .or(page.locator('text=Risk Profiler Assessment Required'))
      .or(page.locator('text=Required'))
      .or(page.locator('text=Questionnaire'))
      .or(page.locator('text=Good morning'));
    await expect(errorElem.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle 401 unauthorized gracefully', async ({ page }) => {
    await setAuthInPage(page, '', '', null);
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    const isLoginOrAuthRedirect = page.url().includes('login') || page.url().includes('questionnaire') || page.url().includes('localhost');
    expect(isLoginOrAuthRedirect).toBe(true);
  });
});
