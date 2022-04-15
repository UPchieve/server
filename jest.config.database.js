const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  setupFiles: [
    "<rootDir>/server/tests/setup.ts"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/server/tests/force-gc.ts",
  ],
  watchPathIgnorePatterns: ["globalConfig"],
  roots: ["<rootDir>/server"],
  transform: tsjPreset.transform,
  runner: "groups"
}
