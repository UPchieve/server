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
exports.getIncorrectHourSummaryStats = void 0;
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const newrelic_1 = __importDefault(require("newrelic"));
const config_1 = __importDefault(require("../config"));
const Volunteer_1 = require("../models/Volunteer");
const queries_1 = require("../models/Volunteer/queries");
const AvailabilityService_1 = require("../services/AvailabilityService");
const MailService = __importStar(require("../services/MailService"));
const SessionService_1 = require("../services/SessionService");
const VolunteerService_1 = require("../services/VolunteerService");
const jobs_1 = require("../worker/jobs");
const logger_1 = require("../worker/logger");
// using the old implementation of getHourSummaryStats that called `getQuizzesPassedForDateRange`
// when we sent out the first initial set of emails
async function getIncorrectHourSummaryStats(volunteerId, fromDate, toDate) {
    const [quizzesPassed, elapsedAvailability, timeTutoredMS,] = await Promise.all([
        (0, Volunteer_1.getQuizzesPassedForDateRange)(volunteerId, fromDate, toDate),
        (0, AvailabilityService_1.getTotalElapsedAvailabilityForDateRange)(volunteerId, fromDate, toDate),
        (0, SessionService_1.getTimeTutoredForDateRange)(volunteerId, fromDate, toDate),
    ]);
    const timeTutoredInHours = Number(timeTutoredMS / 3600000).toFixed(2);
    const totalCoachingHours = Number(timeTutoredInHours);
    // Total volunteer hours calculation: [sum of coaching, elapsed avail/10, and quizzes]
    const totalVolunteerHours = Number((totalCoachingHours +
        quizzesPassed +
        Number(elapsedAvailability) * 0.1).toFixed(2));
    return {
        totalCoachingHours,
        totalQuizzesPassed: quizzesPassed,
        totalElapsedAvailability: elapsedAvailability,
        totalVolunteerHours: totalVolunteerHours,
    };
}
exports.getIncorrectHourSummaryStats = getIncorrectHourSummaryStats;
async function sendWeeklyHourSummaryApology() {
    //  Monday-Sunday
    const lastMonday = (0, moment_1.default)()
        .utc()
        .subtract(1, 'weeks')
        .startOf('isoWeek');
    const lastSunday = (0, moment_1.default)()
        .utc()
        .subtract(1, 'weeks')
        .endOf('isoWeek');
    const volunteers = await (0, queries_1.getVolunteersForWeeklyHourSummary)();
    let totalEmailed = 0;
    const errors = [];
    for (const volunteer of volunteers) {
        const { id, firstName, email, sentHourSummaryIntroEmail, volunteerPartnerOrg, } = volunteer;
        try {
            const customCheck = config_1.default.customVolunteerPartnerOrgs.some(org => org === volunteerPartnerOrg);
            let summaryStats;
            let incorrectSummaryStats;
            if (volunteer.sentHourSummaryIntroEmail === undefined)
                continue;
            // custom volunteer partner orgs were not affected by this bug and do not need to
            // receive the apology email
            if (customCheck)
                continue;
            incorrectSummaryStats = await getIncorrectHourSummaryStats(id, lastMonday.toDate(), lastSunday.toDate());
            summaryStats = await (0, VolunteerService_1.getHourSummaryStats)(id, lastMonday.toDate(), lastSunday.toDate());
            // skip sending the email if the incorrect stats were 0 because these users did
            // not receive a weekly summary email from us
            if (!incorrectSummaryStats ||
                !summaryStats ||
                incorrectSummaryStats.totalVolunteerHours <= 0.01)
                continue;
            // send apology email to those who had no tutoring hours in the past week, but received incorrect stats
            if (incorrectSummaryStats.totalVolunteerHours !==
                summaryStats.totalVolunteerHours &&
                summaryStats.totalVolunteerHours <= 0.01)
                await MailService.sendWeeklyHourApologyEmail(firstName, email, lastMonday.format('dddd, MMM D'), lastSunday.format('dddd, MMM D'));
            else
                await MailService.sendHourSummaryEmail(firstName, email, sentHourSummaryIntroEmail, lastMonday.format('dddd, MMM D'), lastSunday.format('dddd, MMM D'), summaryStats.totalCoachingHours, summaryStats.totalElapsedAvailability, summaryStats.totalQuizzesPassed, summaryStats.totalVolunteerHours, customCheck);
            if (!sentHourSummaryIntroEmail)
                await (0, queries_1.updateVolunteerHourSummaryIntroById)(volunteer.id);
            totalEmailed++;
        }
        catch (error) {
            errors.push(`${id}: ${error}\n`);
        }
    }
    newrelic_1.default.recordMetric(`Job/${jobs_1.Jobs.EmailWeeklyHourSummary}`, totalEmailed);
    (0, logger_1.log)(`Successfully ${jobs_1.Jobs.EmailWeeklyHourSummary} for ${totalEmailed} volunteers`);
    if (errors.length) {
        throw new Error(`Failed to ${jobs_1.Jobs.EmailWeeklyHourSummary} for volunteers:\n${errors}`);
    }
}
exports.default = sendWeeklyHourSummaryApology;
