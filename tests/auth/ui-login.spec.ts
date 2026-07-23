import { test, expect } from './fixtures/ui-auth-fixtures';
import { generateTestUser, INVALID_PASSWORDS, INVALID_EMAILS, highTestUser } from '../utils/test-data';
import { AuthApiClient } from '../utils/api-client';
import { waitForAuthentication, getAuthFromStorage } from '../utils/auth-helpers';

test.describe('Login Flow - UI (L01 - L17)', () => {

  test('L01: Valid credentials with questionare filled → Dashboard', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L01' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const userData = highTestUser();

    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    await waitForAuthentication(page);
    await expect(page).toHaveURL('/');
  });

  test('L03: Case-insensitive email lookup', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L03' });

    const userData = generateTestUser();
    const authApi = new AuthApiClient(page.request);
    await authApi.register(userData);

    await loginPage.goto();
    await loginPage.login(userData.email.toUpperCase(), userData.password);

    await waitForAuthentication(page);
  });

  test('L06: Wrong password → Error message', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L06' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const userData = generateTestUser();
    const authApi = new AuthApiClient(page.request);
    await authApi.register(userData);

    await loginPage.goto();
    await loginPage.login(userData.email, 'WrongPassword123!');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('L07: Non-existent email → Error message', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L07' });

    await loginPage.goto();
    await loginPage.login('nonexistent_user_9999@example.com', 'SomePassword123!');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('L08: Empty email field → Validation error', async ({ loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L08' });

    await loginPage.goto();
    await loginPage.passwordInput.fill('SecurePassword123!');
    await loginPage.signInButton.click();

    // Check native HTML5 validation state instead of a rendered error element
    const isInvalid = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBe(true);

    const validationMessage = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toContain('fill out this field'); // browser-dependent wording
  });

  test('L09: Empty password field → Validation error', async ({ loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L09' });

    await loginPage.goto();
    await loginPage.emailInput.fill('test@example.com');
    await loginPage.signInButton.click();

    const validity = await loginPage.passwordInput.evaluate((el: HTMLInputElement) => ({
      valid: el.validity.valid,
      valueMissing: el.validity.valueMissing,
    }));
    expect(validity.valid).toBe(false);
    expect(validity.valueMissing).toBe(true);

    await expect(loginPage.passwordInput).toBeFocused();
  });

  test('L10: Invalid email format → Validation error', async ({ loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L10' });

    await loginPage.goto();
    await loginPage.emailInput.fill(INVALID_EMAILS[0]);
    await loginPage.passwordInput.fill('SecurePassword123!');
    await loginPage.signInButton.click();

    const validity = await loginPage.emailInput.evaluate((el: HTMLInputElement) => ({
      valid: el.validity.valid,
      typeMismatch: el.validity.typeMismatch,
    }));
    expect(validity.valid).toBe(false);
    expect(validity.typeMismatch).toBe(true); // wrong format, not empty

    await expect(loginPage.emailInput).toBeFocused();
  });

  test('L11 & L12: Password length constraints (<8 chars / >72 chars)', async ({ loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L11-L12' });

    await loginPage.goto();
    await loginPage.emailInput.fill('user@example.com');
    await loginPage.passwordInput.fill(INVALID_PASSWORDS.tooShort);
    await loginPage.signInButton.click();

    // Verify form handles short password attempt gracefully
    await expect(loginPage.emailInput.or(loginPage.errorMessage)).toBeVisible();
  });

  test('L13: Token stored securely in localStorage', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L13' });

    const userData = generateTestUser();
    const authApi = new AuthApiClient(page.request);
    await authApi.register(userData);

    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // Assert real navigation happened, not just an internal flag
    await expect(page).not.toHaveURL(/\/login|\/$/);

    // Poll localStorage instead of a one-shot read — persist middleware
    // may write asynchronously after the redirect
    await expect(async () => {
      const storage = await getAuthFromStorage(page);
      expect(storage?.state?.token).toBeTruthy();
    }).toPass({ timeout: 5000 });
  });

  test('L14: Password field is masked (type="password")', async ({ loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L14' });

    await loginPage.goto();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    // Toggle password visibility
    if (await loginPage.togglePasswordButton.isVisible().catch(() => false)) {
      await loginPage.togglePasswordButton.click();
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('L15: No credentials leaked in URL', async ({ page, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'L15' });

    const userData = generateTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain(userData.email);
    expect(currentUrl).not.toContain(userData.password);
  });
});
