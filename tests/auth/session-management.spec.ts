import { test, expect } from './fixtures/ui-auth-fixtures';
import { getAuthFromStorage, clearAuthStorage } from '../utils/auth-helpers';
import { ROUTES } from '../utils/test-data';

test.describe('Session Management (S01 - S08)', () => {

  test('S01: Page refresh preserves authentication state', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'S01' });

    await page.goto(ROUTES.DASHBOARD);

    const authBefore = await getAuthFromStorage(page);
    expect(authBefore).toBeTruthy();
    expect(authBefore.state.token).toBeTruthy();

    await page.reload();

    const authAfter = await getAuthFromStorage(page);
    expect(authAfter).toBeTruthy();
    expect(authAfter.state.token).toBe(authBefore.state.token);

    await expect(
      page.getByRole('button', { name: /sign out|logout/i })
    ).toBeVisible();
  });

  test('S03: Navigation between routes preserves active session', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'S03' });

    await page.goto(ROUTES.DASHBOARD);
    await page.goto(ROUTES.GOALS);

    await expect(
      page.getByRole('button', { name: /sign out|logout/i })
    ).toBeVisible();
  });

  test('S05: Cleared token in storage forces re-authentication on refresh', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'S05' });

    await page.goto(ROUTES.DASHBOARD);
    await clearAuthStorage(page);
    await page.reload();

    await expect(
      page.getByRole('button', { name: /sign in/i })
        .or(page.getByRole('button', { name: /create account/i }))
    ).toBeVisible();
  });

  test('S07: Multiple browser tabs share authentication state', async ({ page, context, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'S07' });

    await page.goto(ROUTES.DASHBOARD);

    const secondTab = await context.newPage();
    await secondTab.goto(ROUTES.DASHBOARD);

    await expect(page.getByRole('button', { name: /sign out|logout/i })).toBeVisible();
    await expect(secondTab.getByRole('button', { name: /sign out|logout/i })).toBeVisible();

    await secondTab.close();
  });
});
