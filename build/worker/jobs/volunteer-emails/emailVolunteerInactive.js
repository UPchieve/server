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
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const __1 = require("..");
const logger_1 = require("../../logger");
const Volunteer_1 = require("../../../models/Volunteer");
const Availability_1 = require("../../../models/Availability");
const MailService = __importStar(require("../../../services/MailService"));
const queries_1 = require("../../../models/Volunteer/queries");
const constants_1 = require("../../../constants");
var InactiveGroup;
(function (InactiveGroup) {
    InactiveGroup["inactiveThirtyDays"] = "inactiveThirtyDays";
    InactiveGroup["inactiveSixtyDays"] = "inactiveSixtyDays";
    InactiveGroup["inactiveNinetyDays"] = "inactiveNinetyDays";
})(InactiveGroup || (InactiveGroup = {}));
async function sendEmailToInactiveVolunteers(volunteers, currentJob, mailHandler, group) {
    for (const volunteer of volunteers) {
        const { email, firstName, id } = volunteer;
        const errors = [];
        try {
            const contactInfo = { email, firstName };
            await mailHandler(contactInfo);
            if (group === InactiveGroup.inactiveThirtyDays)
                await (0, Volunteer_1.updateVolunteerSentInactive30DayEmail)(id);
            if (group === InactiveGroup.inactiveSixtyDays)
                await (0, Volunteer_1.updateVolunteerSentInactive60DayEmail)(id);
            if (group === InactiveGroup.inactiveNinetyDays) {
                await (0, Volunteer_1.updateVolunteerSentInactive90DayEmail)(id);
                await (0, Availability_1.saveCurrentAvailabilityAsHistory)(id);
                await (0, Availability_1.clearAvailabilityForVolunteer)(id);
            }
            (0, logger_1.log)(`Sent ${currentJob} to volunteer ${id}`);
        }
        catch (error) {
            errors.push(`${currentJob} to volunteer ${id}: ${error}`);
        }
        if (errors.length) {
            throw errors;
        }
    }
}
function getStartOfDayFromDaysAgo(daysAgo) {
    return (0, moment_1.default)()
        .utc()
        .subtract(daysAgo, 'days')
        .startOf('day')
        .toDate();
}
function getEndOfDayFromDaysAgo(daysAgo) {
    return (0, moment_1.default)()
        .utc()
        .subtract(daysAgo, 'days')
        .endOf('day')
        .toDate();
}
exports.default = async () => {
    const blackoutPeriodStart = constants_1.BLACKOUT_PERIOD_START.getTime();
    const blackoutPeriodEnd = constants_1.BLACKOUT_PERIOD_END.getTime();
    const todaysDate = new Date().getTime();
    if (todaysDate >= blackoutPeriodStart && todaysDate <= blackoutPeriodEnd) {
        (0, logger_1.log)(`Skipping ${__1.Jobs.EmailVolunteerInactive} because today's date, ${new Date(todaysDate).toISOString()}, is within the blackout period: ${new Date(blackoutPeriodStart).toISOString()} - ${new Date(blackoutPeriodEnd).toISOString()}`);
        return;
    }
    const thirtyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(30);
    const thirtyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(30);
    const sixtyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(60);
    const sixtyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(60);
    const ninetyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(90);
    const ninetyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(90);
    const volunteers = await (0, queries_1.getInactiveVolunteers)(thirtyDaysAgoStartOfDay, thirtyDaysAgoEndOfDay, sixtyDaysAgoStartOfDay, sixtyDaysAgoEndOfDay, ninetyDaysAgoStartOfDay, ninetyDaysAgoEndOfDay);
    if (volunteers) {
        const { inactiveThirtyDays, inactiveSixtyDays, inactiveNinetyDays, } = volunteers;
        const errors = [];
        try {
            await sendEmailToInactiveVolunteers(inactiveThirtyDays, __1.Jobs.EmailVolunteerInactiveThirtyDays, MailService.sendVolunteerInactiveThirtyDays, InactiveGroup.inactiveThirtyDays);
        }
        catch (error) {
            if (Array.isArray(error))
                errors.push(...error);
        }
        try {
            await sendEmailToInactiveVolunteers(inactiveSixtyDays, __1.Jobs.EmailVolunteerInactiveSixtyDays, MailService.sendVolunteerInactiveSixtyDays, InactiveGroup.inactiveSixtyDays);
        }
        catch (error) {
            if (Array.isArray(error))
                errors.push(...error);
        }
        try {
            await sendEmailToInactiveVolunteers(inactiveNinetyDays, __1.Jobs.EmailVolunteerInactiveNinetyDays, MailService.sendVolunteerInactiveNinetyDays, InactiveGroup.inactiveNinetyDays);
        }
        catch (error) {
            if (Array.isArray(error))
                errors.push(...error);
        }
        if (errors.length) {
            throw new Error(`Failed to send inactivity emails: ${errors}`);
        }
    }
};
