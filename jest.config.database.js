const { defaults: tsjPreset } = require('ts-jest/presets')

const transformKey = Object.keys(tsjPreset.transform)[0]

module.exports = {
  setupFiles: ['<rootDir>/server/tests/mocks-setup.ts'],
  testEnvironment: '<rootDir>/server/tests/database/db-test-environment.js',
  roots: ['<rootDir>/server/tests/database'],
  runner: 'groups',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/server/tests/database/db-mocks-setup.ts'],
  transform: {
    ...tsjPreset.transform,
    [transformKey]: [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js'],
  globalSetup: '<rootDir>/server/tests/database/global-db-setup.ts',
  globalTeardown: '<rootDir>/server/tests/database/global-db-teardown.ts',
}
