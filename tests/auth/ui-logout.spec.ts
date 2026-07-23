import { test, expect } from './fixtures/ui-auth-fixtures';
import { getAuthFromStorage, verifyLoggedOut, clearAuthStorage } from '../utils/auth-helpers';
import { ROUTES } from '../utils/test-data';

test.describe('Logout Flow - UI (LO01 - LO07)', () => {

  test('LO01: Logout from user menu → Redirect to login', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'LO01' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    await page.goto(ROUTES.DASHBOARD);

    const logoutBtn = page.getByRole('button', { name: /sign out|logout/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await verifyLoggedOut(page);
  });

  test('LO02: Session state cleared from storage on logout', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'LO02' });

    await page.goto(ROUTES.DASHBOARD);

    const authBefore = await getAuthFromStorage(page);
    expect(authBefore).toBeTruthy();

    await page.getByRole('button', { name: /sign out|logout/i }).click();

    await expect(page).toHaveURL('/login');

    const authAfter = await getAuthFromStorage(page);
    expect(authAfter).toBeNull();
  });

  test('LO03: Accessing protected route after logout redirects to login', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'LO03' });

    await page.goto(ROUTES.DASHBOARD);
    await page.getByRole('button', { name: /sign out|logout/i }).click();

    await expect(page).toHaveURL('/login');

    await page.goto(ROUTES.GOALS);
    await expect(page).toHaveURL("/login");
  });

  test('LO05: Double logout or cleared storage gracefully handled', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'LO05' });

    await page.goto(ROUTES.DASHBOARD);
    await clearAuthStorage(page);
    await page.reload();

    await expect(page).toHaveURL("/login");
  });

  test('LO07: Back button after logout cannot access protected dashboard', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'LO07' });

    await page.goto(ROUTES.GOALS);
    await page.goto(ROUTES.DASHBOARD);

    await page.getByRole('button', { name: /sign out|logout/i }).click();
    await expect(page).toHaveURL('/login');

    await page.goBack();
    // Re-verify user is redirected to login when trying to access protected route via back button
    await expect(page).toHaveURL("/login");
  });
});
