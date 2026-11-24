const serverConfig = require('./jest.config.server.js')

module.exports = {
  roots: ['<rootDir>/server/tests/e2e'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: serverConfig.transform,
  setupFiles: ['dotenv/config'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testTimeout: 60_000,
}
