"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const roundUpToNearestInterval = (num, interval) => {
    return Math.ceil(num / interval) * interval;
};
exports.default = roundUpToNearestInterval;
