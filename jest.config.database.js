const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  preset: "<rootDir>/preset",
  setupFiles: [
    "<rootDir>/server/tests/setup.ts",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/server/tests/force-gc.ts",
    "<rootDir>/server/tests/postgres-setup.ts"
  ],
  roots: ["<rootDir>/server"],
  transform: tsjPreset.transform,
  runner: "groups",
}
