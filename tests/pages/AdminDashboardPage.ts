import { type Page, type Locator } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly aumCard: Locator;
  readonly activeUsersCard: Locator;
  readonly totalProductsCard: Locator;
  readonly auditEventsCard: Locator;
  readonly chartContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('h1');
    this.aumCard = page.locator('div').filter({ hasText: /Assets Under Management|AUM/i }).first();
    this.activeUsersCard = page.locator('div').filter({ hasText: /Active Users/i }).first();
    this.totalProductsCard = page.locator('div').filter({ hasText: /Total Products/i }).first();
    this.auditEventsCard = page.locator('div').filter({ hasText: /Audit Events/i }).first();
    this.chartContainer = page.locator('.recharts-responsive-container');
  }

  async goto() {
    await this.page.goto('/admin');
  }
}
