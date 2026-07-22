import { test, expect } from '../fixtures/auth-fixtures';

test.describe('Refresh Access Token', () => {
  test('should refresh access token with valid refresh token', async ({
    registeredUser,
    authApi,
  }) => {
    const { response, duration } = await authApi.refresh(registeredUser.refreshToken);
    const body = await response.json();

    expect(response.status()).toBe(200);
    const res = body.result || body.data || body;
    expect(res).toBeDefined();

    expect(res.accessToken).toBeTruthy();
    expect(typeof res.accessToken).toBe('string');
    expect(res.refreshToken).toBeTruthy();
    expect(typeof res.refreshToken).toBe('string');

    // Verify new token is returned
    expect(res.accessToken).toBeTruthy();

    // Performance assertion - Token refresh should be fast
    expect(duration).toBeLessThan(1500);
    console.log(`Token refresh completed in ${duration}ms`);
  });

  test('should fail with invalid refresh token', async ({ authApi }) => {
    const { response } = await authApi.refresh('invalid-token');
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.code).toBe(401);
  });

  test('should fail with missing refresh token in body', async ({ authApi }) => {
    const { response } = await authApi.refresh({});
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
    const fields = body.error?.fields || body.details || [];
    const target = fields.find((f: any) => f.field.toLowerCase().includes('refreshtoken'));
    expect(target).toBeDefined();
    expect(typeof target.reason === 'string' && target.reason.length > 0).toBe(true);
  });

  test('should fail with empty refresh token string', async ({ authApi }) => {
    const { response } = await authApi.refresh('');
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });

  test('should fail with missing request body', async ({ authApi }) => {
    const { response } = await authApi.refresh(null);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });
});
