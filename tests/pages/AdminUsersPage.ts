import type { Page, Locator } from '@playwright/test';

export class AdminUsersPage {
  readonly page: Page;

  // Header
  readonly headerTitle: Locator;
  readonly headerSubtitle: Locator;

  // Stat Cards
  readonly totalUsersCard: Locator;
  readonly activeUsersCard: Locator;
  readonly suspendedUsersCard: Locator;

  // Search and Filters
  readonly searchInput: Locator;
  readonly statusFilterSelect: Locator;

  // User Table
  readonly userTable: Locator;
  readonly tableRows: Locator;
  readonly loadingState: Locator;
  readonly emptyState: Locator;

  // Pagination
  readonly pagination: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;

  // User Detail Drawer
  readonly userDetailDrawer: Locator;
  readonly drawerCloseButton: Locator;
  readonly drawerUserName: Locator;
  readonly drawerUserEmail: Locator;

  // Confirm Modal
  readonly confirmModal: Locator;
  readonly confirmModalTitle: Locator;
  readonly confirmModalMessage: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.headerTitle = page.getByRole('heading', { name: /user management/i });
    this.headerSubtitle = page.getByText(/registered users/i);

    // Stat Cards
    this.totalUsersCard = page.locator('[data-testid="stat-card"]').filter({ hasText: 'Total Users' });
    this.activeUsersCard = page.locator('[data-testid="stat-card"]').filter({ hasText: 'Active' });
    this.suspendedUsersCard = page.locator('[data-testid="stat-card"]').filter({ hasText: 'Suspended' });

    // Search and Filters
    this.searchInput = page.getByPlaceholder(/search by name or email/i);
    this.statusFilterSelect = page.locator('select').filter({ hasText: /all statuses/i });

    // User Table
    this.userTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.loadingState = page.getByTestId('admin-users-loading');
    this.emptyState = page.getByText(/no users found/i);

    // Pagination
    this.pagination = page.locator('.pagination, [role="navigation"]').last();
    this.prevPageButton = page.getByRole('button', { name: /previous/i });
    this.nextPageButton = page.getByRole('button', { name: /next/i });

    // User Detail Drawer
    this.userDetailDrawer = page.getByRole('heading', { name: /user detail/i }).locator('../../..');
    this.drawerCloseButton = this.userDetailDrawer.getByRole('button', { name: /close|✕/i }).first();
    this.drawerUserName = this.userDetailDrawer.locator('h3');
    this.drawerUserEmail = this.userDetailDrawer.locator('p').first();

    // Confirm Modal
    this.confirmModal = page.locator('[role="dialog"], .modal').filter({ hasText: /suspend this user|activate this user/i });
    this.confirmModalTitle = this.confirmModal.getByRole('heading').first();
    this.confirmModalMessage = this.confirmModal.locator('p').first();
    this.confirmButton = this.confirmModal.getByRole('button', { name: /yes/i });
    this.cancelButton = this.confirmModal.getByRole('button', { name: /cancel|no/i });
  }

  async goto() {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForUsersToLoad() {
    await this.loadingState.waitFor({ state: 'hidden', timeout: 10000 });
    await this.userTable.waitFor({ state: 'visible' });
  }

  async searchUsers(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce (400ms)
    await this.page.waitForTimeout(500);
    await this.waitForUsersToLoad();
  }

  async filterByStatus(status: 'All statuses' | 'Active' | 'Suspended' | 'Disabled') {
    await this.statusFilterSelect.selectOption(status);
    await this.page.waitForTimeout(300);
    await this.waitForUsersToLoad();
  }

  async getUserRowByName(userName: string): Promise<Locator> {
    return this.tableRows.filter({ hasText: userName });
  }

  async getUserRowByEmail(email: string): Promise<Locator> {
    return this.tableRows.filter({ hasText: email });
  }

  async clickViewDetailForUser(userName: string) {
    const row = (await this.getUserRowByName(userName)).first();
    await row.getByRole('button', { name: /view detail/i }).click();
    await this.userDetailDrawer.waitFor({ state: 'visible' });
  }

  async clickSuspendForUser(userName: string) {
    const row = (await this.getUserRowByName(userName)).first();
    await row.getByRole('button', { name: /suspend/i }).click();
    await this.confirmModal.waitFor({ state: 'visible' });
  }

  async clickActivateForUser(userName: string) {
    const row = (await this.getUserRowByName(userName)).first();
    await row.getByRole('button', { name: /activate/i }).click();
    await this.confirmModal.waitFor({ state: 'visible' });
  }

  async confirmAction() {
    await this.confirmButton.click();
    await this.confirmModal.waitFor({ state: 'hidden' });
  }

  async cancelAction() {
    await this.cancelButton.click();
    await this.confirmModal.waitFor({ state: 'hidden' });
  }

  async closeUserDetailDrawer() {
    await this.drawerCloseButton.click();
    await this.userDetailDrawer.waitFor({ state: 'hidden' });
  }

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.waitForUsersToLoad();
  }

  async goToPrevPage() {
    await this.prevPageButton.click();
    await this.waitForUsersToLoad();
  }

  async getUserCount(): Promise<number> {
    const rows = await this.tableRows.all();
    return rows.length;
  }

  async getStatValue(statName: 'Total Users' | 'Active' | 'Suspended'): Promise<string> {
    let locator: Locator;
    switch (statName) {
      case 'Total Users':
        locator = this.totalUsersCard;
        break;
      case 'Active':
        locator = this.activeUsersCard;
        break;
      case 'Suspended':
        locator = this.suspendedUsersCard;
        break;
    }
    const text = await locator.textContent();
    const match = text?.match(/\d+/);
    return match ? match[0] : '0';
  }

  async isUserInTable(userName: string): Promise<boolean> {
    return await this.tableRows.filter({ hasText: userName }).count() > 0;
  }

  async getUserStatus(userName: string): Promise<string> {
    const row = (await this.getUserRowByName(userName)).first();
    const badge = row.locator('td:nth-child(4)');
    return (await badge.textContent())?.trim() || '';
  }
}
