import { test as base } from './auth-fixtures';
import { generateUserDashboardData, generateAdminDashboardData } from '../utils/dashboard-mock-data';

type DashboardFixtures = {
  userDashboard: typeof generateUserDashboardData;
  adminDashboard: typeof generateAdminDashboardData;
};

export const test = base.extend<DashboardFixtures>({
  userDashboard: async ({}, use) => {
    await use(generateUserDashboardData);
  },
  adminDashboard: async ({}, use) => {
    await use(generateAdminDashboardData);
  },
});

export { expect } from '@playwright/test';
