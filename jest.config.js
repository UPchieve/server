module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: [],
  testPathIgnorePatterns: ['<rootDir>/server/tests'],
  testEnvironment: 'node',
}
