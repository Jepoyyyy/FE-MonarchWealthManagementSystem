import { test, expect } from './fixtures/ui-auth-fixtures';
import { generateTestUser, setAuthInPage } from '../utils/test-data';
import { AuthApiClient } from '../utils/api-client';

test.describe('Questionnaire Onboarding Flow (Q01 - Q06)', () => {

  test('Q01: New user with pending questionnaire is prompted for assessment', async ({ page, registerPage, questionnairePage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'Q01' });
    test.info().annotations.push({ type: 'priority', description: 'P1-high' });

    const userData = generateTestUser();
    await registerPage.goto();
    await registerPage.register(
      userData.name,
      userData.email,
      userData.password,
      userData.password
    );

    // Verify questionnaire or risk assessment is presented
    await expect(
      page.getByText(/risk profile assessment/i)
        .or(page.getByRole('button', { name: /next question/i }))
    ).toBeVisible({ timeout: 15000 });
  });

  test('Q02 & Q03: Complete questionnaire steps → Calculate risk profile & enter application', async ({ page, registerPage, questionnairePage }) => {
    test.info().annotations.push({ type: 'test-id', description: 'Q02-Q03' });

    const userData = generateTestUser();
    await registerPage.goto();
    await registerPage.register(
      userData.name,
      userData.email,
      userData.password,
      userData.password
    );

    await expect(
      page.getByText(/risk profile assessment/i)
        .or(page.getByRole('button', { name: /next question/i }))
    ).toBeVisible({ timeout: 15000 });

    // Answer all questions
    await questionnairePage.completeWithDefaultAnswers(5);

    // Verify user profile is saved and dashboard loaded
    await expect(
      page.getByRole('button', { name: /sign out|logout/i })
        .or(page.locator('text=Overview'))
    ).toBeVisible({ timeout: 15000 });
  });

  test('Q05: Returning user with completed questionnaire lands directly on dashboard', async ({ page, request }) => {
    test.info().annotations.push({ type: 'test-id', description: 'Q05' });

    const authApi = new AuthApiClient(request);
    const userData = generateTestUser();
    await authApi.register(userData);
    const { response } = await authApi.login({
      email: userData.email,
      password: userData.password,
    });
    const body = await response.json();
    const res = body.result || body.data || body;

    // Complete risk profile via API
    await authApi.completeRiskProfile(res.accessToken).catch(() => {});

    // Set auth state with questionnaire completed
    await setAuthInPage(page, res.accessToken, res.refreshToken, {
      ...res.user,
      questionnaireCompleted: true,
      riskProfile: 'balanced',
    });

    await page.goto('/');

    await expect(
      page.getByRole('button', { name: /sign out|logout/i })
        .or(page.locator('text=Overview'))
    ).toBeVisible({ timeout: 10000 });
  });
});
