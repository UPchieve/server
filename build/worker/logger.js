"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.log = void 0;
const newrelic_1 = __importDefault(require("newrelic"));
const config_1 = __importDefault(require("../config"));
// TODO: use pino
function log(message) {
    newrelic_1.default.recordLogEvent({
        message,
        level: config_1.default.logLevel,
    });
}
exports.log = log;
function logError(error, customAttributes) {
    newrelic_1.default.noticeError(error, customAttributes);
}
exports.logError = logError;
