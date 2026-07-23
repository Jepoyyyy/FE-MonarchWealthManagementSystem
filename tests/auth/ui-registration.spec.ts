import { test, expect } from './fixtures/ui-auth-fixtures';
import { generateTestUser, INVALID_EMAILS } from '../utils/test-data';
import { AuthApiClient } from '../utils/api-client';

test.describe('Registration Flow - UI (R01 - R10)', () => {

  test('R01: Valid registration → redirects to login with success toast', async ({ page, registerPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'R01' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    const userData = generateTestUser();
    await registerPage.goto();
    await registerPage.register(userData.name, userData.email, userData.password, userData.password);

    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/registration successful/i)).toBeVisible();
  });

  test('R03 & R04: Toggle navigation between Sign Up and Sign In views', async ({ registerPage, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'R03-R04' });

    await loginPage.goto();
    await loginPage.navigateToRegister();
    await expect(registerPage.signUpButton).toBeVisible();

    await registerPage.navigateToLogin();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('R05: Duplicate email → Error message displayed', async ({ page, registerPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'R05' });

    const userData = generateTestUser();
    const authApi = new AuthApiClient(page.request);
    await authApi.register(userData);

    await registerPage.goto();
    await registerPage.register(
      'Duplicate User',
      userData.email,
      userData.password,
      userData.password
    );

    await expect(registerPage.errorMessage).toBeVisible();
  });

  test('R06: Invalid email format → Validation error', async ({ registerPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'R06' });

    await registerPage.goto();
    await registerPage.register(
      'Test User',
      INVALID_EMAILS[0],
      'SecurePass123!',
      'SecurePass123!'
    );

    const validity = await registerPage.emailInput.evaluate((el: HTMLInputElement) => ({
      valid: el.validity.valid,
      typeMismatch: el.validity.typeMismatch,
    }));
    expect(validity.valid).toBe(false);
    expect(validity.typeMismatch).toBe(true); // malformed, not empty

    await expect(registerPage.emailInput).toBeFocused();
  });

  test('R08 & R09: Password mismatch → Error message', async ({ registerPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'R08-R09' });

    await registerPage.goto();
    await registerPage.register(
      'Test User',
      `user${Date.now()}@example.com`,
      'SecurePass123!',
      'DifferentPass123!'
    );

    await expect(registerPage.errorMessage).toBeVisible();
    await expect(registerPage.errorMessage).toContainText(/do not match/i);
  });
});
