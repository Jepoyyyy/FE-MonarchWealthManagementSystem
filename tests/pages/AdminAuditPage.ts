import type { Page, Locator } from '@playwright/test';

export class AdminAuditPage {
  readonly page: Page;

  // Search
  readonly searchInput: Locator;
  readonly searchClearButton: Locator;

  // Category filters
  readonly allCategoryButton: Locator;
  readonly authCategoryButton: Locator;
  readonly goalCategoryButton: Locator;
  readonly assetCategoryButton: Locator;
  readonly productCategoryButton: Locator;
  readonly userCategoryButton: Locator;
  readonly riskProfileCategoryButton: Locator;
  readonly financesCategoryButton: Locator;

  // Table
  readonly auditTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  // Detail drawer
  readonly detailDrawer: Locator;
  readonly drawerCloseButton: Locator;
  readonly drawerTitle: Locator;
  readonly drawerContent: Locator;
  readonly fieldChangesSection: Locator;

  // Pagination
  readonly paginationContainer: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly pageInfo: Locator;

  constructor(page: Page) {
    this.page = page;

    // Search
    this.searchInput = page.getByPlaceholder('Search audit logs...');
    this.searchClearButton = page.getByRole('button', { name: /clear/i });

    // Category filters - using getByRole for buttons with text
    this.allCategoryButton = page.getByRole('button', { name: 'All' });
    this.authCategoryButton = page.getByRole('button', { name: 'AUTH' });
    this.goalCategoryButton = page.getByRole('button', { name: 'GOAL' });
    this.assetCategoryButton = page.getByRole('button', { name: 'ASSET' });
    this.productCategoryButton = page.getByRole('button', { name: 'PRODUCT' });
    this.userCategoryButton = page.getByRole('button', { name: 'USER' });
    this.riskProfileCategoryButton = page.getByRole('button', { name: 'RISK_PROFILE' });
    this.financesCategoryButton = page.getByRole('button', { name: 'FINANCES' });

    // Table
    this.auditTable = page.getByRole('table');
    this.tableHeaders = this.auditTable.getByRole('columnheader');
    this.tableRows = this.auditTable.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    this.loadingSpinner = page.getByTestId('loading-spinner');
    this.emptyState = page.getByText(/no audit logs found/i);

    // Detail drawer
    this.detailDrawer = page.getByTestId('audit-detail-drawer');
    this.drawerCloseButton = this.detailDrawer.getByRole('button', { name: /close/i }).first();
    this.drawerTitle = this.detailDrawer.getByRole('heading');
    this.drawerContent = this.detailDrawer.locator('[data-testid="drawer-content"]');
    this.fieldChangesSection = this.detailDrawer.locator('[data-testid="field-changes"]');

    // Pagination
    this.paginationContainer = page.getByTestId('pagination');
    this.prevPageButton = this.paginationContainer.getByRole('button', { name: /previous/i });
    this.nextPageButton = this.paginationContainer.getByRole('button', { name: /next/i });
    this.pageInfo = this.paginationContainer.getByTestId('page-info');
  }

  async goto() {
    await this.page.goto('/admin/audit');
    await this.page.waitForLoadState('networkidle');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce (400ms)
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch() {
    await this.searchClearButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCategory(category: 'All' | 'AUTH' | 'GOAL' | 'ASSET' | 'PRODUCT' | 'USER' | 'RISK_PROFILE' | 'FINANCES') {
    const buttonMap = {
      'All': this.allCategoryButton,
      'AUTH': this.authCategoryButton,
      'GOAL': this.goalCategoryButton,
      'ASSET': this.assetCategoryButton,
      'PRODUCT': this.productCategoryButton,
      'USER': this.userCategoryButton,
      'RISK_PROFILE': this.riskProfileCategoryButton,
      'FINANCES': this.financesCategoryButton,
    };

    await buttonMap[category].click();
    await this.page.waitForLoadState('networkidle');
  }

  async openDetailByRow(rowIndex: number) {
    const row = this.tableRows.nth(rowIndex);
    await row.click();
    await this.detailDrawer.waitFor({ state: 'visible' });
  }

  async closeDetail() {
    await this.drawerCloseButton.click();
    await this.detailDrawer.waitFor({ state: 'hidden' });
  }

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPrevPage() {
    await this.prevPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getAuditLogCount() {
    await this.page.waitForSelector('table tbody tr:not([data-testid="loading-spinner"])', { timeout: 10000 }).catch(() => {});
    return await this.tableRows.count();
  }

  async getAuditLogByIndex(index: number) {
    await this.page.waitForSelector('table tbody tr:not([data-testid="loading-spinner"])', { timeout: 10000 }).catch(() => {});
    const row = this.tableRows.nth(index);
    const cells = row.locator('td');

    return {
      timestamp: (await cells.nth(0).textContent())?.trim() || '',
      user: (await cells.nth(1).textContent())?.trim() || '',
      action: (await cells.nth(2).textContent())?.trim() || '',
      details: (await cells.nth(3).textContent())?.trim() || '',
      category: (await cells.nth(4).textContent())?.trim() || '',
    };
  }

  async getPageInfo() {
    const text = await this.pageInfo.textContent();
    return text?.trim() || '';
  }

  async waitForLoading() {
    await this.loadingSpinner.waitFor({ state: 'visible' });
    await this.loadingSpinner.waitFor({ state: 'hidden' });
  }

  async isEmptyStateVisible() {
    return await this.emptyState.isVisible();
  }

  async getDetailDrawerTitle() {
    return await this.drawerTitle.textContent();
  }

  async getFieldChanges() {
    const changes = await this.fieldChangesSection.locator('[data-testid="field-change"]').all();
    const result = [];

    for (const change of changes) {
      const field = await change.locator('[data-testid="field-name"]').textContent();
      const oldValue = await change.locator('[data-testid="old-value"]').textContent();
      const newValue = await change.locator('[data-testid="new-value"]').textContent();

      result.push({ field, oldValue, newValue });
    }

    return result;
  }

  async isCategoryButtonActive(category: 'All' | 'AUTH' | 'GOAL' | 'ASSET' | 'PRODUCT' | 'USER' | 'RISK_PROFILE' | 'FINANCES') {
    const buttonMap = {
      'All': this.allCategoryButton,
      'AUTH': this.authCategoryButton,
      'GOAL': this.goalCategoryButton,
      'ASSET': this.assetCategoryButton,
      'PRODUCT': this.productCategoryButton,
      'USER': this.userCategoryButton,
      'RISK_PROFILE': this.riskProfileCategoryButton,
      'FINANCES': this.financesCategoryButton,
    };

    const button = buttonMap[category];
    const classList = await button.getAttribute('class');
    return classList?.includes('active') || classList?.includes('selected') || false;
  }

  async isPrevPageButtonDisabled() {
    return await this.prevPageButton.isDisabled();
  }

  async isNextPageButtonDisabled() {
    return await this.nextPageButton.isDisabled();
  }
}
