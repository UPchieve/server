module.exports = {
  // globalSetup: '<rootDir>/jest.global-setup.ts',
  // globalTeardown: '<rootDir>/jest.global-teardown.ts',
  testEnvironment: 
    "<rootDir>/server/tests/new_db/db-test-environment.js",
  //setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: For additional per-test setup

  // Only run tests in the 'new_db' folder
  testMatch: ['<rootDir>/server/tests/new_db/*.test.(js|ts)'],

  // Alternatively, use testRegex if you prefer regex patterns
  // testRegex: '/new_db/.*\\.test\\.(js|ts)$',

  // Optional: Ignore other folders if needed
  testPathIgnorePatterns: ['/node_modules/'],

  // Add any other Jest configurations as needed
}
