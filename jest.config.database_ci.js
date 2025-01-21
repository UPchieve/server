const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  setupFiles: ['<rootDir>/server/tests/setup.ts'],
  testEnvironment: '<rootDir>/server/tests/new_db/db-test-environment.js',
  roots: ['<rootDir>/server/tests/database'],
  // testMatch: ['<rootDir>/server/tests/database/*.test.(js|ts)'],
  runner: 'groups',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: [
    '<rootDir>/server/tests/force-gc.ts',
    '<rootDir>/server/tests/new_db/db-mocks-setup.ts',
  ],
  transform: tsjPreset.transform,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
