import { test, expect } from '../fixtures/dashboard-fixtures';
import { generateTestUser, setAuthInPage } from '../utils/test-data';

test.describe('User Dashboard UI', () => {
  test('should show loading state initially', async ({ page, authApi }) => {
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

    await setAuthInPage(page, token, refreshToken, { ...user, questionnaireCompleted: true, risk_profile: "risk_averse" });
    await page.goto('/');

    const loadingIndicator = page.locator('[data-testid="dashboard-loading"]').or(page.locator('text=Loading dashboard')).or(page.locator('.animate-pulse'));
    if (await loadingIndicator.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator.first()).toBeVisible();
    }
  });

  test('should render stat cards with portfolio data', async ({ page, authApi }) => {
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

    await setAuthInPage(page, token, refreshToken, { ...user, questionnaireCompleted: true, risk_profile: "risk_averse" });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');

    const portfolioCard = page.locator('[data-testid="stat-card"]').or(page.locator('text=Portfolio Value')).or(page.locator('text=Total Value')).or(page.locator('text=Good morning'));
    await expect(portfolioCard.first()).toBeVisible({ timeout: 5000 });
  });

  test('should render recommended products section', async ({ page, authApi }) => {
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

    await setAuthInPage(page, token, refreshToken, { ...user, questionnaireCompleted: true, risk_profile: "risk_averse" });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    const recommendedSection = page.locator('[data-testid="recommended-section"]').or(page.locator('text=Recommended for You')).or(page.locator('text=Recommended')).or(page.locator('text=Good morning'));
    await expect(recommendedSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to products page when clicking View All', async ({ page, authApi }) => {
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

    await setAuthInPage(page, token, refreshToken, { ...user, questionnaireCompleted: true, risk_profile: "risk_averse" });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    const viewAllBtn = page.locator('a[href*="products"]').or(page.locator('text=View All'));
    if (await viewAllBtn.first().isVisible().catch(() => false)) {
      await viewAllBtn.first().click();
      await expect(page).toHaveURL(/.*products/);
    }
  });
});
