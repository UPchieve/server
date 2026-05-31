const { defaults: tsjPreset } = require('ts-jest/presets')

const transformKey = Object.keys(tsjPreset.transform)[0]

// Unit tests for the database privacy guards (e.g. the migration pii/not_pii
// comment lint under database/privacy/lint). These exercise exported pure
// functions directly — no database, no server bootstrap — so they're fast and
// need no services in CI.
module.exports = {
  roots: ['<rootDir>/database/privacy'],
  testMatch: ['**/*.test.ts'],
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
}
