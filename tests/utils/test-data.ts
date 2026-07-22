export const generateTestUser = (suffix = Date.now()) => ({
  name: `Test User ${suffix}`,
  email: `testuser${suffix}@example.com`,
  password: 'SecurePass123!',
});

export const VALID_TEST_USER = {
  name: 'John Doe',
  email: 'john.doe.test@example.com',
  password: 'SecurePassword123',
};

export const INVALID_PASSWORDS = {
  tooShort: 'Pass1',        // < 8 chars
  tooLong: 'P'.repeat(73),  // > 72 chars
  empty: '',
};

export const INVALID_EMAILS = [
  'notanemail',
  'missing@domain',
  '@nodomain.com',
  'spaces in@email.com',
];
