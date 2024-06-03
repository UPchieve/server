"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentNewYorkTime = void 0;
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
function getCurrentNewYorkTime() {
    return (0, moment_1.default)()
        .utc()
        .tz('America/New_York');
}
exports.getCurrentNewYorkTime = getCurrentNewYorkTime;
