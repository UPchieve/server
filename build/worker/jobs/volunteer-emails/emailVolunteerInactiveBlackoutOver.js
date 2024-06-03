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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVolunteer = void 0;
const moment_1 = __importDefault(require("moment"));
const index_1 = require("../index");
const Availability_1 = require("../../../models/Availability");
const MailService = __importStar(require("../../../services/MailService"));
const Volunteer_1 = require("../../../models/Volunteer");
async function processVolunteer(volunteer) {
    const { email, firstName, id } = volunteer;
    const errors = [];
    try {
        await MailService.sendVolunteerInactiveBlackoutOver(email, firstName);
    }
    catch (error) {
        errors.push(`Failed to send blackout over email to volunteer ${id}: ${error.message}`);
    }
    try {
        await (0, Availability_1.saveCurrentAvailabilityAsHistory)(volunteer.id);
        await (0, Availability_1.clearAvailabilityForVolunteer)(id);
    }
    catch (error) {
        errors.push(`Failed to update availability for volunteer ${id}: ${error.message}`);
    }
    return errors;
}
exports.processVolunteer = processVolunteer;
exports.default = async () => {
    const ninetyDaysAgoStartOfDay = (0, moment_1.default)()
        .utc()
        .subtract(90, 'days')
        .startOf('day')
        .toDate();
    const volunteers = await (0, Volunteer_1.getVolunteersForBlackoutOver)(ninetyDaysAgoStartOfDay);
    if (volunteers.length) {
        const errors = [];
        for (const volunteer of volunteers) {
            errors.push(...(await processVolunteer(volunteer)));
        }
        if (errors.length) {
            let errMsg = `Failed to fully process ${index_1.Jobs.EmailVolunteerInactiveBlackoutOver}:\n`;
            for (const err of errors) {
                errMsg += `${err}\n`;
            }
            throw new Error(errMsg);
        }
    }
};
