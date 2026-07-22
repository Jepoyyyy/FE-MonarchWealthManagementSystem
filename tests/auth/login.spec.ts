import { test, expect } from '../fixtures/auth-fixtures';
import { generateTestUser } from '../utils/test-data';

test.describe('User Login', () => {
  test('should login with valid credentials', async ({ authApi }) => {
    // Setup: Register a user first
    const userData = generateTestUser();
    await authApi.register(userData);

    // Login
    const { response, duration } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    const res = body.result || body.data || body;
    expect(res).toBeDefined();
    expect(res.accessToken).toBeTruthy();
    expect(typeof res.accessToken).toBe('string');
    expect(res.refreshToken).toBeTruthy();
    expect(typeof res.refreshToken).toBe('string');

    // Verify user data
    const user = res.user;
    expect(user).toBeDefined();
    expect(user.id).toBeTruthy();
    expect(user.email.toLowerCase()).toBe(userData.email.toLowerCase());
    expect(typeof user.isAdmin).toBe('boolean');

    // Performance assertion
    expect(duration).toBeLessThan(1500);
    console.log(`Login completed in ${duration}ms`);
  });

  test('should login with case-insensitive email lookup or return appropriate response', async ({ authApi }) => {
    const userData = generateTestUser();
    await authApi.register(userData);

    // Login using uppercase email version
    const upperEmail = userData.email.toUpperCase();
    const { response } = await authApi.login({
      email: upperEmail,
      password: userData.password,
    });
    const body = await response.json();

    expect([200, 400, 401]).toContain(response.status());
    if (response.status() === 200) {
      const res = body.result || body.data || body;
      expect(res.accessToken).toBeTruthy();
    }
  });

  test('should fail with wrong password', async ({ authApi }) => {
    const userData = generateTestUser();
    await authApi.register(userData);

    const { response } = await authApi.login({
      email: userData.email,
      password: 'WrongPassword123!',
    });
    const body = await response.json();

    expect([400, 401]).toContain(response.status());
    expect([400, 401]).toContain(body.code || response.status());
  });

  test('should fail with non-existent email', async ({ authApi }) => {
    const { response } = await authApi.login({
      email: 'nonexistent@example.com',
      password: 'Password123!',
    });
    const body = await response.json();

    expect([400, 401]).toContain(response.status());
    expect([400, 401]).toContain(body.code || response.status());
  });

  test('should fail when email is missing', async ({ authApi }) => {
    const { response } = await authApi.login({
      email: '',
      password: 'Password123!',
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
    const fields = body.error?.fields || body.details || [];
    const target = fields.find((f: any) => f.field.toLowerCase().includes('email'));
    expect(target).toBeDefined();
    expect(typeof target.reason === 'string' && target.reason.length > 0).toBe(true);
  });

  test('should fail when password is missing', async ({ authApi }) => {
    const { response } = await authApi.login({
      email: 'test@example.com',
      password: '',
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
    const fields = body.error?.fields || body.details || [];
    const target = fields.find((f: any) => f.field.toLowerCase().includes('password'));
    expect(target).toBeDefined();
    expect(typeof target.reason === 'string' && target.reason.length > 0).toBe(true);
  });

  test('should fail with password too short', async ({ authApi }) => {
    const { response } = await authApi.login({
      email: 'test@example.com',
      password: 'Pass1',
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });

  test('should fail with password too long (>72 characters)', async ({ authApi }) => {
    const { response } = await authApi.login({
      email: 'test@example.com',
      password: 'P'.repeat(73),
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });

  test('should fail with missing request body', async ({ authApi }) => {
    const { response } = await authApi.login(null);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });
});
