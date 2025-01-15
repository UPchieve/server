module.exports = {
  testEnvironment: '<rootDir>/server/tests/new_db/db-test-environment.js',
  testMatch: ['<rootDir>/server/tests/new_db/*.test.(js|ts)'],
  testPathIgnorePatterns: ['/node_modules/'],
  // setupFilesAfterEnv: [
  //   '<rootDir>/server/tests/database/db-mocks-setup.ts',
  // ],
}


  //setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: For additional per-test setup
  // globalSetup: '<rootDir>/jest.global-setup.ts',
  // globalTeardown: '<rootDir>/jest.global-teardown.ts',