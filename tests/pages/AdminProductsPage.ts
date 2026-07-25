import type { Page, Locator } from '@playwright/test';

export class AdminProductsPage {
  readonly page: Page;

  // Header
  readonly headerTitle: Locator;
  readonly headerSubtitle: Locator;

  // Toolbar
  readonly searchInput: Locator;
  readonly typeFilterSelect: Locator;
  readonly addProductButton: Locator;

  // Product Table
  readonly productTable: Locator;
  readonly tableRows: Locator;
  readonly loadingState: Locator;
  readonly emptyState: Locator;

  // Pagination
  readonly pagination: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;

  // Add Product Modal
  readonly addProductModal: Locator;
  readonly modalTitle: Locator;
  readonly modalCloseButton: Locator;

  // Form Fields
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly issuerInput: Locator;
  readonly typeSelect: Locator;
  readonly riskLevelInput: Locator;
  readonly annualReturnInput: Locator;
  readonly minInvestmentInput: Locator;
  readonly currentPriceInput: Locator;
  readonly tenorInput: Locator;
  readonly lotSizeInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly fractionalAllowedCheckbox: Locator;
  readonly visibleCheckbox: Locator;

  // Form Buttons
  readonly cancelButton: Locator;
  readonly createButton: Locator;

  // Confirm Modal
  readonly confirmModal: Locator;
  readonly confirmModalTitle: Locator;
  readonly confirmModalMessage: Locator;
  readonly confirmButton: Locator;
  readonly cancelConfirmButton: Locator;

  // Error Message
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.headerTitle = page.getByRole('heading', { name: /product management/i });
    this.headerSubtitle = page.getByText(/products/i);

    // Toolbar
    this.searchInput = page.getByPlaceholder(/search by name or issuer/i);
    this.typeFilterSelect = page.locator('select').filter({ hasText: /all types/i });
    this.addProductButton = page.getByRole('button', { name: /add product/i });

    // Product Table
    this.productTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.loadingState = page.getByTestId('admin-products-loading');
    this.emptyState = page.getByText(/no products found/i);

    // Pagination
    this.pagination = page.locator('.pagination, [role="navigation"]').last();
    this.prevPageButton = page.getByRole('button', { name: /previous/i });
    this.nextPageButton = page.getByRole('button', { name: /next/i });

    // Add Product Modal
    this.addProductModal = page.getByRole('heading', { name: /add new product/i }).locator('../..');
    this.modalTitle = page.getByRole('heading', { name: /add new product/i });
    this.modalCloseButton = this.addProductModal.getByRole('button', { name: /✕/i });

    // Form Fields
    this.codeInput = page.getByLabel(/code/i);
    this.nameInput = page.getByLabel(/^name$/i);
    this.issuerInput = page.getByLabel(/issuer/i);
    this.typeSelect = page.locator('select').filter({ hasText: /select type/i });
    this.riskLevelInput = page.getByLabel(/risk level/i);
    this.annualReturnInput = page.getByLabel(/annual return/i);
    this.minInvestmentInput = page.getByLabel(/min investment/i);
    this.currentPriceInput = page.getByLabel(/current price/i);
    this.tenorInput = page.getByLabel(/tenor/i);
    this.lotSizeInput = page.getByLabel(/lot size/i);
    this.descriptionTextarea = page.getByLabel(/description/i);
    this.fractionalAllowedCheckbox = page.getByRole('checkbox', { name: /fractional allowed/i });
    this.visibleCheckbox = page.getByRole('checkbox', { name: /visible/i });

    // Form Buttons
    this.cancelButton = this.addProductModal.getByRole('button', { name: /cancel/i });
    this.createButton = this.addProductModal.getByRole('button', { name: /create product/i });

    // Confirm Modal
    this.confirmModal = page.locator('[role="dialog"], .modal').filter({
      hasText: /tampilkan produk|sembunyikan produk/i
    });
    this.confirmModalTitle = this.confirmModal.getByRole('heading').first();
    this.confirmModalMessage = this.confirmModal.locator('p').first();
    this.confirmButton = this.confirmModal.getByRole('button', { name: /ya/i });
    this.cancelConfirmButton = this.confirmModal.getByRole('button', { name: /cancel/i });

    // Error Message
    this.errorMessage = page.locator('.bg-red-500\\/10, .text-red-500').first();
  }

  async goto() {
    await this.page.goto('/admin/products');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForProductsToLoad() {
    await this.loadingState.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.productTable.waitFor({ state: 'visible', timeout: 5000 });
  }

  async searchProducts(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
    await this.waitForProductsToLoad();
  }

  async filterByType(type: string) {
    await this.typeFilterSelect.selectOption(type);
    await this.page.waitForTimeout(300);
    await this.waitForProductsToLoad();
  }

  async clickAddProduct() {
    await this.addProductButton.click();
    await this.addProductModal.waitFor({ state: 'visible' });
  }

  async closeAddProductModal() {
    await this.modalCloseButton.click();
    await this.addProductModal.waitFor({ state: 'hidden' });
  }

  async fillProductForm(data: {
    code: string;
    name: string;
    issuer: string;
    type: string;
    riskLevel: number;
    annualReturn: number;
    minInvestment: number;
    currentPrice: number;
    description: string;
    tenor?: string;
    lotSize?: number;
    isFractionalAllowed?: boolean;
    visible?: boolean;
  }) {
    await this.codeInput.fill(data.code);
    await this.nameInput.fill(data.name);
    await this.issuerInput.fill(data.issuer);
    await this.typeSelect.selectOption(data.type);
    await this.riskLevelInput.fill(String(data.riskLevel));
    await this.annualReturnInput.fill(String(data.annualReturn));
    await this.minInvestmentInput.fill(String(data.minInvestment));
    await this.currentPriceInput.fill(String(data.currentPrice));
    await this.descriptionTextarea.fill(data.description);

    if (data.tenor) {
      await this.tenorInput.fill(data.tenor);
    }

    if (data.lotSize !== undefined) {
      await this.lotSizeInput.fill(String(data.lotSize));
    }

    if (data.isFractionalAllowed !== undefined) {
      await this.fractionalAllowedCheckbox.setChecked(data.isFractionalAllowed);
    }

    if (data.visible !== undefined) {
      await this.visibleCheckbox.setChecked(data.visible);
    }
  }

  async submitProductForm() {
    await this.createButton.click();
  }

  async cancelProductForm() {
    await this.cancelButton.click();
    await this.addProductModal.waitFor({ state: 'hidden' });
  }

  async createProduct(data: Parameters<typeof this.fillProductForm>[0]) {
    await this.clickAddProduct();
    await this.fillProductForm(data);
    await this.submitProductForm();
    await this.addProductModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getProductRowByName(productName: string): Promise<Locator> {
    return this.tableRows.filter({ hasText: productName });
  }

  async getProductRowByCode(code: string): Promise<Locator> {
    return this.tableRows.filter({ hasText: code });
  }

  async clickToggleVisibilityForProduct(productName: string) {
    const row = (await this.getProductRowByName(productName)).first();
    await row.getByRole('button', { name: /hide|show/i }).click();
    await this.confirmModal.waitFor({ state: 'visible' });
  }

  async confirmAction() {
    await this.confirmButton.click();
    await this.confirmModal.waitFor({ state: 'hidden' });
  }

  async cancelAction() {
    await this.cancelConfirmButton.click();
    await this.confirmModal.waitFor({ state: 'hidden' });
  }

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.waitForProductsToLoad();
  }

  async goToPrevPage() {
    await this.prevPageButton.click();
    await this.waitForProductsToLoad();
  }

  async getProductCount(): Promise<number> {
    const rows = await this.tableRows.all();
    return rows.length;
  }

  async isProductInTable(productName: string): Promise<boolean> {
    return await this.tableRows.filter({ hasText: productName }).count() > 0;
  }

  async getProductStatus(productName: string): Promise<string> {
    const row = (await this.getProductRowByName(productName)).first();
    const badge = row.locator('td:nth-child(7)');
    return (await badge.textContent())?.trim() || '';
  }
}
