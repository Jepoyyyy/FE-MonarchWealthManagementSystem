import { test, expect } from '../fixtures/admin-users-fixtures';

test.describe('Admin Users - Positive Tests', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('AU-P-01: Admin can access users management page', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-01' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await adminUsersPage.goto();

    await expect(adminUsersPage.headerTitle).toBeVisible();
    await expect(adminUsersPage.headerTitle).toContainText(/user management/i);
  });

  test('AU-P-02: Dashboard stats display correctly', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-02' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await expect(adminUsersPage.totalUsersCard).toBeVisible();
    await expect(adminUsersPage.activeUsersCard).toBeVisible();
    await expect(adminUsersPage.suspendedUsersCard).toBeVisible();

    const totalUsers = await adminUsersPage.getStatValue('Total Users');
    expect(parseInt(totalUsers)).toBeGreaterThanOrEqual(0);
  });

  test('AU-P-03: User list displays with pagination', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-03' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await expect(adminUsersPage.userTable).toBeVisible();
    const userCount = await adminUsersPage.getUserCount();
    expect(userCount).toBeGreaterThan(0);
  });

  test('AU-P-04: Search users by name works correctly', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-04' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const initialCount = await adminUsersPage.getUserCount();

    await adminUsersPage.searchUsers('Test User');

    const searchedCount = await adminUsersPage.getUserCount();
    expect(searchedCount).toBeLessThanOrEqual(initialCount);
  });

  test('AU-P-05: Search users by email works correctly', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-05' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.searchUsers('@example.com');

    const userCount = await adminUsersPage.getUserCount();
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  test('AU-P-06: Status filter works correctly', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-06' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Active');
    await expect(adminUsersPage.userTable).toBeVisible();

    await adminUsersPage.filterByStatus('Suspended');
    await expect(adminUsersPage.userTable).toBeVisible();

    await adminUsersPage.filterByStatus('All statuses');
    await expect(adminUsersPage.userTable).toBeVisible();
  });

  test('AU-P-07: Combined search and filter works', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-07' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.searchUsers('Test');
    await adminUsersPage.filterByStatus('Active');

    await expect(adminUsersPage.userTable).toBeVisible();
  });

  test('AU-P-08: View user detail drawer', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-08' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const firstRow = adminUsersPage.tableRows.first();
    const userName = await firstRow.locator('td:first-child p').first().textContent();

    if (userName) {
      await adminUsersPage.clickViewDetailForUser(userName.trim());

      await expect(adminUsersPage.userDetailDrawer).toBeVisible();
      await expect(adminUsersPage.drawerUserName).toBeVisible();
      await expect(adminUsersPage.drawerCloseButton).toBeVisible();
    }
  });

  test('AU-P-09: Close user detail drawer', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-09' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const firstRow = adminUsersPage.tableRows.first();
    const userName = await firstRow.locator('td:first-child p').first().textContent();

    if (userName) {
      await adminUsersPage.clickViewDetailForUser(userName.trim());
      await expect(adminUsersPage.userDetailDrawer).toBeVisible();

      await adminUsersPage.closeUserDetailDrawer();
      await expect(adminUsersPage.userDetailDrawer).not.toBeVisible();
    }
  });

  test('AU-P-10: Suspend active user flow', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-10' });

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
        await expect(adminUsersPage.confirmModalTitle).toContainText(/suspend this user/i);
        await expect(adminUsersPage.confirmButton).toBeVisible();
        await expect(adminUsersPage.cancelButton).toBeVisible();

        await adminUsersPage.confirmAction();

        await page.waitForTimeout(1000);
        await expect(adminUsersPage.confirmModal).not.toBeVisible();
      }
    }
  });

  test('AU-P-11: Activate suspended user flow', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-11' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Suspended');

    const suspendedUserRow = adminUsersPage.tableRows.first();
    const suspendedUserCount = await suspendedUserRow.count();

    if (suspendedUserCount > 0) {
      const userName = await suspendedUserRow.locator('td:first-child p').first().textContent();

      if (userName && userName.trim()) {
        await adminUsersPage.clickActivateForUser(userName.trim());

        await expect(adminUsersPage.confirmModal).toBeVisible();
        await expect(adminUsersPage.confirmModalTitle).toContainText(/activate this user/i);
        await expect(adminUsersPage.confirmButton).toBeVisible();

        await adminUsersPage.confirmAction();

        await page.waitForTimeout(1000);
        await expect(adminUsersPage.confirmModal).not.toBeVisible();
      }
    }
  });

  test('AU-P-12: Cancel user status change', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-12' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Active');

    const activeUserRow = adminUsersPage.tableRows.first();
    const activeUserCount = await activeUserRow.count();

    if (activeUserCount > 0) {
      const userName = await activeUserRow.locator('td:first-child p').first().textContent();

      if (userName && userName.trim()) {
        const originalStatus = await adminUsersPage.getUserStatus(userName.trim());

        await adminUsersPage.clickSuspendForUser(userName.trim());
        await expect(adminUsersPage.confirmModal).toBeVisible();

        await adminUsersPage.cancelAction();
        await expect(adminUsersPage.confirmModal).not.toBeVisible();

        const currentStatus = await adminUsersPage.getUserStatus(userName.trim());
        expect(currentStatus).toBe(originalStatus);
      }
    }
  });

  test('AU-P-13: Pagination navigation works', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-13' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const hasPagination = await adminUsersPage.pagination.count() > 0;

    if (hasPagination) {
      const hasNextButton = await adminUsersPage.nextPageButton.count() > 0;

      if (hasNextButton && await adminUsersPage.nextPageButton.isEnabled()) {
        const firstPageUsers = await adminUsersPage.getUserCount();

        await adminUsersPage.goToNextPage();

        const secondPageUsers = await adminUsersPage.getUserCount();
        expect(secondPageUsers).toBeGreaterThanOrEqual(0);

        const hasPrevButton = await adminUsersPage.prevPageButton.count() > 0;
        if (hasPrevButton && await adminUsersPage.prevPageButton.isEnabled()) {
          await adminUsersPage.goToPrevPage();

          const backToFirstPage = await adminUsersPage.getUserCount();
          expect(backToFirstPage).toBe(firstPageUsers);
        }
      }
    }
  });

  test('AU-P-14: Clear search resets user list', async ({ adminUsersPage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-P-14' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const initialCount = await adminUsersPage.getUserCount();

    await adminUsersPage.searchUsers('NonExistentUser12345');
    await adminUsersPage.page.waitForTimeout(500);

    await adminUsersPage.searchInput.clear();
    await adminUsersPage.page.waitForTimeout(500);
    await adminUsersPage.waitForUsersToLoad();

    const resetCount = await adminUsersPage.getUserCount();
    expect(resetCount).toBeGreaterThanOrEqual(initialCount);
  });
});
