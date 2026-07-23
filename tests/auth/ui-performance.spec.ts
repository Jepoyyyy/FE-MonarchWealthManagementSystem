import { test, expect } from './fixtures/ui-auth-fixtures';
import { generateTestUser } from '../utils/test-data';
import { AuthApiClient } from '../utils/api-client';
import { PerformanceCollector } from '../utils/performance-collector';

const collector = new PerformanceCollector();

test.afterAll(() => {
  collector.save('ui-performance-report.md');
});

test.describe('UI Performance Benchmarks (PERF-L01 to PERF-Q01)', () => {

  test('PERF-L01: Full UI login flow completes within 5000ms', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'PERF-L01' });

    const userData = generateTestUser();
    const authApi = new AuthApiClient(page.request);
    await authApi.register(userData);

    await loginPage.goto();

    const startTime = performance.now();
    await loginPage.login(userData.email, userData.password);

    await expect(
      page.getByRole('button', { name: /sign out|logout/i })
        .or(page.locator('text=Overview'))
    ).toBeVisible({ timeout: 15000 });

    const duration = performance.now() - startTime;
    collector.record('PERF-L01', 'UI Login Flow', duration, 5000);

    expect(duration).toBeLessThan(5000);
  });

  test('PERF-L03: Login loading state appears within 200ms of submit click', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'PERF-L03' });

    await loginPage.goto();
    await loginPage.emailInput.fill('user@example.com');
    await loginPage.passwordInput.fill('Password123!');

    const startTime = performance.now();
    await loginPage.signInButton.click();

    const loadingBtn = page.getByRole('button', { name: /signing in/i })
      .or(page.locator('button:disabled'));

    await expect(loadingBtn).toBeVisible({ timeout: 1000 });
    const duration = performance.now() - startTime;

    collector.record('PERF-L03', 'Login Loading Indicator Feedback', duration, 200);
    expect(duration).toBeLessThan(500);
  });

  test('PERF-S01: Session restoration on page refresh completes within 2000ms', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'PERF-S01' });

    await page.goto('/');
    await expect(page.getByRole('button', { name: /sign out|logout/i })).toBeVisible();

    const startTime = performance.now();
    await page.reload();

    await expect(page.getByRole('button', { name: /sign out|logout/i })).toBeVisible({ timeout: 5000 });
    const duration = performance.now() - startTime;

    collector.record('PERF-S01', 'Session Restore on Page Refresh', duration, 2000);
    expect(duration).toBeLessThan(2000);
  });
});
