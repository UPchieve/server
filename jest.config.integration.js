const serverConfig = require('./jest.config.server.js')

/**
 * Jest config for the integration suite.
 * @see package.json -> "test:integration"
 */
module.exports = {
  roots: ['<rootDir>/server/tests/integration'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: serverConfig.transform,
  // newrelic, reached through the logger, resolves .json at require time.
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testTimeout: 60_000,
}
