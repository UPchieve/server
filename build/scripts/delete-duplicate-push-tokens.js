"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PushToken_1 = require("../models/PushToken");
const logger_1 = require("../worker/logger");
async function DeleteDuplicatePushTokens(job) {
    await (0, PushToken_1.deleteDuplicatePushTokens)();
    (0, logger_1.log)(`Successfully deleted duplatcate push tokens`);
}
exports.default = DeleteDuplicatePushTokens;
