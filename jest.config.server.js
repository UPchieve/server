module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFiles: ['./server/tests/global.ts'],
  watchPathIgnorePatterns: ['globalConfig'],
  roots: ["<rootDir>/server"],
  transform: {
    "^.+\\.ts?$": "<rootDir>/node_modules/ts-jest"
  },
  runner: "groups"
}
