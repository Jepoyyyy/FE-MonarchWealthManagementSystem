import { test, expect } from '@playwright/test';
import { LoginPage } from '../auth/pages/login.page';
import { adminTest, highTestUser } from '../utils/test-data';

test.describe('Product - Admin Role Redirect (P36-P37)', () => {
  
  test('P36: Admin user redirected to /admin/products', async ({ page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P36' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const loginPage = new LoginPage(page);
    const adminData = adminTest();
    await loginPage.goto();
    await loginPage.login(adminData.email, adminData.password);
    
    await page.goto('/products');
    await expect(page).toHaveURL('/admin/products', { timeout: 5000 });
  });

  test('P37: Regular user cannot access admin products page', async ({ page }) => {
    test.info().annotations.push({ type: 'test-id', description: 'P37' });
    test.info().annotations.push({ type: 'priority', description: 'P0-critical' });

    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);
    
    await page.goto('/admin/products');
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/admin/products');
  });
});
