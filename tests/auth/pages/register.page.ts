import type { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signUpButton: Locator;
  readonly signInLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder('Budi Santoso')
      .or(page.getByLabel(/name/i));
    this.emailInput = page.getByPlaceholder('you@example.com')
      .or(page.locator('input[type="email"]'));
    this.passwordInput = page.getByPlaceholder('Min. 8 characters')
      .or(page.locator('input[type="password"]').first());
    this.confirmPasswordInput = page.getByPlaceholder('Repeat password')
      .or(page.locator('input[type="password"]').nth(1));
    this.signUpButton = page.getByRole('button', { name: /create account/i })
      .or(page.getByRole('button', { name: /sign up/i }));
    this.signInLink = page.getByRole('button', { name: /sign in/i })
      .or(page.getByRole('link', { name: /sign in/i }));
    this.errorMessage = page.locator('form p.text-red-500, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/register');
    const signUpLink = this.page.getByRole('button', { name: /create one/i });
    if (await signUpLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signUpLink.click();
    }
  }

  async register(name: string, email: string, password: string, confirmPassword?: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
    await this.signUpButton.click();
  }

  async navigateToLogin() {
    await this.signInLink.click();
  }
}
