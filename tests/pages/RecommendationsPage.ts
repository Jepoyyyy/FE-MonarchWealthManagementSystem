import { type Page, type Locator } from '@playwright/test';

export class RecommendationsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly healthScoreSection: Locator;
  readonly healthScoreValue: Locator;
  readonly healthScoreDescription: Locator;
  readonly generateRecommendationsButton: Locator;
  readonly recommendationCards: Locator;
  readonly loadingSkeleton: Locator;
  readonly emptyState: Locator;
  readonly trackModal: Locator;
  readonly trackModalTitle: Locator;
  readonly successToast: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /recommendations/i });
    // Health score section contains "Portfolio Health" text
    this.healthScoreSection = page.getByText(/portfolio health/i);
    // Health score value is the status text like "Healthy", "Needs attention", "Action required"
    this.healthScoreValue = page.getByText(/healthy|needs attention|action required|needs action/i);
    // Health score description shows issue count or "No critical issues"
    this.healthScoreDescription = page.getByText(/issue|no critical issues|focus on growth/i);
    this.generateRecommendationsButton = page.getByRole('button', { name: /generate recommendations/i });
    // Recommendation cards are divs with border and contain a Track button
    this.recommendationCards = page.locator('.bg-card.rounded-xl.border').filter({
      has: page.getByRole('button', { name: /track/i })
    });
    this.loadingSkeleton = page.locator('[data-testid="recommendations-loading"]');
    // Empty state shows "Your portfolio looks great"
    this.emptyState = page.getByText(/your portfolio looks great|no recommendations/i);
    this.trackModal = page.getByRole('dialog');
    this.trackModalTitle = page.getByRole('heading', { name: /track investment/i });
    this.successToast = page.getByText(/investment tracked|rekomendasi ditindaklanjuti/i).first();
    this.errorToast = page.getByText(/failed|error|gagal/i).first();
  }

  async goto() {
    await this.page.goto('/recommendations');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForRecommendationsToLoad() {
    await this.loadingSkeleton.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async clickTrackOnRecommendation(index: number = 0) {
    const card = this.recommendationCards.nth(index);
    await card.getByRole('button', { name: /track/i }).click();
  }

  async fillTrackingForm(data: {
    amount: string;
    quantity?: string;
    date?: string;
    platform?: string;
    notes?: string;
  }) {
    const dialog = this.trackModal;
    await dialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Wait for modal loading overlay to disappear
    await dialog.getByText(/loading product details/i).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Check if Amount Invested input is editable
    const amountInput = dialog.getByLabel(/amount invested/i);
    await amountInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const isAmountReadOnly = (await amountInput.getAttribute('readonly')) !== null;

    if (!isAmountReadOnly) {
      await amountInput.fill(data.amount);
    }

    // Check if Quantity input exists and is editable
    const quantityInput = dialog.getByLabel(/quantity|units|lots/i);
    if ((await quantityInput.count()) > 0) {
      const isQuantityReadOnly = (await quantityInput.getAttribute('readonly')) !== null;
      if (!isQuantityReadOnly) {
        let qtyToFill = data.quantity;
        if (!qtyToFill && isAmountReadOnly) {
          const priceInput = dialog.getByLabel(/market price/i);
          let price = 0;
          if ((await priceInput.count()) > 0) {
            const priceVal = await priceInput.inputValue();
            price = parseFloat(priceVal) || 0;
          }
          if (price > 0) {
            const calculatedLots = Math.max(1, Math.round(parseFloat(data.amount) / (price * 100)));
            qtyToFill = String(calculatedLots);
          } else {
            qtyToFill = '10';
          }
        }
        if (qtyToFill) {
          await quantityInput.fill(qtyToFill);
        }
      }
    }

    await this.page.waitForTimeout(300);

    if (data.date) {
      const dateInput = dialog.getByLabel(/purchase date|tanggal pembelian/i);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
        await dateInput.evaluate((el: HTMLInputElement, val: string) => {
          el.setAttribute("type", "text");
          const reactPropsKey = Object.keys(el).find((k) => k.startsWith("__reactProps$"));
          if (reactPropsKey && (el as any)[reactPropsKey]?.onChange) {
            (el as any)[reactPropsKey].onChange({ target: { value: val }, currentTarget: { value: val } });
          } else {
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }, data.date);
      } else {
        await dateInput.fill(data.date);
      }
    }

    if (data.platform) {
      const platformInput = dialog.getByLabel(/platform/i);
      await platformInput.fill(data.platform);
    }

    if (data.notes) {
      const notesInput = dialog.getByLabel(/notes|catatan/i);
      await notesInput.fill(data.notes);
    }
  }

  async submitTrackingForm() {
    if (!(await this.trackModal.isVisible())) return;
    await this.trackModal.getByText(/loading product details/i).waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    const submitButton = this.trackModal.getByRole('button', { name: /record position|simpan/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await this.trackModal.waitFor({ state: 'hidden', timeout: 1000 }).catch(() => {});
    }
  }

  async getHealthScore(): Promise<string> {
    // The numeric score is displayed in the ScoreRing component (SVG text)
    const scoreText = await this.page.locator('svg text').first().textContent();
    return scoreText?.match(/\d+/)?.[0] || '';
  }

  async getRecommendationCount(): Promise<number> {
    return await this.recommendationCards.count();
  }

  async getRecommendationTitle(index: number = 0): Promise<string> {
    const card = this.recommendationCards.nth(index);
    // The title is in a <p> tag with class "text-sm font-semibold", not h3
    const title = await card.locator('p.text-sm.font-semibold').first().textContent();
    return title || '';
  }
}
