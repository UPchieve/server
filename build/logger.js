"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = void 0;
const pino_1 = __importDefault(require("pino"));
const config_1 = __importDefault(require("./config"));
const newrelic_1 = __importDefault(require("newrelic"));
const logger = config_1.default.NODE_ENV !== 'dev'
    ? (0, pino_1.default)({
        level: config_1.default.logLevel,
    })
    : (0, pino_1.default)({
        level: config_1.default.logLevel,
        transport: {
            target: 'pino-pretty',
        },
    });
// TODO: Consolidate into one logger file
function logError(error, customAttributes) {
    newrelic_1.default.noticeError(error, customAttributes);
}
exports.logError = logError;
exports.default = logger;
