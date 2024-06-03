"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const queries_1 = require("../../models/Volunteer/queries");
const MailService = __importStar(require("../../services/MailService"));
const _1 = require(".");
// Runs every day at 11am EST
exports.default = async () => {
    const oneDay = 1000 * 60 * 60 * 24 * 1;
    const fiveDaysAgo = Date.now() - oneDay * 5;
    const sixDaysAgo = fiveDaysAgo - oneDay;
    const volunteers = await (0, queries_1.getVolunteersForWaitingReferences)(new Date(sixDaysAgo), new Date(fiveDaysAgo));
    let totalEmailed = 0;
    const errors = [];
    for (const volunteer of volunteers) {
        try {
            await MailService.sendWaitingOnReferences(volunteer);
            totalEmailed++;
        }
        catch (error) {
            errors.push(`volunteer ${volunteer.id}: ${error}`);
        }
    }
    (0, logger_1.log)(`Sent ${_1.Jobs.EmailWaitingOnReferences} to ${totalEmailed}`);
    if (errors.length) {
        throw new Error(`Failed to send ${_1.Jobs.EmailWaitingOnReferences} to: ${errors}`);
    }
};
