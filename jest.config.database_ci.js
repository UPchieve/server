const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  testEnvironment: '<rootDir>/server/tests/new_db/db-test-environment.js',
  testMatch: ['<rootDir>/server/tests/database/*.test.(js|ts)'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: [
    '<rootDir>/server/tests/force-gc.ts',
    '<rootDir>/server/tests/new_db/db-mocks-setup.ts',
  ],
  transform: tsjPreset.transform,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
