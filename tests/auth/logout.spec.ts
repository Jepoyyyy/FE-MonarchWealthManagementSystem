import { test, expect } from '../fixtures/auth-fixtures';

test.describe('User Logout', () => {
  test('should logout with valid access token', async ({ registeredUser, authApi }) => {
    const { response, duration } = await authApi.logout(registeredUser.accessToken);
    const body = await response.json();

    expect(response.status()).toBe(200);
    const res = body.result || body;
    expect(res).toBeDefined();
    if (res.success !== undefined) {
      expect(res.success).toBe(true);
    }

    // Performance assertion
    expect(duration).toBeLessThan(1500);
    console.log(`Logout completed in ${duration}ms`);
  });

  test('should logout without authorization header', async ({ authApi }) => {
    const { response, duration } = await authApi.logout();
    const body = await response.json();

    expect([200, 401]).toContain(response.status());
    const res = body.result || body;
    expect(res).toBeDefined();

    // Performance assertion
    expect(duration).toBeLessThan(1500);
  });

  test('should logout gracefully with expired or malformed token', async ({ authApi }) => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired';
    const { response, duration } = await authApi.logout(expiredToken);
    const body = await response.json();

    expect([200, 401]).toContain(response.status());
    const res = body.result || body;
    expect(res).toBeDefined();

    // Performance assertion
    expect(duration).toBeLessThan(1500);
  });
});
