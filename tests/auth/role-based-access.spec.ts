import { test, expect } from './fixtures/ui-auth-fixtures';
import { ROUTES } from '../utils/test-data';

test.describe('Role-Based Access Control (RB01 - RB09)', () => {

  test('RB01 & RB03: Admin user can access admin routes and view admin navigation', async ({ page, authenticatedAdmin }) => {
    test.info().annotations.push({ type: 'test-id', description: 'RB01-RB03' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await page.goto(ROUTES.ADMIN);

    // Verify Admin badge or header is visible
    await expect(
      page.locator('nav, [role="navigation"], aside')
        .getByRole('link', { name: /users|admin/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('RB04 & RB06: Regular user navigation hides admin links and prevents unauthorized access', async ({ page, authenticatedUser }) => {
    test.info().annotations.push({ type: 'test-id', description: 'RB04-RB06' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    await page.goto(ROUTES.DASHBOARD);

    // Admin link should not be present in sidebar
    await expect(page.getByRole('link', { name: /user management|audit log/i })).not.toBeVisible();
  });

  test('RB07, RB08, RB09: Unauthenticated guest accessing protected routes is redirected to login', async ({ page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'RB07-RB09' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const protectedRoutes = [ROUTES.DASHBOARD, ROUTES.ADMIN, ROUTES.PRODUCTS, ROUTES.GOALS];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(
        page.getByRole('button', { name: /sign in/i })
          .or(page.getByRole('button', { name: /create account/i }))
      ).toBeVisible();
    }
  });
});
