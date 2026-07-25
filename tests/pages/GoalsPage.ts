import type { Page, Locator } from '@playwright/test';

export class GoalsPage {
  readonly page: Page;

  // Page header
  readonly pageHeading: Locator;
  readonly addGoalButton: Locator;
  readonly editProfileButton: Locator;

  // Loading state
  readonly loadingSkeleton: Locator;

  // Empty state
  readonly emptyStateMessage: Locator;
  readonly emptyStateButton: Locator;

  // Summary stats cards
  readonly monthlyIncomeCard: Locator;
  readonly totalExpensesCard: Locator;
  readonly surplusCard: Locator;
  readonly unallocatedCard: Locator;
  readonly avgFundedCard: Locator;
  readonly portfolioReturnCard: Locator;

  // Goal cards
  readonly priorityGoalSection: Locator;
  readonly priorityGoalCard: Locator;
  readonly otherGoalsGrid: Locator;
  readonly goalCards: Locator;

  // Goal card elements (using data-testid or text patterns)
  readonly goalName: Locator;
  readonly goalTarget: Locator;
  readonly goalProgress: Locator;
  readonly goalMonthlyContribution: Locator;
  readonly goalEditButton: Locator;
  readonly goalDeleteButton: Locator;
  readonly goalSetPriorityButton: Locator;

  // Goal Form Modal
  readonly goalModal: Locator;
  readonly modalTitle: Locator;
  readonly goalTypeSelector: Locator;
  readonly goalNameInput: Locator;
  readonly goalTargetInput: Locator;
  readonly goalSavedInput: Locator;
  readonly goalMonthlyInput: Locator;
  readonly goalPriorityToggle: Locator;
  readonly goalNotesInput: Locator;
  readonly modalSaveButton: Locator;
  readonly modalCancelButton: Locator;
  readonly modalCloseButton: Locator;
  readonly modalErrorMessage: Locator;

  // Financial Profile Modal
  readonly finProfileModal: Locator;
  readonly monthlyIncomeInput: Locator;
  readonly housingExpenseInput: Locator;
  readonly foodExpenseInput: Locator;
  readonly transportExpenseInput: Locator;
  readonly utilitiesExpenseInput: Locator;
  readonly healthcareExpenseInput: Locator;
  readonly entertainmentExpenseInput: Locator;
  readonly insuranceExpenseInput: Locator;
  readonly otherExpenseInput: Locator;
  readonly finProfileSaveButton: Locator;
  readonly finProfileCancelButton: Locator;

  // Confirm Modal
  readonly confirmModal: Locator;
  readonly confirmButton: Locator;
  readonly cancelConfirmButton: Locator;

  // Toast notifications
  readonly toast: Locator;
  readonly successToast: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page header
    this.pageHeading = page.getByRole('heading', { name: /financial goals/i });
    this.addGoalButton = page.getByRole('button', { name: /add goal/i });
    this.editProfileButton = page.getByRole('button', { name: /edit profile/i });

    // Loading state
    this.loadingSkeleton = page.locator('[data-testid="goals-loading"]');

    // Empty state
    this.emptyStateMessage = page.getByText(/no goals yet/i);
    this.emptyStateButton = page.getByRole('button', { name: /create.*first goal/i });

    // Summary stats cards
    this.monthlyIncomeCard = page.getByText(/monthly income/i);
    this.totalExpensesCard = page.getByText(/total expenses|monthly expenses/i);
    this.surplusCard = page.getByText(/surplus/i);
    this.unallocatedCard = page.getByText(/unallocated/i);
    this.avgFundedCard = page.getByText(/avg.*funded/i);
    this.portfolioReturnCard = page.getByText(/portfolio return/i);

    // Goal cards
    this.priorityGoalSection = page.locator('[data-priority="true"]').first();
    this.priorityGoalCard = page.locator('.priority-goal-card, [data-priority="true"]').first();
    this.otherGoalsGrid = page.locator('.other-goals-grid, [data-testid="other-goals"]');
    this.goalCards = page.locator('.goal-card, [data-testid="goal-card"]');

    // Goal card elements
    this.goalName = page.locator('.goal-name, [data-testid="goal-name"]');
    this.goalTarget = page.locator('.goal-target, [data-testid="goal-target"]');
    this.goalProgress = page.locator('.goal-progress, [data-testid="goal-progress"]');
    this.goalMonthlyContribution = page.locator('.goal-monthly, [data-testid="goal-monthly"]');
    this.goalEditButton = page.getByRole('button', { name: /edit/i });
    this.goalDeleteButton = page.getByRole('button', { name: /delete/i });
    this.goalSetPriorityButton = page.getByRole('button', { name: /set.*priority/i });

    // Goal Form Modal
    this.goalModal = page.getByRole('dialog').filter({ hasText: /goal/i });
    this.modalTitle = page.getByRole('heading', { name: /(add|edit|create).*goal/i });
    this.goalTypeSelector = page.locator('button[data-goal-type], [data-testid="goal-type"]');
    this.goalNameInput = page.getByLabel(/goal name|name/i);
    this.goalTargetInput = page.getByLabel(/target.*amount|target/i);
    this.goalSavedInput = page.getByLabel(/current.*saved|saved/i);
    this.goalMonthlyInput = page.getByLabel(/monthly.*contribution|monthly/i);
    this.goalPriorityToggle = this.goalModal.getByLabel(/priority|make.*priority/i);
    this.goalNotesInput = page.getByLabel(/notes/i);
    this.modalSaveButton = this.goalModal.getByRole('button', { name: /save|create/i });
    this.modalCancelButton = this.goalModal.getByRole('button', { name: /cancel/i });
    this.modalCloseButton = this.goalModal.getByRole('button', { name: /close/i });
    this.modalErrorMessage = this.goalModal.locator('.error, [role="alert"], .text-destructive').filter({ hasText: /.+/ });

    // Financial Profile Modal
    this.finProfileModal = page.getByRole('dialog').filter({ hasText: /financial profile/i });
    this.monthlyIncomeInput = page.getByLabel(/monthly income/i);
    this.housingExpenseInput = page.getByLabel(/housing/i);
    this.foodExpenseInput = page.getByLabel(/food/i);
    this.transportExpenseInput = page.getByLabel(/transport/i);
    this.utilitiesExpenseInput = page.getByLabel(/utilities/i);
    this.healthcareExpenseInput = page.getByLabel(/healthcare/i);
    this.entertainmentExpenseInput = page.getByLabel(/entertainment/i);
    this.insuranceExpenseInput = page.getByLabel(/insurance/i);
    this.otherExpenseInput = page.getByLabel(/other/i);
    this.finProfileSaveButton = this.finProfileModal.getByRole('button', { name: /save/i });
    this.finProfileCancelButton = this.finProfileModal.getByRole('button', { name: /cancel/i });

    // Confirm Modal
    this.confirmModal = page.locator('[data-testid="confirm-modal"], [role="dialog"][aria-label="Confirm Modal"]');
    this.confirmButton = this.confirmModal.getByRole('button', { name: /confirm|yes|delete|hapus|ya|discard/i });
    this.cancelConfirmButton = this.confirmModal.getByRole('button', { name: /cancel|no|batal/i });

    // Toast notifications
    this.toast = page.locator('[role="status"], .toast, [data-testid="toast"], [data-sonner-toast]');
    this.successToast = page.locator('[role="status"], .toast, [data-sonner-toast], [data-type="success"]').filter({ hasText: /success|added|updated|created|deleted|dibuat|diperbarui|berhasil/i });
    this.errorToast = page.locator('[role="status"], .toast, [data-sonner-toast], [data-type="error"]').filter({ hasText: /error|failed|fail|gagal/i });
  }

  async goto() {
    await this.page.goto('/goals');
  }

  async waitForPageLoad() {
    // Wait for either the page heading or empty state to appear
    await Promise.race([
      this.pageHeading.waitFor({ state: 'visible' }),
      this.emptyStateMessage.waitFor({ state: 'visible' }),
    ]);

    // Wait for loading skeleton to disappear if present
    const skeleton = this.loadingSkeleton;
    if (await skeleton.isVisible().catch(() => false)) {
      await skeleton.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  async openAddGoalModal() {
    await this.addGoalButton.click();
    await this.goalModal.waitFor({ state: 'visible' });
  }

  async openEditProfileModal() {
    await this.editProfileButton.click();
    await this.finProfileModal.waitFor({ state: 'visible' });
  }

  async selectGoalType(type: 'savings' | 'vacation' | 'car' | 'property' | 'retirement' | 'custom') {
    const byAttr = this.page.locator(`[data-goal-type="${type}"]`);
    if (await byAttr.count() > 0) {
      await byAttr.first().click();
    } else {
      await this.goalTypeSelector.filter({ hasText: new RegExp(type, 'i') }).first().click();
    }
  }

  async fillGoalForm(data: {
    name?: string;
    targetAmount?: string;
    currentSaved?: string;
    monthlyContribution?: string;
    isPriority?: boolean;
    notes?: string;
  }) {
    if (data.name !== undefined) {
      await this.goalNameInput.fill(data.name);
    }
    if (data.targetAmount !== undefined) {
      await this.goalTargetInput.fill(data.targetAmount);
    }
    if (data.currentSaved !== undefined) {
      await this.goalSavedInput.fill(data.currentSaved);
    }
    if (data.monthlyContribution !== undefined) {
      await this.goalMonthlyInput.fill(data.monthlyContribution);
    }
    if (data.isPriority !== undefined) {
      const toggle = this.goalPriorityToggle;
      const attr = await toggle.getAttribute('aria-checked').catch(() => null);
      const isChecked = attr !== null ? attr === 'true' : await toggle.isChecked().catch(() => false);
      if (isChecked !== data.isPriority) {
        await toggle.click();
      }
    }
    if (data.notes !== undefined) {
      await this.goalNotesInput.fill(data.notes);
    }
  }

  async saveGoal() {
    await this.modalSaveButton.click();
    await this.goalModal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async cancelGoalModal() {
    if (await this.modalCancelButton.isVisible().catch(() => false)) {
      await this.modalCancelButton.click();
    } else {
      await this.modalCloseButton.click();
    }
    try {
      const modalClosed = this.goalModal.waitFor({ state: 'hidden', timeout: 2000 });
      const confirmShown = this.confirmModal.waitFor({ state: 'visible', timeout: 2000 });
      await Promise.race([modalClosed, confirmShown]);

      if (await this.confirmModal.isVisible().catch(() => false)) {
        await this.confirmButton.click();
      }
    } catch {
      // Form closed or timed out
    }
  }

  async fillFinancialProfile(data: {
    monthlyIncome?: string;
    housing?: string;
    food?: string;
    transport?: string;
    utilities?: string;
    healthcare?: string;
    entertainment?: string;
    insurance?: string;
    other?: string;
  }) {
    if (data.monthlyIncome !== undefined) {
      await this.monthlyIncomeInput.fill(data.monthlyIncome);
    }
    if (data.housing !== undefined) {
      await this.housingExpenseInput.fill(data.housing);
    }
    if (data.food !== undefined) {
      await this.foodExpenseInput.fill(data.food);
    }
    if (data.transport !== undefined) {
      await this.transportExpenseInput.fill(data.transport);
    }
    if (data.utilities !== undefined) {
      await this.utilitiesExpenseInput.fill(data.utilities);
    }
    if (data.healthcare !== undefined) {
      await this.healthcareExpenseInput.fill(data.healthcare);
    }
    if (data.entertainment !== undefined) {
      await this.entertainmentExpenseInput.fill(data.entertainment);
    }
    if (data.insurance !== undefined) {
      await this.insuranceExpenseInput.fill(data.insurance);
    }
    if (data.other !== undefined) {
      await this.otherExpenseInput.fill(data.other);
    }
  }

  async saveFinancialProfile() {
    await this.finProfileSaveButton.click();
    await this.finProfileModal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  getGoalByName(name: string): Locator {
    return this.page.locator('.goal-card, [data-testid="goal-card"]').filter({ hasText: name }).first();
  }

  async editGoalByName(name: string) {
    const goalCard = await this.getGoalByName(name);
    await goalCard.hover();
    await goalCard.getByRole('button', { name: /edit/i }).click();
    await this.goalModal.waitFor({ state: 'visible' });
  }

  async deleteGoalByName(name: string) {
    const goalCard = await this.getGoalByName(name);
    await goalCard.hover();
    await goalCard.getByRole('button', { name: /delete/i }).click();
    await this.confirmModal.waitFor({ state: 'visible' });
    await this.confirmButton.click();
  }

  async setPriorityByName(name: string) {
    const goalCard = this.getGoalByName(name);
    await goalCard.scrollIntoViewIfNeeded().catch(() => {});
    const btn = goalCard.getByRole('button', { name: /set.*priority/i })
      .or(this.page.getByRole('button', { name: /set as priority/i }))
      .first();
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
  }

  async waitForToast(type: 'success' | 'error' = 'success') {
    const toastLocator = type === 'success' ? this.successToast : this.errorToast;
    await toastLocator.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      return this.toast.first().waitFor({ state: 'visible', timeout: 3000 });
    });
  }

  async getGoalCount(): Promise<number> {
    await this.page.waitForTimeout(500); // Brief wait for DOM to stabilize
    return await this.goalCards.count();
  }
}
