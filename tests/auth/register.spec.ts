import { test, expect } from '../fixtures/auth-fixtures';
import { generateTestUser } from '../utils/test-data';

test.describe('User Registration', () => {
  test('should register user with valid data and assign USER role by default', async ({ authApi }) => {
    const userData = generateTestUser();

    const { response, duration } = await authApi.register(userData);
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.result === null || body.data === null).toBe(true);

    // Business Rule 6: New users are assigned USER role by default (isAdmin === false)
    const { response: loginResp } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    expect(loginResp.status()).toBe(200);
    const loginBody = await loginResp.json();
    const user = loginBody.result?.user || loginBody.data?.user || loginBody.user;
    expect(user.isAdmin).toBe(false);

    // Performance assertion
    expect(duration).toBeLessThan(1500);
    console.log(`Registration completed in ${duration}ms`);
  });

  test('should fail when name is missing', async ({ authApi }) => {
    const { response } = await authApi.register({
      name: '',
      email: 'test@example.com',
      password: 'SecurePass123!',
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
    const fields = body.error?.fields || body.details || [];
    const target = fields.find((f: any) => f.field.toLowerCase().includes('name'));
    expect(target).toBeDefined();
    expect(typeof target.reason === 'string' && target.reason.length > 0).toBe(true);
  });

  test('should fail when email is missing', async ({ authApi }) => {
    const userData = generateTestUser();
    const { response } = await authApi.register({
      ...userData,
      email: '',
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
    const userData = generateTestUser();
    const { response } = await authApi.register({
      ...userData,
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

  test('should fail when password is less than 8 characters', async ({ authApi }) => {
    const userData = generateTestUser();
    const { response } = await authApi.register({
      ...userData,
      password: 'Pass1',
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
    const fields = body.error?.fields || body.details || [];
    const target = fields.find((f: any) => f.field.toLowerCase().includes('password'));
    expect(target).toBeDefined();
    expect(typeof target.reason === 'string' && target.reason.length > 0).toBe(true);
  });

  test('should fail when password is more than 72 characters', async ({ authApi }) => {
    const userData = generateTestUser();
    const { response } = await authApi.register({
      ...userData,
      password: 'P'.repeat(73),
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });

  test('should fail with invalid email format', async ({ authApi }) => {
    const userData = generateTestUser();
    const { response } = await authApi.register({
      ...userData,
      email: 'notanemail',
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });

  test('should fail when email already exists', async ({ authApi }) => {
    const userData = generateTestUser();

    // First registration
    await authApi.register(userData);

    // Duplicate registration
    const { response } = await authApi.register(userData);
    const body = await response.json();

    expect(response.status()).toBe(409);
    expect(body.code).toBe(409);
    const msg = body.error || body.message;
    expect(typeof msg === 'string' || typeof msg === 'object').toBe(true);
  });

  test('should fail with missing request body', async ({ authApi }) => {
    const { response } = await authApi.register(null);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.code).toBe(400);
  });
});
