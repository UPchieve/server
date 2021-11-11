'use strict'

/**
 * Mock the pino logger to avoid needing to call jest.mock(logger) in every test
 *
 * TODO: redirect test logs to some local file to not clutter output
 */

module.exports = function pino(options) {
  return {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}
