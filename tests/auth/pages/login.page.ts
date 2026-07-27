import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpLink: Locator;
  readonly errorMessage: Locator;
  readonly togglePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('you@example.com')
      .or(page.locator('input[type="email"]'));
    this.passwordInput = page.getByPlaceholder('Enter your password')
      .or(page.locator('input[type="password"]'));
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.signUpLink = page.getByRole('button', { name: /create one/i })
      .or(page.getByRole('link', { name: /sign up|create/i }));
    this.errorMessage = page.locator('form p.text-red-500');
    this.togglePasswordButton = page.locator('form button[type="button"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    // Wait for navigation away from login page OR error message
    await Promise.race([
      this.page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 5000 }).catch(() => {}),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    ]);
  }

  async navigateToRegister() {
    await this.signUpLink.click();
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible' });
  }
}
