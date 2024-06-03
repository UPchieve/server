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
const Volunteer_1 = require("../models/Volunteer");
const MailService = __importStar(require("../services/MailService"));
const jobs_1 = require("../worker/jobs");
const type_utils_1 = require("../utils/type-utils");
const logger_1 = require("../worker/logger");
async function BackfillEmailNiceToMeetYou(job) {
    const start = new Date((0, type_utils_1.asString)(job.data.startDate));
    const oneDay = 1000 * 60 * 60 * 24 * 1;
    const oneDayAgo = new Date(start.getTime() - oneDay).setHours(0, 0, 0, 0);
    const todaysDate = new Date(start);
    // set the date to midnight
    todaysDate.setHours(0, 0, 0, 0);
    const volunteers = await (0, Volunteer_1.getVolunteersForNiceToMeetYou)(new Date(oneDayAgo), new Date(todaysDate));
    let totalEmailed = 0;
    const errors = [];
    for (const volunteer of volunteers) {
        try {
            await MailService.sendNiceToMeetYou(volunteer);
            totalEmailed++;
        }
        catch (error) {
            errors.push(`volunteer ${volunteer.id}: ${error}`);
        }
    }
    (0, logger_1.log)(`Sent ${jobs_1.Jobs.EmailNiceToMeetYou} to ${totalEmailed} volunteers`);
    if (errors.length) {
        throw new Error(`Failed to send ${jobs_1.Jobs.EmailNiceToMeetYou} to: ${errors}`);
    }
}
exports.default = BackfillEmailNiceToMeetYou;
