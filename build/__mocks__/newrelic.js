"use strict";
/**
 * NewRelic automocking does not prevent the real agent from being started so
 * we must implement our own manual mock.
 *
 * We also use nrelic.getTransaction and newrelic.startBackgroundTransaction
 * but the files that use these are untested since they jsut set up the worker
 * and listeners. So we only mock new relic functionality used in code
 * that is actually tested.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    startWebTransaction: (url, handler) => {
        handler();
    },
    startSegment: async (name, record, handler) => {
        await handler();
    },
    addCustomAttribute: (key, value) => {
        return;
    },
    recordMetric: (name, value) => {
        return;
    },
};
