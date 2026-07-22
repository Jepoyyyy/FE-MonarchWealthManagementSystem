import { test as base, expect } from '@playwright/test';
import { AuthApiClient } from '../utils/api-client';
import { generateTestUser } from '../utils/test-data';

type AuthFixtures = {
  authApi: AuthApiClient;
  registeredUser: { email: string; password: string; accessToken: string; refreshToken: string };
};

export const test = base.extend<AuthFixtures>({
  authApi: async ({ request }, use) => {
    const authApi = new AuthApiClient(request);
    await use(authApi);
  },

  registeredUser: async ({ authApi }, use) => {
    // Setup: Register and login a user before test
    const userData = generateTestUser();
    const { response: registerResponse } = await authApi.register(userData);
    const { response: loginResponse } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const loginData = await loginResponse.json();
    const res = loginData.result || loginData.data || loginData;

    await use({
      email: userData.email,
      password: userData.password,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    });

    // Teardown: Logout user after test
    await authApi.logout(res.accessToken);
  },
});

export { expect };
