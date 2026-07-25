import { test, expect, createGoalData, createFinancialProfileData } from '../fixtures/goals-fixtures';
import { PerformanceCollector } from '../utils/performance-collector';

test.describe('Goals Page - Performance Tests', () => {

  test('GPF-001: Goals page loads within acceptable time', async ({ goalsPage, createFinancialProfile, page }) => {
    await createFinancialProfile(createFinancialProfileData());

    const collector = new PerformanceCollector(page);
    await collector.start();

    const startTime = Date.now();
    await goalsPage.goto();
    await goalsPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    const metrics = await collector.stop();

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    console.log(`Goals page load time: ${loadTime}ms`);
    console.log('Performance metrics:', JSON.stringify(metrics, null, 2));
  });

  test('GPF-002: Goals page with 10 goals renders efficiently', async ({ goalsPage, createRealGoals, createFinancialProfile, page }) => {
    await createFinancialProfile(createFinancialProfileData());

    // Create 10 goals
    const goals = Array.from({ length: 10 }, (_, i) =>
      createGoalData({
        name: `Performance Test Goal ${i + 1}`,
        target_amount: 10000000 + (i * 1000000),
        monthly_contribution: 500000 + (i * 50000),
      })
    );

    await createRealGoals(goals);

    const collector = new PerformanceCollector(page);
    await collector.start();

    const startTime = Date.now();
    await goalsPage.goto();
    await goalsPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    const metrics = await collector.stop();

    // Should still load reasonably fast with 10 goals
    expect(loadTime).toBeLessThan(4000);

    // Verify all goals rendered
    const goalCount = await goalsPage.getGoalCount();
    expect(goalCount).toBe(10);

    console.log(`Goals page with 10 goals load time: ${loadTime}ms`);
    console.log('Performance metrics:', JSON.stringify(metrics, null, 2));
  });

  test('GPF-003: Goal creation completes within acceptable time', async ({ goalsPage, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const startTime = Date.now();

    await goalsPage.openAddGoalModal();
    await goalsPage.selectGoalType('savings');

    await goalsPage.fillGoalForm({
      name: 'Performance Test Goal',
      targetAmount: '20000000',
      currentSaved: '1000000',
      monthlyContribution: '1000000',
    });

    await goalsPage.saveGoal();
    await goalsPage.waitForToast('success');

    const creationTime = Date.now() - startTime;

    // Goal creation should complete within 5 seconds
    expect(creationTime).toBeLessThan(5000);
    console.log(`Goal creation time: ${creationTime}ms`);
  });

  test('GPF-004: Goal update completes within acceptable time', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());
    await createRealGoals([
      createGoalData({
        name: 'Goal to Update',
        target_amount: 10000000,
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const startTime = Date.now();

    await goalsPage.editGoalByName('Goal to Update');

    await goalsPage.fillGoalForm({
      targetAmount: '15000000',
      monthlyContribution: '1500000',
    });

    await goalsPage.saveGoal();
    await goalsPage.waitForToast('success');

    const updateTime = Date.now() - startTime;

    // Goal update should complete within 5 seconds
    expect(updateTime).toBeLessThan(5000);
    console.log(`Goal update time: ${updateTime}ms`);
  });

  test('GPF-005: Goal deletion completes within acceptable time', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());
    await createRealGoals([
      createGoalData({
        name: 'Goal to Delete',
        target_amount: 10000000,
      }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const startTime = Date.now();

    await goalsPage.deleteGoalByName('Goal to Delete');
    await goalsPage.waitForToast('success');

    const deleteTime = Date.now() - startTime;

    // Goal deletion should complete within 4 seconds
    expect(deleteTime).toBeLessThan(4000);
    console.log(`Goal deletion time: ${deleteTime}ms`);
  });

  test('GPF-006: Financial profile update completes within acceptable time', async ({ goalsPage, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const startTime = Date.now();

    await goalsPage.openEditProfileModal();

    await goalsPage.fillFinancialProfile({
      monthlyIncome: '25000000',
      housing: '5000000',
      food: '3000000',
      transport: '2000000',
    });

    await goalsPage.saveFinancialProfile();
    await goalsPage.waitForToast('success');

    const updateTime = Date.now() - startTime;

    // Financial profile update should complete within 5 seconds
    expect(updateTime).toBeLessThan(5000);
    console.log(`Financial profile update time: ${updateTime}ms`);
  });

  test('GPF-007: Modal open/close performance', async ({ goalsPage, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    // Measure modal open time
    const openStartTime = Date.now();
    await goalsPage.openAddGoalModal();
    const openTime = Date.now() - openStartTime;

    // Measure modal close time
    const closeStartTime = Date.now();
    await goalsPage.cancelGoalModal();
    const closeTime = Date.now() - closeStartTime;

    // Modal interactions should be fast
    expect(openTime).toBeLessThan(1000);
    expect(closeTime).toBeLessThan(1000);

    console.log(`Modal open time: ${openTime}ms, close time: ${closeTime}ms`);
  });

  test('GPF-008: API response time for goals list', async ({ goalsPage, createRealGoals, createFinancialProfile, page }) => {
    await createFinancialProfile(createFinancialProfileData());

    // Create multiple goals
    const goals = Array.from({ length: 5 }, (_, i) =>
      createGoalData({
        name: `API Test Goal ${i + 1}`,
        target_amount: 10000000,
      })
    );

    await createRealGoals(goals);

    // Measure API response time
    const apiResponseTime = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const startTime = performance.now();
        fetch('/api/v1/me/goals', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
          .then(() => {
            const endTime = performance.now();
            resolve(endTime - startTime);
          })
          .catch(() => resolve(0));
      });
    });

    // API should respond within 2 seconds
    expect(apiResponseTime).toBeLessThan(2000);
    console.log(`Goals API response time: ${apiResponseTime}ms`);
  });

  test('GPF-009: Rapid sequential goal creation performance', async ({ goalsPage, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const startTime = Date.now();

    // Create 3 goals in rapid succession
    for (let i = 1; i <= 3; i++) {
      await goalsPage.openAddGoalModal();
      await goalsPage.selectGoalType('savings');

      await goalsPage.fillGoalForm({
        name: `Rapid Goal ${i}`,
        targetAmount: '10000000',
        monthlyContribution: '500000',
      });

      await goalsPage.saveGoal();
      await goalsPage.page.waitForTimeout(500); // Brief wait between operations
    }

    const totalTime = Date.now() - startTime;

    // All 3 goals should be created within 15 seconds
    expect(totalTime).toBeLessThan(15000);

    // Verify all goals were created
    const goalCount = await goalsPage.getGoalCount();
    expect(goalCount).toBeGreaterThanOrEqual(3);

    console.log(`Rapid creation of 3 goals total time: ${totalTime}ms (avg: ${Math.round(totalTime / 3)}ms per goal)`);
  });

  test('GPF-010: Page responsiveness with 15+ goals', async ({ goalsPage, createRealGoals, createFinancialProfile, page }) => {
    await createFinancialProfile(createFinancialProfileData());

    // Create 15 goals (stress test)
    const goals = Array.from({ length: 15 }, (_, i) =>
      createGoalData({
        name: `Stress Test Goal ${i + 1}`,
        target_amount: 5000000 + (i * 500000),
        monthly_contribution: 300000 + (i * 20000),
      })
    );

    await createRealGoals(goals);

    const collector = new PerformanceCollector(page);
    await collector.start();

    const startTime = Date.now();
    await goalsPage.goto();
    await goalsPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    const metrics = await collector.stop();

    // Even with 15 goals, should load within reasonable time
    expect(loadTime).toBeLessThan(6000);

    // Verify all goals rendered
    const goalCount = await goalsPage.getGoalCount();
    expect(goalCount).toBe(15);

    console.log(`Goals page with 15 goals load time: ${loadTime}ms`);
    console.log('Performance metrics:', JSON.stringify(metrics, null, 2));
  });

  test('GPF-011: Summary stats calculation performance', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData({
      monthlyIncome: 20000000,
      housing: 4000000,
      food: 2500000,
      transport: 2000000,
      utilities: 800000,
      healthcare: 600000,
      entertainment: 1500000,
      insurance: 1200000,
      other: 400000,
    }));

    await createRealGoals([
      createGoalData({ name: 'Goal 1', target_amount: 10000000, monthly_contribution: 1000000 }),
      createGoalData({ name: 'Goal 2', target_amount: 15000000, monthly_contribution: 1500000 }),
      createGoalData({ name: 'Goal 3', target_amount: 20000000, monthly_contribution: 2000000 }),
    ]);

    const startTime = Date.now();
    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    // Wait for all stat cards to be visible
    await expect(goalsPage.monthlyIncomeCard).toBeVisible();
    await expect(goalsPage.totalExpensesCard).toBeVisible();
    await expect(goalsPage.surplusCard).toBeVisible();
    await expect(goalsPage.unallocatedCard).toBeVisible();

    const calculationTime = Date.now() - startTime;

    // Stats should calculate and display quickly
    expect(calculationTime).toBeLessThan(4000);
    console.log(`Summary stats calculation time: ${calculationTime}ms`);
  });

  test('GPF-012: Priority goal switching performance', async ({ goalsPage, createRealGoals, createFinancialProfile }) => {
    await createFinancialProfile(createFinancialProfileData());
    await createRealGoals([
      createGoalData({ name: 'Goal A', target_amount: 15000000, is_priority: true }),
      createGoalData({ name: 'Goal B', target_amount: 12000000, is_priority: false }),
    ]);

    await goalsPage.goto();
    await goalsPage.waitForPageLoad();

    const startTime = Date.now();
    await goalsPage.setPriorityByName('Goal B');
    await goalsPage.page.waitForTimeout(1000); // Wait for UI to update
    const switchTime = Date.now() - startTime;

    // Priority switching should be fast
    expect(switchTime).toBeLessThan(3000);
    console.log(`Priority goal switching time: ${switchTime}ms`);
  });
});
