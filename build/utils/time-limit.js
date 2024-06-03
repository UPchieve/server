"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeLimit = void 0;
const logger_1 = __importDefault(require("../logger"));
const DEFAULT_WAIT_IN_MS = 2000;
/*
  The `timeLimit` util provides a way to gracefully fallback to a default value
  if the passed in `promise` takes more than the specified time or throws an error
*/
const timeLimit = async ({ promise, fallbackReturnValue, timeLimitReachedErrorMessage, waitInMs = DEFAULT_WAIT_IN_MS, }) => {
    let timeoutId;
    return await Promise.race([
        new Promise(resolve => {
            timeoutId = setTimeout(() => {
                logger_1.default.error(new Error(`Time limit of ${waitInMs}ms reached. ${timeLimitReachedErrorMessage}`));
                resolve(fallbackReturnValue);
            }, waitInMs);
        }),
        promise.catch(e => {
            logger_1.default.error(new Error(`${waitInMs} Passed in promise rejected with ${e}`));
            return Promise.resolve(fallbackReturnValue);
        }),
    ]).finally(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    });
};
exports.timeLimit = timeLimit;
