import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly loadingSpinner: Locator;
  readonly errorAlert: Locator;
  readonly retryButton: Locator;
  readonly greetingHeader: Locator;
  readonly changeRiskProfileBtn: Locator;
  readonly recommendedSection: Locator;
  readonly viewAllProductsBtn: Locator;
  readonly confirmModal: Locator;
  readonly retakeAssessmentBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loadingSpinner = page.getByTestId('dashboard-loading');
    this.errorAlert = page.getByTestId('dashboard-error');
    this.retryButton = page.getByRole('button', { name: /retry/i });
    this.greetingHeader = page.locator('h1');
    this.changeRiskProfileBtn = page.getByRole('button', { name: /change risk profile/i });
    this.recommendedSection = page.getByTestId('recommended-section');
    this.viewAllProductsBtn = page.getByRole('button', { name: /view all/i });
    this.confirmModal = page.locator('[role="dialog"]').or(page.locator('.fixed.inset-0'));
    this.retakeAssessmentBtn = page.getByRole('button', { name: /retake assessment/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  getStatCard(label: string): Locator {
    return this.page.locator('div').filter({ hasText: label }).first();
  }
}
