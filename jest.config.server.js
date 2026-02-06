const { defaults: tsjPreset } = require('ts-jest/presets')

const transformKey = Object.keys(tsjPreset.transform)[0]

module.exports = {
  setupFiles: ['<rootDir>/server/tests/mocks-setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/server/tests/custom-matchers.ts'],
  watchPathIgnorePatterns: ['globalConfig'],
  roots: ['<rootDir>/server'],
  coveragePathIgnorePatterns: [
    '<rootDir>/server/models',
    '<rootDir>/database/seeds',
    '<rootDir>/server/constants',
  ],
  testPathIgnorePatterns: ['<rootDir>/server/tests/database'],

  transform: {
    ...tsjPreset.transform,
    [transformKey]: [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  runner: 'groups',
}
