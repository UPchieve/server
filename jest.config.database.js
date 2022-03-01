const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  preset: "<rootDir>/preset",
  setupFilesAfterEnv: [
    "<rootDir>/server/tests/setup.ts",
    "<rootDir>/server/tests/force-gc.ts",
    "<rootDir>/server/tests/postgres-setup.ts"
  ],
  roots: ["<rootDir>/server"],
  transform: tsjPreset.transform,
  runner: "groups",
}
