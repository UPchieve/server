module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/server'],
  testEnvironment: 'node',
}
