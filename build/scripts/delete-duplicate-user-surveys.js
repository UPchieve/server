"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Survey_1 = require("../models/Survey");
const logger_1 = require("../worker/logger");
async function main() {
    await (0, Survey_1.deleteDuplicateUserSurveys)();
    (0, logger_1.log)(`Successfully deleted duplicate user surveys`);
}
exports.default = main;
