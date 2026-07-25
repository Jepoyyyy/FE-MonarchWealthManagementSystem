import type { Page, Locator } from '@playwright/test';

export class AssetsPage {
  readonly page: Page;

  // Main page elements
  readonly portfolioHeading: Locator;
  readonly trackInvestmentButton: Locator;
  readonly emptyStateMessage: Locator;

  // Stat cards
  readonly portfolioValueCard: Locator;
  readonly totalCostCard: Locator;
  readonly unrealizedPnlCard: Locator;

  // Asset table
  readonly assetTable: Locator;
  readonly productColumn: Locator;
  readonly qtyColumn: Locator;
  readonly platformColumn: Locator;
  readonly dateColumn: Locator;
  readonly costBasisColumn: Locator;
  readonly currentValueColumn: Locator;
  readonly pnlColumn: Locator;
  readonly footerRow: Locator;

  // Modals
  readonly modal: Locator;
  readonly confirmDialog: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main page elements
    this.portfolioHeading = page.getByRole('heading', { name: /my assets/i });
    this.trackInvestmentButton = page.getByRole('button', { name: /track investment/i });
    this.emptyStateMessage = page.getByText(/no positions tracked yet/i);

    // Stat cards
    this.portfolioValueCard = page.getByText(/portfolio value/i);
    this.totalCostCard = page.getByText(/total cost/i);
    this.unrealizedPnlCard = page.getByText(/unrealized p[&\/]l/i);

    // Asset table
    this.assetTable = page.getByRole('table');
    this.productColumn = page.getByRole('columnheader', { name: /product/i });
    this.qtyColumn = page.getByRole('columnheader', { name: /qty/i });
    this.platformColumn = page.getByRole('columnheader', { name: /platform/i });
    this.dateColumn = page.getByRole('columnheader', { name: /date/i });
    this.costBasisColumn = page.getByRole('columnheader', { name: /cost basis/i });
    this.currentValueColumn = page.getByRole('columnheader', { name: /cur.*value/i });
    this.pnlColumn = page.getByRole('columnheader', { name: /p\/l/i });
    this.footerRow = page.getByText(/total/i);

    // Modals
    this.modal = page.getByRole('dialog');
    this.confirmDialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/assets');
  }

  async waitForAssetsToLoad() {
    // Wait for either the portfolio heading or empty state to appear
    await Promise.race([
      this.portfolioHeading.waitFor({ state: 'visible' }),
      this.emptyStateMessage.waitFor({ state: 'visible' }),
    ]);
    const skeleton = this.page.locator('[data-testid="assets-loading"]');
    if (await skeleton.isVisible()) {
      await skeleton.waitFor({ state: 'hidden' });
    }
  }

  async clickAssetByName(name: string) {
    await this.page.getByText(name).click();
  }

  async openTrackInvestmentModal() {
    await this.trackInvestmentButton.click();
  }

  async getStatCardValue(cardName: string): Promise<string | null> {
    const card = this.page.getByText(new RegExp(cardName, 'i')).locator('..');
    return await card.textContent();
  }
}

export class AssetDetailPage {
  readonly page: Page;

  // Header elements
  readonly assetHeading: Locator;
  readonly productBadge: Locator;
  readonly riskBadge: Locator;

  // Stat cards
  readonly totalInvestedCard: Locator;
  readonly quantityCard: Locator;
  readonly averageValueCard: Locator;
  readonly currentValueCard: Locator;

  // P&L section
  readonly pnlSection: Locator;
  readonly unrealizedPnl: Locator;

  // Actions
  readonly linkToGoalDropdown: Locator;
  readonly buyTopUpButton: Locator;
  readonly sellRedeemButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;

  // Transaction history
  readonly transactionHistoryHeading: Locator;
  readonly transactionTable: Locator;

  // Modals
  readonly transactionModal: Locator;
  readonly deleteConfirmModal: Locator;
  readonly cancelConfirmModal: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.assetHeading = page.getByRole('heading').first();
    this.productBadge = page.locator('[data-testid="product-badge"]');
    this.riskBadge = page.locator('[data-testid="risk-badge"]');

    // Stat cards
    this.totalInvestedCard = page.getByText(/total invested/i);
    this.quantityCard = page.getByText(/quantity/i);
    this.averageValueCard = page.getByText(/average value/i);
    this.currentValueCard = page.getByText(/current value/i);

    // P&L section
    this.pnlSection = page.getByText(/profit.*loss/i);
    this.unrealizedPnl = page.getByText(/unrealized/i);

    // Actions
    this.linkToGoalDropdown = page.getByRole('combobox', { name: /goal/i });
    this.buyTopUpButton = page.getByRole('button', { name: /buy.*top up/i });
    this.sellRedeemButton = page.getByRole('button', { name: /sell.*redeem/i });
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.deleteButton = page.getByRole('button', { name: /remove asset/i });

    // Transaction history
    this.transactionHistoryHeading = page.getByText(/transaction history/i);
    this.transactionTable = page.getByRole('table');

    // Modals
    this.transactionModal = page.getByRole('dialog');
    this.deleteConfirmModal = page.getByRole('dialog');
    this.cancelConfirmModal = page.getByRole('dialog');
  }

  async goto(assetId: number) {
    await this.page.goto(`/assets/${assetId}`);
  }

  async openBuyModal() {
    await this.buyTopUpButton.click();
  }

  async openSellModal() {
    await this.sellRedeemButton.click();
  }

  async linkToGoal(goalName: string) {
    await this.linkToGoalDropdown.click();
    await this.page.getByRole('option', { name: goalName }).click();
  }

  async saveChanges() {
    await this.saveButton.click();
  }

  async cancelChanges() {
    await this.cancelButton.click();
  }

  async deleteAsset() {
    await this.deleteButton.click();
    await this.page.getByRole('button', { name: /confirm/i }).click();
  }

  async fillTransactionForm(data: { quantity?: string; price?: string; date?: string }) {
    if (data.quantity) {
      await this.page.getByLabel(/quantity|units|lots/i).fill(data.quantity);
    }
    if (data.price) {
      await this.page.getByLabel(/price/i).fill(data.price);
    }
    if (data.date) {
      await this.page.getByLabel(/date/i).fill(data.date);
    }
  }

  async submitTransaction() {
    await this.page.getByRole('button', { name: /save|submit/i }).click();
  }
}
