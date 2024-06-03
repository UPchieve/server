"use strict";
/**
 * Mock the pino logger to avoid needing to call jest.mock(logger) in every test
 *
 * TODO: redirect test logs to some local file to not clutter output
 */
Object.defineProperty(exports, "__esModule", { value: true });
function pino(options) {
    return {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    };
}
exports.default = pino;
