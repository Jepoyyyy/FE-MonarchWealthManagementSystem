import { test, expect } from './fixtures/ui-auth-fixtures';
import { INVALID_PASSWORDS } from '../utils/test-data';

test.describe('Password Validation Rules (PV01 - PV05)', () => {

  test('PV01: Enforce minimum 8 characters requirement', async ({ registerPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'PV01' });

    await registerPage.goto();
    await registerPage.register(
      'Short Pass User',
      `user${Date.now()}@example.com`,
      INVALID_PASSWORDS.tooShort,
      INVALID_PASSWORDS.tooShort
    );

    await expect(registerPage.errorMessage).toBeVisible();
    await expect(registerPage.errorMessage).toContainText(/at least 8 characters/i);
  });

  test('PV04: Allow complex passwords with special characters', async ({ page, registerPage, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'PV04' });

    const complexPass = 'P@ssw0rd_!#$%^&*()_+~';
    const email = `complex${Date.now()}@example.com`;

    await registerPage.goto();
    await registerPage.register('Complex User', email, complexPass, complexPass);

    // Wait for redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
    
    // Login with registered credentials
    await loginPage.login(email, complexPass);

    await expect(page.getByText(/risk profile assessment/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('PV05: Allow international & unicode characters in passwords', async ({ page, registerPage, loginPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'PV05' });

    const unicodePass = 'Pässwörd123🔑🛡️';
    const email = `unicode${Date.now()}@example.com`;

    await registerPage.goto();
    await registerPage.register('Unicode User', email, unicodePass, unicodePass);

    // Wait for redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
    
    // Login with registered credentials
    await loginPage.login(email, unicodePass);

    await expect(page.getByText(/risk profile assessment/i).first()).toBeVisible({ timeout: 15000 });
  });
});
