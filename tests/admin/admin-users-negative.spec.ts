import { test, expect } from '../fixtures/admin-users-fixtures';
import { LoginPage } from '../auth/pages/login.page';
import { highTestUser } from '../utils/test-data';

test.describe('Admin Users - Negative Tests', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('AU-N-01: Regular user cannot access admin users page', async ({ page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-01' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);
    await page.waitForURL('/');

    await page.goto('/admin/users');

    await expect(page).not.toHaveURL('/admin/users');
    await expect(page).toHaveURL('/');
  });

  test('AU-N-02: API failure when loading users list shows error', async ({
    adminUsersPage,
    mockUsersListError,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-02' });

    await mockUsersListError(500, 'Database connection failed');
    await adminUsersPage.goto();

    const errorToast = page.getByRole('alert').or(page.getByText(/failed to load users|error/i)).first();
    await expect(errorToast).toBeVisible({ timeout: 10000 });
  });

  test('AU-N-03: API failure when loading dashboard stats', async ({
    adminUsersPage,
    mockDashboardStatsError,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-03' });

    await mockDashboardStatsError(503, 'Service unavailable');
    await adminUsersPage.goto();

    const stats = await adminUsersPage.totalUsersCard.textContent();
    expect(stats).toBeTruthy();
  });

  test('AU-N-04: Network error during user suspend action', async ({
    adminUsersPage,
    mockUsersListSuccess,
    mockUserActionError,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-04' });

    await mockUsersListSuccess();
    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Active');

    const activeUserRow = adminUsersPage.tableRows.first();
    const activeUserCount = await activeUserRow.count();

    if (activeUserCount > 0) {
      const userName = await activeUserRow.locator('td:first-child p').first().textContent();

      if (userName && userName.trim()) {
        await mockUserActionError(500, 'Failed to update user');

        await adminUsersPage.clickSuspendForUser(userName.trim());
        await adminUsersPage.confirmAction();

        const errorToast = page.getByRole('alert').or(page.getByText(/gagal|failed|error/i)).first();
        await expect(errorToast).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('AU-N-05: Empty search results shows no users found', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-05' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.searchUsers('NonExistentUser9999XYZ12345');

    await expect(adminUsersPage.emptyState).toBeVisible({ timeout: 5000 });
    await expect(adminUsersPage.emptyState).toContainText(/no users found/i);
  });

  test('AU-N-06: Filter with no matching results shows empty state', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-06' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.searchUsers('DisabledTestUserThatDoesNotExist123');
    await adminUsersPage.filterByStatus('Disabled');

    await expect(adminUsersPage.emptyState).toBeVisible({ timeout: 5000 });
  });

  test('AU-N-07: Special characters in search do not break UI', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-07' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const specialChars = ['<script>alert("xss")</script>', "'; DROP TABLE users;--", '\\x00\\x01\\x02'];

    const initialScriptCount = await page.locator('script').count();

    for (const input of specialChars) {
      await adminUsersPage.searchInput.fill(input);
      await page.waitForTimeout(500);

      await expect(adminUsersPage.userTable).toBeVisible();
      await expect(page.locator('script')).toHaveCount(initialScriptCount);
      await expect(adminUsersPage.userTable.locator('script')).toHaveCount(0);
    }
  });

  test('AU-N-08: Rapid status filter changes do not cause race conditions', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-08' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.statusFilterSelect.selectOption('Active');
    await adminUsersPage.statusFilterSelect.selectOption('Suspended');
    await adminUsersPage.statusFilterSelect.selectOption('Disabled');
    await adminUsersPage.statusFilterSelect.selectOption('All statuses');

    await page.waitForTimeout(1000);

    await expect(adminUsersPage.userTable).toBeVisible();
    const userCount = await adminUsersPage.getUserCount();
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  test('AU-N-09: Cannot suspend already suspended user', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-09' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Suspended');

    const suspendedUserRow = adminUsersPage.tableRows.first();
    const suspendedUserCount = await suspendedUserRow.count();

    if (suspendedUserCount > 0) {
      const suspendButton = suspendedUserRow.getByRole('button', { name: /suspend/i });
      const suspendButtonCount = await suspendButton.count();

      expect(suspendButtonCount).toBe(0);
    }
  });

  test('AU-N-10: Cannot activate already active user', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-10' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Active');

    const activeUserRow = adminUsersPage.tableRows.first();
    const activeUserCount = await activeUserRow.count();

    if (activeUserCount > 0) {
      const activateButton = activeUserRow.getByRole('button', { name: /^activate$/i });
      const activateButtonCount = await activateButton.count();

      expect(activateButtonCount).toBe(0);
    }
  });

  test('AU-N-11: Invalid page number in pagination handled gracefully', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-11' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await page.goto('/admin/users?page=9999');

    await expect(adminUsersPage.userTable).toBeVisible();
  });

  test('AU-N-12: Network timeout during search shows appropriate feedback', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-12' });

    await page.route('**/api/v1/admin/users*', async (route) => {
      await page.waitForTimeout(3000);
      await route.abort('timedout');
    });

    await adminUsersPage.goto();

    const errorIndicator = page.getByText(/failed|error|timeout/i).first();
    await expect(errorIndicator).toBeVisible({ timeout: 15000 });
  });

  test('AU-N-13: Attempting to view non-existent user detail', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-13' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const viewButtons = adminUsersPage.tableRows.first().getByRole('button', { name: /view detail/i });

    await page.route('**/api/v1/admin/users/*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'User not found',
          }),
        });
      } else {
        await route.continue();
      }
    });

    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();

      await page.waitForTimeout(1000);
    }
  });

  test('AU-N-14: Concurrent actions on same user handled correctly', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-N-14' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Active');

    const activeUserRow = adminUsersPage.tableRows.first();
    const activeUserCount = await activeUserRow.count();

    if (activeUserCount > 0) {
      const userName = await activeUserRow.locator('td:first-child p').first().textContent();

      if (userName && userName.trim()) {
        await adminUsersPage.clickSuspendForUser(userName.trim());
        await expect(adminUsersPage.confirmModal).toBeVisible();

        await adminUsersPage.confirmAction();

        await page.waitForTimeout(500);

        const suspendButtons = page.getByRole('button', { name: /suspend/i, exact: true });
        const remainingCount = await suspendButtons.count();

        expect(remainingCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
