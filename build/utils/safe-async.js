"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeAsync = void 0;
const safeAsync = async function (p) {
    try {
        const result = await p;
        return { result };
    }
    catch (error) {
        return { error };
    }
};
exports.safeAsync = safeAsync;
