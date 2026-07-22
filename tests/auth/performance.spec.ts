import { test, expect } from '../fixtures/auth-fixtures';
import { generateTestUser } from '../utils/test-data';
import { PerformanceReporter } from '../utils/performance-report';
import fs from 'fs';
import path from 'path';

test.describe('Authentication Performance Tests', () => {
  let reporter: PerformanceReporter;

  test.beforeEach(() => {
    reporter = new PerformanceReporter();
  });

  test.afterAll(() => {
    // Save performance report
    const reportPath = path.join('test-results', 'performance-report.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reporter.generateReport());
    console.log(`Performance report saved to ${reportPath}`);
  });

  test('registration endpoint performance', async ({ authApi }) => {
    const userData = generateTestUser();
    const { response, duration } = await authApi.register(userData);

    expect(response.status()).toBe(201);
    expect(duration).toBeLessThan(1000);

    reporter.recordMetric('POST /auth/register', duration, 1000);
    console.log(`Registration: ${duration}ms`);
  });

  test('login endpoint performance', async ({ authApi }) => {
    const userData = generateTestUser();
    await authApi.register(userData);

    const { response, duration } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(1000);

    reporter.recordMetric('POST /auth/login', duration, 1000);
    console.log(`Login: ${duration}ms`);
  });

  test('logout endpoint performance', async ({ registeredUser, authApi }) => {
    const { response, duration } = await authApi.logout(registeredUser.accessToken);

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(1000);

    reporter.recordMetric('POST /auth/logout', duration, 1000);
    console.log(`Logout: ${duration}ms`);
  });

  test('refresh token endpoint performance', async ({ registeredUser, authApi }) => {
    const { response, duration } = await authApi.refresh(registeredUser.refreshToken);

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(1000);

    reporter.recordMetric('POST /auth/refresh', duration, 1000);
    console.log(`Token refresh: ${duration}ms`);
  });

  test('sequential auth flow performance', async ({ authApi }) => {
    const userData = generateTestUser();

    // Full auth flow
    const startTime = Date.now();

    // 1. Register
    const { response: registerResp } = await authApi.register(userData);
    expect(registerResp.status()).toBe(201);

    // 2. Login
    const { response: loginResp } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    expect(loginResp.status()).toBe(200);
    const loginData = await loginResp.json();
    const res = loginData.result || loginData.data || loginData;

    // 3. Refresh
    const { response: refreshResp } = await authApi.refresh(res.refreshToken);
    expect(refreshResp.status()).toBe(200);

    // 4. Logout
    const { response: logoutResp } = await authApi.logout(res.accessToken);
    expect(logoutResp.status()).toBe(200);

    const totalDuration = Date.now() - startTime;

    expect(totalDuration).toBeLessThan(3000);
    reporter.recordMetric('Full Auth Flow (Register→Login→Refresh→Logout)', totalDuration, 3000);
    console.log(`Full auth flow: ${totalDuration}ms`);
  });
});
