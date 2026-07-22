import { test, expect } from '../fixtures/dashboard-fixtures';
import { generateTestUser, setAuthInPage } from '../utils/test-data';
import { API_BASE_URL } from '../utils/api-client';

test.describe('Dashboard Performance Benchmarks', () => {
  test('user dashboard API should respond within 2 seconds', async ({ page, authApi }) => {
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response: loginRes } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginBody = await loginRes.json();
    const res = loginBody.result || loginBody.data || loginBody;
    const token = res.accessToken;

    // Complete risk profile so user can fetch dashboard
    await authApi.completeRiskProfile(token);

    // Warm-up call
    await page.request.get(`${API_BASE_URL}/me/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    // Benchmark: 5 calls
    const timings: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const response = await page.request.get(`${API_BASE_URL}/me/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const duration = Date.now() - start;
      timings.push(duration);
      expect(response.status()).toBe(200);
    }

    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    const maxTime = Math.max(...timings);
    
    console.log(`User Dashboard API Performance:
      Average: ${avgTime.toFixed(0)}ms
      Max: ${maxTime}ms
      All timings: ${timings.join(', ')}ms`);

    expect(avgTime).toBeLessThan(2000);
    expect(maxTime).toBeLessThan(3000);
  });

  test('user dashboard page should load within 4 seconds', async ({ page, authApi }) => {
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

    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;

    console.log(`User Dashboard Page Load: ${duration}ms`);
    expect(duration).toBeLessThan(4000);
  });
});
