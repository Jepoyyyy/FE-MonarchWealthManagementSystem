import { test as base, expect } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { LoginPage } from '../auth/pages/login.page';
import { highTestUser } from '../utils/test-data';

type ProductsFixtures = {
  productsPage: ProductsPage;
};

export const test = base.extend<ProductsFixtures>({
  productsPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const userData = highTestUser();
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);
    
    // Navigate to products
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    
    await use(productsPage);
  },
});

export { expect };
