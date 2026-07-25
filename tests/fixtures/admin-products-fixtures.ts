import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../auth/pages/login.page';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { adminTest } from '../utils/test-data';

type AdminProductsFixtures = {
  loginAsAdmin: () => Promise<void>;
  adminProductsPage: AdminProductsPage;
  mockProductsListError: (status?: number, message?: string) => Promise<void>;
  mockProductActionError: (status?: number, message?: string) => Promise<void>;
  mockProductsListSuccess: (products?: any[], totalPages?: number, totalElements?: number) => Promise<void>;
  mockProductCreateSuccess: (product?: any) => Promise<void>;
  mockProductUpdateSuccess: (product?: any) => Promise<void>;
};

export const test = base.extend<AdminProductsFixtures>({
  loginAsAdmin: async ({ page }, use) => {
    const fn = async () => {
      const loginPage = new LoginPage(page);
      const adminData = adminTest();
      await loginPage.goto();
      await loginPage.login(adminData.email, adminData.password);
      await page.waitForURL(/\/admin|\//);
    };
    await use(fn);
  },

  adminProductsPage: async ({ page }, use) => {
    const adminProductsPage = new AdminProductsPage(page);

    await page.route('**/api/v1/admin/products*', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      const url = new URL(route.request().url());
      const searchParam = url.searchParams.get('search');
      const typeParam = url.searchParams.get('type');
      let filtered = generateMockProducts(15);

      if (searchParam) {
        const q = searchParam.toLowerCase();
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.issuer.toLowerCase().includes(q)
        );
      }

      if (typeParam) {
        filtered = filtered.filter((p) => p.type === typeParam);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          result: {
            content: filtered,
            totalPages: Math.ceil(filtered.length / 15) || 1,
            totalElements: filtered.length,
            number: 0,
            size: 15,
          },
        }),
      });
    });

    await page.route('**/api/v1/admin/products', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        const newProduct = {
          id: `product-${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 201,
            result: newProduct,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/v1/admin/products/*', async (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON();
        const updatedProduct = {
          id: route.request().url().split('/').pop(),
          ...body,
          updatedAt: new Date().toISOString(),
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: updatedProduct,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await use(adminProductsPage);
  },

  mockProductsListError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Failed to load products') => {
      await page.route('**/api/v1/admin/products*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message,
            }),
          });
        } else {
          await route.continue();
        }
      });
    };
    await use(fn);
  },

  mockProductActionError: async ({ page }, use) => {
    const fn = async (status = 500, message = 'Failed to update product') => {
      await page.route('**/api/v1/admin/products**', async (route) => {
        if (route.request().method() === 'POST' ||
            route.request().method() === 'PUT' ||
            route.request().method() === 'PATCH') {
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message,
            }),
          });
        } else {
          await route.continue();
        }
      });
    };
    await use(fn);
  },

  mockProductsListSuccess: async ({ page }, use) => {
    const fn = async (products = generateMockProducts(15), totalPages = 1, totalElements = 15) => {
      await page.route('**/api/v1/admin/products*', async (route) => {
        if (route.request().method() !== 'GET') {
          return route.continue();
        }
        const url = new URL(route.request().url());
        const searchParam = url.searchParams.get('search');
        const typeParam = url.searchParams.get('type');
        let filtered = products;

        if (searchParam) {
          const q = searchParam.toLowerCase();
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.issuer.toLowerCase().includes(q)
          );
        }

        if (typeParam) {
          filtered = filtered.filter((p) => p.type === typeParam);
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            result: {
              content: filtered,
              totalPages,
              totalElements: filtered.length,
              number: 0,
              size: 15,
            },
          }),
        });
      });
    };
    await use(fn);
  },

  mockProductCreateSuccess: async ({ page }, use) => {
    const fn = async (product?: any) => {
      await page.route('**/api/v1/admin/products', async (route) => {
        if (route.request().method() === 'POST') {
          const body = route.request().postDataJSON();
          const newProduct = product || {
            id: `product-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 201,
              result: newProduct,
            }),
          });
        } else {
          await route.continue();
        }
      });
    };
    await use(fn);
  },

  mockProductUpdateSuccess: async ({ page }, use) => {
    const fn = async (product?: any) => {
      await page.route('**/api/v1/admin/products/*', async (route) => {
        if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
          const body = route.request().postDataJSON();
          const updatedProduct = product || {
            id: route.request().url().split('/').pop(),
            ...body,
            updatedAt: new Date().toISOString(),
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 200,
              result: updatedProduct,
            }),
          });
        } else {
          await route.continue();
        }
      });
    };
    await use(fn);
  },
});

export { expect };

export function generateMockProducts(count: number = 15) {
  const products = [];
  const types = ['Stocks', 'Mutual Funds', 'Bonds', 'SBN', 'Sukuk'];
  const issuers = ['Pemerintah RI', 'PT Manulife', 'Bank Mandiri', 'BRI', 'BCA'];

  for (let i = 1; i <= count; i++) {
    const type = types[i % types.length];
    products.push({
      id: `product-${i}`,
      code: `PRD${String(i).padStart(3, '0')}`,
      name: `Test Product ${i}`,
      issuer: issuers[i % issuers.length],
      type,
      riskLevel: (i % 5) + 1,
      annualReturn: 5.0 + (i % 10),
      minInvestment: 100000 * (i % 5 + 1),
      currentPrice: 1000 * i,
      description: `Description for test product ${i}`,
      tenor: i % 2 === 0 ? `${i} Years` : null,
      lotSize: i % 3 === 0 ? 100 : 1,
      isFractionalAllowed: i % 2 === 0,
      visible: i % 3 !== 0,
      createdAt: new Date(2024, 0, i).toISOString(),
      updatedAt: new Date(2024, 6, i).toISOString(),
    });
  }

  return products;
}

export function generateMockProduct(overrides: Partial<any> = {}) {
  return {
    id: `product-${Date.now()}`,
    code: 'SBN001',
    name: 'Mock Product',
    issuer: 'Pemerintah RI',
    type: 'SBN',
    riskLevel: 1,
    annualReturn: 6.5,
    minInvestment: 1000000,
    currentPrice: 1000,
    description: 'Mock product description',
    tenor: '3 Years',
    lotSize: 1,
    isFractionalAllowed: false,
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function generateLargeProductList(count: number = 100) {
  return generateMockProducts(count);
}
