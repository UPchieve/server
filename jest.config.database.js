const { defaults: tsjPreset } = require('ts-jest/presets')

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000

module.exports = {
  setupFiles: [
    "<rootDir>/server/tests/setup.ts",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/server/tests/force-gc.ts",
    "<rootDir>/server/tests/database/db-mocks-setup.ts",
  ],
  watchPathIgnorePatterns: ["globalConfig"],
  roots: ["<rootDir>/server/tests/database"],
  transform: tsjPreset.transform,
  runner: "groups",
  globalSetup: "<rootDir>/server/tests/database/global-db-setup.ts",
  globalTeardown: "<rootDir>/server/tests/database/global-db-teardown.ts",
  testEnvironment: 
    "<rootDir>/server/tests/database/db-test-environment.js",
  testTimeout: FIVE_MINUTES_IN_MS,
}
