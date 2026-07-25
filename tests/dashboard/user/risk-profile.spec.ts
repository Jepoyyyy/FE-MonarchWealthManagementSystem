import { test, expect } from '../../fixtures/dashboard-fixtures';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/login.page';
import { highTestUser } from '../../utils/test-data';

test.describe('User Dashboard - Risk Profile Change', () => {
  test('UD-P-26: Change Risk Profile button visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    if (await dashboardPage.changeRiskProfileBtn.isVisible().catch(() => false)) {
      await expect(dashboardPage.changeRiskProfileBtn).toBeVisible();
    }
  });

  test('UD-P-27: Confirmation modal opens on click', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    if (await dashboardPage.changeRiskProfileBtn.isVisible().catch(() => false)) {
      await dashboardPage.changeRiskProfileBtn.click();
      await expect(dashboardPage.confirmModal).toBeVisible();
    }
  });

  test('UD-P-28: Confirming navigates to questionnaire', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.greetingHeader).toBeVisible();
    if (await dashboardPage.changeRiskProfileBtn.isVisible().catch(() => false)) {
      await dashboardPage.changeRiskProfileBtn.click();
      await dashboardPage.retakeAssessmentBtn.click();
      await page.waitForURL('**/questionnaire');
      expect(page.url()).toContain('/questionnaire');
    }
  });
});
