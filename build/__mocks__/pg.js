"use strict";
/**
 * Mock the pg to avoid needing to call jest.mock(pg) in every test
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const client = {
    async query() { },
    release() { },
};
class Pool {
    constructor(options) {
        this.options = options;
    }
    on() { }
    async connect() {
        return client;
    }
    async end() { }
}
exports.Pool = Pool;
