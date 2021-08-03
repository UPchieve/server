module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFiles: ['./server/tests/global.ts'],
  watchPathIgnorePatterns: ['globalConfig'],
  roots: ['./server'],
  transform: {
    '^.+\\.ts?$': '<rootDir>/node_modules/ts-jest'
  },
  moduleFileExtensions: ['js', 'ts'],
  runner: 'groups',
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/*.steps.[jt]s'
  ]
}
