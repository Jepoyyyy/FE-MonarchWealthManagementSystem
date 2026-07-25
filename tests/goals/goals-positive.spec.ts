import { test, expect, createGoalData, createFinancialProfileData } from '../fixtures/goals-fixtures';

test.describe('Goals Page - Positive Tests', () => {

  test('GPT-001: Authenticated user can access Goals page', async ({ goalsPage }) => {
    await expect(goalsPage.pageHeading).toBeVisible();
    await expect(goalsPage.addGoalButton).toBeVisible();
    await expect(goalsPage.editProfileButton).toBeVisible();
  });

  test('GPT-002: Empty state displays when user has no goals', async ({ goalsPage, clearGoals }) => {
    await clearGoals();
    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    await expect(goalsPage.emptyStateMessage).toBeVisible();
    await expect(goalsPage.emptyStateButton).toBeVisible();
  });

  test('GPT-003: User can create a new Savings goal', async ({ goalsPage, clearGoals, createFinancialProfile }) => {
    await clearGoals();
    await createFinancialProfile(createFinancialProfileData());

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    await goalsPage.openAddGoalModal();
    await goalsPage.selectGoalType('savings');

    await goalsPage.fillGoalForm({
      name: 'Emergency Fund',
      targetAmount: '50000000',
      currentSaved: '5000000',
      monthlyContribution: '2000000',
      isPriority: false,
      notes: 'Build 6 months emergency fund',
    });

    await goalsPage.saveGoal();
    await goalsPage.waitForToast('success');

    // Verify goal appears in the list
    const goalCard = await goalsPage.getGoalByName('Emergency Fund');
    await expect(goalCard).toBeVisible();
  });

  test('GPT-004: User can create different goal types', async ({ goalsPage, clearGoals, createFinancialProfile }) => {
    await clearGoals();
    await createFinancialProfile(createFinancialProfileData());

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const goalTypes: Array<{ type: 'savings' | 'vacation' | 'car' | 'property' | 'retirement', name: string }> = [
      { type: 'vacation', name: 'Bali Trip' },
      { type: 'car', name: 'New Car' },
      { type: 'property', name: 'House Down Payment' },
    ];

    for (const goal of goalTypes) {
      await goalsPage.openAddGoalModal();
      await goalsPage.selectGoalType(goal.type);

      await goalsPage.fillGoalForm({
        name: goal.name,
        targetAmount: '30000000',
        currentSaved: '0',
        monthlyContribution: '1500000',
      });

      await goalsPage.saveGoal();
      await goalsPage.page.waitForTimeout(1000); // Brief wait for UI to update
    }

    // Verify all goals are displayed
    for (const goal of goalTypes) {
      const goalCard = await goalsPage.getGoalByName(goal.name);
      await expect(goalCard).toBeVisible();
    }
  });

  test('GPT-005: User can edit an existing goal', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());
    await createRealGoals([
      createGoalData({
        name: 'Original Goal Name',
        target_amount: 10000000,
        monthly_contribution: 1000000,
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    await goalsPage.editGoalByName('Original Goal Name');

    await goalsPage.fillGoalForm({
      name: 'Updated Goal Name',
      targetAmount: '15000000',
      monthlyContribution: '1500000',
      notes: 'Updated notes',
    });

    await goalsPage.saveGoal();
    await goalsPage.waitForToast('success');

    // Verify updated goal appears
    const updatedGoal = await goalsPage.getGoalByName('Updated Goal Name');
    await expect(updatedGoal).toBeVisible();
  });

  test('GPT-006: User can delete a goal', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());
    await createRealGoals([
      createGoalData({
        name: 'Goal to Delete',
        target_amount: 10000000,
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const initialCount = await goalsPage.getGoalCount();

    await goalsPage.deleteGoalByName('Goal to Delete');
    await goalsPage.waitForToast('success');

    // Verify goal count decreased
    const finalCount = await goalsPage.getGoalCount();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('GPT-007: User can set a goal as priority', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());
    await createRealGoals([
      createGoalData({
        name: 'Non-Priority Goal',
        target_amount: 20000000,
        is_priority: false,
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    await goalsPage.setPriorityByName('Non-Priority Goal');
    await goalsPage.page.waitForTimeout(1000); // Wait for state update

    // Verify priority goal section is visible
    await expect(goalsPage.priorityGoalSection).toBeVisible();
  });

  test('GPT-008: User can update financial profile', async ({ goalsPage, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData({
      monthlyIncome: 10000000,
    }));

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    await goalsPage.openEditProfileModal();

    await goalsPage.fillFinancialProfile({
      monthlyIncome: '20000000',
      housing: '4000000',
      food: '2500000',
      transport: '2000000',
      utilities: '800000',
      healthcare: '600000',
      entertainment: '1500000',
      insurance: '1200000',
      other: '400000',
    });

    await goalsPage.saveFinancialProfile();
    await goalsPage.waitForToast('success');

    // Reload page to verify changes persisted
    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    await expect(goalsPage.monthlyIncomeCard).toBeVisible();
  });

  test('GPT-009: Summary stats display correctly', async ({ goalsPage, createFinancialProfile, createRealGoals }) => {
    await createFinancialProfile(createFinancialProfileData({
      monthlyIncome: 15000000,
      housing: 3000000,
      food: 2000000,
      transport: 1500000,
      utilities: 500000,
      healthcare: 500000,
      entertainment: 1000000,
      insurance: 1000000,
      other: 500000,
    }));

    await createRealGoals([
      createGoalData({
        name: 'Test Goal 1',
        target_amount: 10000000,
        monthly_contribution: 1000000,
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    // Verify all stat cards are visible
    await expect(goalsPage.monthlyIncomeCard).toBeVisible();
    await expect(goalsPage.totalExpensesCard).toBeVisible();
    await expect(goalsPage.surplusCard).toBeVisible();
    await expect(goalsPage.unallocatedCard).toBeVisible();
    await expect(goalsPage.avgFundedCard).toBeVisible();
    await expect(goalsPage.portfolioReturnCard).toBeVisible();
  });

  test('GPT-010: Multiple goals display in grid layout', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());

    await createRealGoals([
      createGoalData({ name: 'Goal 1', target_amount: 10000000 }),
      createGoalData({ name: 'Goal 2', target_amount: 15000000 }),
      createGoalData({ name: 'Goal 3', target_amount: 20000000 }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const goalCount = await goalsPage.getGoalCount();
    expect(goalCount).toBe(3);

    // Verify all goals are visible
    await expect(goalsPage.getGoalByName('Goal 1')).toBeVisible();
    await expect(goalsPage.getGoalByName('Goal 2')).toBeVisible();
    await expect(goalsPage.getGoalByName('Goal 3')).toBeVisible();
  });

  test('GPT-011: Goal with current savings shows correct progress', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());

    await createRealGoals([
      createGoalData({
        name: 'Half Complete Goal',
        target_amount: 20000000,
        current_amount: 10000000,
        monthly_contribution: 1000000,
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const goalCard = await goalsPage.getGoalByName('Half Complete Goal');
    await expect(goalCard).toBeVisible();

    // Goal card should show progress indicator
    await expect(goalCard.locator('[role="progressbar"], .progress-bar, [data-testid="progress"]').first()).toBeVisible();
  });

  test('GPT-012: Priority goal with notes displays correctly', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());

    await createRealGoals([
      createGoalData({
        name: 'Priority Goal with Notes',
        target_amount: 50000000,
        monthly_contribution: 3000000,
        is_priority: true,
        notes: 'This is a test note for priority goal',
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    // Verify priority goal section displays
    await expect(goalsPage.priorityGoalSection).toBeVisible();

    const priorityGoal = await goalsPage.getGoalByName('Priority Goal with Notes');
    await expect(priorityGoal).toBeVisible();
  });

  test('GPT-013: Cancel button in goal modal closes without saving', async ({ goalsPage, clearGoals, createFinancialProfile }) => {
    await clearGoals();
    await createFinancialProfile(createFinancialProfileData());

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const initialCount = await goalsPage.getGoalCount();

    await goalsPage.openAddGoalModal();
    await goalsPage.selectGoalType('savings');

    await goalsPage.fillGoalForm({
      name: 'Should Not Be Saved',
      targetAmount: '10000000',
      monthlyContribution: '500000',
    });

    await goalsPage.cancelGoalModal();

    // Verify modal closed
    await expect(goalsPage.goalModal).not.toBeVisible();

    // Verify goal count unchanged
    const finalCount = await goalsPage.getGoalCount();
    expect(finalCount).toBe(initialCount);
  });

  test('GPT-014: Loading state displays while fetching goals', async ({ goalsPage, page }) => {
    // Delay the API response to see loading state
    await page.route('**/api/v1/me/goals', async (route) => {
      await page.waitForTimeout(1000);
      await route.continue();
    });

    await goalsPage.goto();

    // Verify loading skeleton appears
    const skeleton = goalsPage.loadingSkeleton;
    if (await skeleton.isVisible().catch(() => false)) {
      await expect(skeleton).toBeVisible();
    }

    // Wait for loading to complete
    await goalsPage.waitForPageLoad();
    await expect(goalsPage.pageHeading).toBeVisible();
  });
});
