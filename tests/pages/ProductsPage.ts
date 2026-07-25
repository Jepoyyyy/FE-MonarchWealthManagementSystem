import { type Page, type Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly typeFilter: Locator;
  readonly showHighRiskToggle: Locator;
  readonly loadingSkeleton: Locator;
  readonly productCards: Locator;
  readonly emptyState: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /explore products/i });
    this.searchInput = page.getByPlaceholder(/search by product name or issuer/i);
    this.typeFilter = page.locator('select').filter({ hasText: /all types/i });
    this.showHighRiskToggle = page.getByText(/show high risk/i);
    this.loadingSkeleton = page.locator('[data-testid="products-loading"]');
    this.productCards = page.locator('.bg-card').filter({ hasText: /annual return/i });
    this.emptyState = page.getByText(/no products match/i);
    this.nextButton = page.getByRole('button', { name: /next/i });
    this.prevButton = page.getByRole('button', { name: /previous/i });
    this.successToast = page.getByRole('region', { name: /notifications/i }).getByText(/investment tracked/i).first();
  }

  async goto() {
    await this.page.goto('/products');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  async waitForProductsToLoad() {
    await this.loadingSkeleton.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // debounce + API
  }

  async filterByType(type: string) {
    const select = this.page.locator('select').first();
    await select.selectOption(type);
    await this.page.waitForTimeout(500); // Wait for filter to apply
  }

  async toggleHighRisk() {
    await this.showHighRiskToggle.click();
    await this.page.waitForTimeout(500);
  }

  async clickTrackOnFirstProduct() {
    const firstCard = this.productCards.first();
    await firstCard.getByRole('button', { name: /track in portfolio/i }).click();
  }
}
