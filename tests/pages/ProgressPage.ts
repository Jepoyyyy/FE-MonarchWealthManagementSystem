import type { Page, Locator } from '@playwright/test';

export class ProgressPage {
  readonly page: Page;

  // Page header
  readonly pageHeading: Locator;
  readonly pageSubtitle: Locator;

  // Loading state
  readonly loadingSkeleton: Locator;
  readonly skeletonCards: Locator;
  readonly skeletonChart: Locator;

  // Stat cards (4 cards)
  readonly portfolioValueCard: Locator;
  readonly totalReturnCard: Locator;
  readonly avgMonthlyIncomeCard: Locator;
  readonly portfolioAgeCard: Locator;
  readonly statCards: Locator;

  // Performance status banner
  readonly performanceBanner: Locator;
  readonly performanceLabel: Locator;
  readonly performancePercentage: Locator;
  readonly performanceProgressBar: Locator;

  // Goal projection chart
  readonly projectionChart: Locator;
  readonly chartContainer: Locator;

  // Goal timeline table
  readonly goalTimelineTable: Locator;
  readonly goalTimelineHeading: Locator;
  readonly goalTimelineRows: Locator;
  readonly tableHeaders: Locator;

  // Position breakdown
  readonly positionBreakdown: Locator;
  readonly positionBreakdownHeading: Locator;
  readonly positionItems: Locator;
  readonly emptyPositionMessage: Locator;

  // Badge elements
  readonly priorityBadge: Locator;
  readonly statusBadges: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page header
    this.pageHeading = page.getByRole('heading', { name: /portfolio progress/i });
    this.pageSubtitle = page.getByText(/tracking your portfolio.*performance.*goals/i);

    // Loading state
    this.loadingSkeleton = page.locator('[data-testid="progress-loading"]');
    this.skeletonCards = this.loadingSkeleton.locator('.animate-pulse');
    this.skeletonChart = page.locator('.h-96.bg-card.border.border-border.animate-pulse');

    // Stat cards
    this.portfolioValueCard = page.getByText('Portfolio Value', { exact: true });
    this.totalReturnCard = page.getByText('Total Return', { exact: true });
    this.avgMonthlyIncomeCard = page.getByText('Avg Monthly Income', { exact: true });
    this.portfolioAgeCard = page.getByText('Portfolio Age', { exact: true });
    this.statCards = page.locator('.bg-card.rounded-xl.border.border-border.p-4').filter({ has: page.locator('svg') });

    // Performance status banner
    this.performanceBanner = page.locator('.rounded-xl.p-4.flex').filter({ hasText: /(needs attention|on the way|performing well)/i });
    this.performanceLabel = this.performanceBanner.locator('.text-sm.font-semibold');
    this.performancePercentage = this.performanceBanner.locator('.text-xs.font-bold.px-2.py-0\\.5.rounded-full');
    this.performanceProgressBar = this.performanceBanner.locator('.w-full.md\\:w-40.h-2.bg-muted.rounded-full');

    // Goal projection chart
    this.chartContainer = page.locator('.recharts-wrapper').first();
    this.projectionChart = page.locator('.recharts-surface');

    // Goal timeline table
    this.goalTimelineHeading = page.getByRole('heading', { name: /goal timeline/i });
    this.goalTimelineTable = page.locator('.bg-card').filter({ has: this.goalTimelineHeading }).locator('table');
    this.tableHeaders = this.goalTimelineTable.locator('thead th');
    this.goalTimelineRows = this.goalTimelineTable.locator('tbody tr');

    // Position breakdown
    this.positionBreakdownHeading = page.getByRole('heading', { name: /position breakdown/i });
    this.positionBreakdown = page.locator('.bg-card.rounded-xl').filter({ has: this.positionBreakdownHeading });
    this.positionItems = this.positionBreakdown.locator('.flex.flex-col.gap-3 > div');
    this.emptyPositionMessage = this.positionBreakdown.getByText(/no positions to display/i);

    // Badges
    this.priorityBadge = page.locator('[variant="secondary"], [data-variant="secondary"]').filter({ hasText: /priority/i });
    this.statusBadges = page.locator('.px-2\\.5.py-0\\.5.rounded-full').filter({ hasText: /(on track|slow pace|action needed)/i });
  }

  async goto() {
    await this.page.goto('/progress');
  }

  async waitForPageLoad() {
    await Promise.race([
      this.pageHeading.waitFor({ state: 'visible' }),
      this.loadingSkeleton.waitFor({ state: 'visible' }),
    ]);

    const skeleton = this.loadingSkeleton;
    if (await skeleton.isVisible().catch(() => false)) {
      await skeleton.waitFor({ state: 'hidden', timeout: 15000 });
    }

    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async waitForChartToRender() {
    await this.chartContainer.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500); // Brief wait for chart animation
  }

  async getStatCardValue(cardName: string): Promise<string> {
    let card: Locator;

    switch (cardName.toLowerCase()) {
      case 'portfolio value':
        card = this.portfolioValueCard;
        break;
      case 'total return':
        card = this.totalReturnCard;
        break;
      case 'avg monthly income':
        card = this.avgMonthlyIncomeCard;
        break;
      case 'portfolio age':
        card = this.portfolioAgeCard;
        break;
      default:
        throw new Error(`Unknown stat card: ${cardName}`);
    }

    const cardContainer = card.locator('..').locator('..');
    const valueElement = cardContainer.locator('.text-2xl, .text-xl').first();
    return await valueElement.textContent() || '';
  }

  async getPerformanceStatus(): Promise<{ label: string; percentage: string }> {
    const label = await this.performanceLabel.textContent() || '';
    const percentage = await this.performancePercentage.textContent() || '';
    return { label: label.trim(), percentage: percentage.trim() };
  }

  async getGoalTimelineRowCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return await this.goalTimelineRows.count();
  }

  async getGoalByName(goalName: string): Promise<Locator> {
    return this.goalTimelineRows.filter({ hasText: goalName }).first();
  }

  async getGoalETA(goalName: string): Promise<string> {
    const row = await this.getGoalByName(goalName);
    const etaCell = row.locator('td').nth(3);
    return await etaCell.textContent() || '';
  }

  async getGoalStatus(goalName: string): Promise<string> {
    const row = await this.getGoalByName(goalName);
    const statusBadge = row.locator('td').nth(4).locator('span');
    return await statusBadge.textContent() || '';
  }

  async getPositionCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    if (await this.emptyPositionMessage.isVisible().catch(() => false)) {
      return 0;
    }
    return await this.positionItems.count();
  }

  async getPositionByName(productName: string): Promise<Locator> {
    return this.positionItems.filter({ hasText: productName }).first();
  }

  async isPerformanceBannerVisible(): Promise<boolean> {
    return await this.performanceBanner.isVisible().catch(() => false);
  }

  async isChartVisible(): Promise<boolean> {
    return await this.chartContainer.isVisible().catch(() => false);
  }

  async isGoalTimelineVisible(): Promise<boolean> {
    return await this.goalTimelineTable.isVisible().catch(() => false);
  }

  async isPositionBreakdownVisible(): Promise<boolean> {
    return await this.positionBreakdown.isVisible().catch(() => false);
  }

  async verifyTableHeaders(expectedHeaders: string[]): Promise<boolean> {
    const headerCount = await this.tableHeaders.count();
    if (headerCount !== expectedHeaders.length) return false;

    for (let i = 0; i < expectedHeaders.length; i++) {
      const headerText = await this.tableHeaders.nth(i).textContent();
      if (!headerText?.toLowerCase().includes(expectedHeaders[i].toLowerCase())) {
        return false;
      }
    }
    return true;
  }
}
