const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  setupFiles: [
    "<rootDir>/server/tests/setup.ts",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/server/tests/force-gc.ts",
    "<rootDir>/server/tests/custom-matchers.ts",
  ],
  watchPathIgnorePatterns: ["globalConfig"],
  roots: ["<rootDir>/server"],
  testPathIgnorePatterns: ["<rootDir>/server/tests/database"],
  transform: tsjPreset.transform,
  runner: "groups",
}
