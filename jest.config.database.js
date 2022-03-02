const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  preset: "@shelf/jest-mongodb",
  setupFiles: [
    "<rootDir>/server/tests/setup.ts"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/server/tests/force-gc.ts",
  ],
  roots: ["<rootDir>/server"],
  transform: tsjPreset.transform,
  testRunner: "jest-circus/runner",
  runner: "groups"
}
