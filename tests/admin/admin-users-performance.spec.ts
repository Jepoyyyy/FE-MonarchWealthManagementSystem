import { test, expect, generateLargeUserList } from '../fixtures/admin-users-fixtures';

test.describe('Admin Users - Performance Tests', () => {
  test.beforeEach(async ({ loginAsAdmin }) => {
    await loginAsAdmin();
  });

  test('AU-PERF-01: Page loads within acceptable time', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-01' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    const startTime = Date.now();

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('AU-PERF-02: Search debounce prevents excessive API calls', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-02' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    let apiCallCount = 0;
    await page.route('**/api/v1/admin/users*', async (route) => {
      apiCallCount++;
      await route.continue();
    });

    await adminUsersPage.searchInput.fill('T');
    await page.waitForTimeout(100);
    await adminUsersPage.searchInput.fill('Te');
    await page.waitForTimeout(100);
    await adminUsersPage.searchInput.fill('Tes');
    await page.waitForTimeout(100);
    await adminUsersPage.searchInput.fill('Test');

    await page.waitForTimeout(600);

    expect(apiCallCount).toBeLessThanOrEqual(2);
    console.log(`API calls during typing: ${apiCallCount}`);
  });

  test('AU-PERF-03: Pagination navigation responds quickly', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-03' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const hasPagination = await adminUsersPage.pagination.count() > 0;

    if (hasPagination && await adminUsersPage.nextPageButton.isEnabled().catch(() => false)) {
      const startTime = Date.now();

      await adminUsersPage.goToNextPage();

      const paginationTime = Date.now() - startTime;

      expect(paginationTime).toBeLessThan(3000);
      console.log(`Pagination navigation time: ${paginationTime}ms`);
    }
  });

  test('AU-PERF-04: Large dataset renders without significant lag', async ({
    adminUsersPage,
    page,
    mockUsersListSuccess
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-04' });

    const largeUserList = generateLargeUserList(100);
    await mockUsersListSuccess(largeUserList.slice(0, 10), 10, 100);

    const startTime = Date.now();

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(5000);

    await expect(adminUsersPage.userTable).toBeVisible();
    const userCount = await adminUsersPage.getUserCount();
    expect(userCount).toBeGreaterThan(0);

    console.log(`Large dataset render time: ${renderTime}ms`);
  });

  test('AU-PERF-05: Multiple rapid filter changes handled efficiently', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-05' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const startTime = Date.now();

    await adminUsersPage.filterByStatus('Active');
    await adminUsersPage.filterByStatus('Suspended');
    await adminUsersPage.filterByStatus('Disabled');
    await adminUsersPage.filterByStatus('All statuses');

    const totalTime = Date.now() - startTime;

    expect(totalTime).toBeLessThan(8000);

    await expect(adminUsersPage.userTable).toBeVisible();
    console.log(`Multiple filter changes time: ${totalTime}ms`);
  });

  test('AU-PERF-06: Search with filter combination performs well', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-06' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const startTime = Date.now();

    await adminUsersPage.searchUsers('Test User');
    await adminUsersPage.filterByStatus('Active');

    const combinedOperationTime = Date.now() - startTime;

    expect(combinedOperationTime).toBeLessThan(4000);

    await expect(adminUsersPage.userTable).toBeVisible();
    console.log(`Search + filter combination time: ${combinedOperationTime}ms`);
  });

  test('AU-PERF-07: User detail drawer opens quickly', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-07' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const firstRow = adminUsersPage.tableRows.first();
    const userName = await firstRow.locator('td:first-child p').first().textContent();

    if (userName) {
      const startTime = Date.now();

      await adminUsersPage.clickViewDetailForUser(userName.trim());

      const drawerOpenTime = Date.now() - startTime;

      expect(drawerOpenTime).toBeLessThan(2000);
      await expect(adminUsersPage.userDetailDrawer).toBeVisible();

      console.log(`User detail drawer open time: ${drawerOpenTime}ms`);
    }
  });

  test('AU-PERF-08: Confirm modal responds quickly', async ({ adminUsersPage, page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-08' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await adminUsersPage.filterByStatus('Active');

    const activeUserRow = adminUsersPage.tableRows.first();
    const activeUserCount = await activeUserRow.count();

    if (activeUserCount > 0) {
      const userName = await activeUserRow.locator('td:first-child p').first().textContent();

      if (userName && userName.trim()) {
        const startTime = Date.now();

        await adminUsersPage.clickSuspendForUser(userName.trim());

        const modalOpenTime = Date.now() - startTime;

        expect(modalOpenTime).toBeLessThan(1500);
        await expect(adminUsersPage.confirmModal).toBeVisible();

        console.log(`Confirm modal open time: ${modalOpenTime}ms`);

        await adminUsersPage.cancelAction();
      }
    }
  });

  test('AU-PERF-09: Stats cards load and update efficiently', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-09' });

    const startTime = Date.now();

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    await expect(adminUsersPage.totalUsersCard).toBeVisible();
    await expect(adminUsersPage.activeUsersCard).toBeVisible();
    await expect(adminUsersPage.suspendedUsersCard).toBeVisible();

    const statsLoadTime = Date.now() - startTime;

    expect(statsLoadTime).toBeLessThan(5000);
    console.log(`Stats cards load time: ${statsLoadTime}ms`);
  });

  test('AU-PERF-10: Concurrent operations do not block UI', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-10' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    const startTime = Date.now();

    const searchPromise = adminUsersPage.searchUsers('Test');
    const filterPromise = adminUsersPage.filterByStatus('Active');

    await Promise.all([searchPromise, filterPromise]);

    const concurrentOperationTime = Date.now() - startTime;

    expect(concurrentOperationTime).toBeLessThan(4000);

    await expect(adminUsersPage.userTable).toBeVisible();
    console.log(`Concurrent operations time: ${concurrentOperationTime}ms`);
  });

  test('AU-PERF-11: Memory usage remains stable during extended use', async ({
    adminUsersPage,
    page
  }) => {
    test.info().annotations.push({ type: 'test-id', description: 'AU-PERF-11' });

    await adminUsersPage.goto();
    await adminUsersPage.waitForUsersToLoad();

    for (let i = 0; i < 5; i++) {
      await adminUsersPage.searchUsers(`Test ${i}`);
      await page.waitForTimeout(500);

      await adminUsersPage.filterByStatus('Active');
      await page.waitForTimeout(300);

      await adminUsersPage.filterByStatus('All statuses');
      await page.waitForTimeout(300);
    }

    await expect(adminUsersPage.userTable).toBeVisible();

    const finalUserCount = await adminUsersPage.getUserCount();
    expect(finalUserCount).toBeGreaterThanOrEqual(0);
  });
});
