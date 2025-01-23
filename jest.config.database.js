const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  setupFiles: ['<rootDir>/server/tests/setup.ts'],
  testEnvironment: '<rootDir>/server/tests/database/db-test-environment.js',
  roots: ['<rootDir>/server/tests/database'],
  runner: 'groups',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/server/tests/database/db-mocks-setup.ts'],
  transform: tsjPreset.transform,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
