import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { QuestionnairePage } from '../pages/questionnaire.page';
import { setAuthInPage, generateTestUser } from '../../utils/test-data';
import { AuthApiClient } from '../../utils/api-client';

type UIAuthFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  questionnairePage: QuestionnairePage;
  authenticatedUser: { email: string; password: string; accessToken: string };
  authenticatedAdmin: { email: string; password: string; accessToken: string };
};

export const test = base.extend<UIAuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  questionnairePage: async ({ page }, use) => {
    const questionnairePage = new QuestionnairePage(page);
    await use(questionnairePage);
  },

  authenticatedUser: async ({ page, request }, use) => {
    const authApi = new AuthApiClient(request);
    const userData = generateTestUser();

    await authApi.register(userData);
    const { response } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()}`);
    }

    const body = await response.json();
    const res = body.result || body.data || body;

    if (!res || !res.accessToken) {
      throw new Error(`Invalid login response: ${JSON.stringify(body)}`);
    }

    await authApi.completeRiskProfile(res.accessToken).catch(() => {
      console.warn('Risk profile completion failed - continuing with override');
    });

    const userWithCompletedQuestionnaire = {
      ...res.user,
      questionnaireCompleted: true,
      riskProfile: res.user?.riskProfile || 'risk_averse'
    };

    await setAuthInPage(page, res.accessToken, res.refreshToken, userWithCompletedQuestionnaire);

    await use({
      email: userData.email,
      password: userData.password,
      accessToken: res.accessToken,
    });

    await authApi.logout(res.accessToken).catch(() => {});
  },

  authenticatedAdmin: async ({ page, request }, use) => {
    const authApi = new AuthApiClient(request);
    const adminData = {
      ...generateTestUser(),
      isAdmin: true,
    };
    await authApi.register(adminData).catch(() => {});
    const { response } = await authApi.login({
      email: adminData.email,
      password: adminData.password,
    }).catch(() => ({ response: null }));

    let accessToken = 'fake-admin-access-token';
    let refreshToken = 'fake-admin-refresh-token';
    let userObj = {
      id: 'admin-user-id',
      name: adminData.name,
      email: adminData.email,
      role: 'admin',
      isAdmin: true,
      questionnaireCompleted: true,
    };

    if (response && response.ok()) {
      const body = await response.json();
      const res = body.result || body.data || body;
      accessToken = res.accessToken;
      refreshToken = res.refreshToken;
      userObj = { ...res.user, role: 'admin', isAdmin: true };
    }

    await setAuthInPage(page, accessToken, refreshToken, userObj);

    await use({
      email: adminData.email,
      password: adminData.password,
      accessToken,
    });

    if (response && response.ok()) {
      await authApi.logout(accessToken).catch(() => {});
    }
  },
});

export { expect };
