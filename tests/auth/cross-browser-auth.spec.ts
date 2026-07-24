import { test, expect } from './fixtures/ui-auth-fixtures';
import { generateTestUser, highTestUser } from '../utils/test-data';

test.describe('Cross-Browser Authentication Functionality', () => {

  test('User authentication flow across configured browser engines', async ({ page, loginPage }) => {
    const userData = highTestUser();

    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    await expect(
      page.getByRole('button', { name: /sign out|logout/i })
        .or(page.locator('text=Overview'))
    ).toBeVisible({ timeout: 15000 });
  });
});
