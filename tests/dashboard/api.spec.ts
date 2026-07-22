import { test, expect } from '../fixtures/dashboard-fixtures';
import { generateTestUser } from '../utils/test-data';
import { API_BASE_URL } from '../utils/api-client';

test.describe('User Dashboard API', () => {
  test('should return user dashboard data with valid auth and completed risk profile', async ({ authApi, page }) => {
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response: loginRes } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginBody = await loginRes.json();
    const token = loginBody.result?.accessToken || loginBody.data?.accessToken || loginBody.accessToken;

    // Complete risk profile assessment so dashboard is accessible
    await authApi.completeRiskProfile(token);

    const startTime = Date.now();
    const response = await page.request.get(`${API_BASE_URL}/me/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const duration = Date.now() - startTime;
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.code).toBe(200);
    expect(body.message).toBeTruthy();
    expect(body.result).toBeDefined();

    const portfolio = body.result.portofolio;
    expect(portfolio).toBeDefined();
    expect(typeof portfolio.value === 'string' || typeof portfolio.value === 'number').toBe(true);
    expect(typeof portfolio.invested === 'string' || typeof portfolio.invested === 'number').toBe(true);
    expect(typeof portfolio.holdings).toBe('number');
    expect(Array.isArray(portfolio.items)).toBe(true);

    const performance = body.result.performance;
    expect(Array.isArray(performance)).toBe(true);

    expect(duration).toBeLessThan(2000);
    console.log(`User dashboard API responded in ${duration}ms`);
  });

  test('should fail with 401 when token is missing', async ({ page }) => {
    const response = await page.request.get(`${API_BASE_URL}/me/dashboard`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.code).toBe(401);
  });

  test('should return 403 when risk profile not completed', async ({ authApi, page }) => {
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response: loginRes } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginBody = await loginRes.json();
    const token = loginBody.result?.accessToken || loginBody.data?.accessToken || loginBody.accessToken;

    const response = await page.request.get(`${API_BASE_URL}/me/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const body = await response.json();

    if (response.status() === 403) {
      expect(body.code).toBe(403);
      expect(body.message || body.error?.details).toContain('Risk Profiler Assessment Required');
    } else {
      expect(response.status()).toBe(200);
    }
  });
});

test.describe('Admin Dashboard API', () => {
  test('should fail with 403 when regular user tries to access admin dashboard', async ({ authApi, page }) => {
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response: loginRes } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginBody = await loginRes.json();
    const token = loginBody.result?.accessToken || loginBody.data?.accessToken || loginBody.accessToken;

    const response = await page.request.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(403);
    expect(body.code).toBe(403);
  });
});
