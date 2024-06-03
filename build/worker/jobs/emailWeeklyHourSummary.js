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
const VolunteerService_1 = require("../../services/VolunteerService");
const MailService = __importStar(require("../../services/MailService"));
const config_1 = __importDefault(require("../../config"));
const reportUtils_1 = require("../../utils/reportUtils");
const queries_1 = require("../../models/Volunteer/queries");
const FeatureFlagService_1 = require("../../services/FeatureFlagService");
const _1 = require(".");
exports.default = async (job) => {
    const { volunteer, startDate, endDate } = job.data;
    try {
        const { id, firstName, email, sentHourSummaryIntroEmail, volunteerPartnerOrg, } = volunteer;
        const start = (0, moment_1.default)(startDate).utc();
        const end = (0, moment_1.default)(endDate).utc();
        const customCheck = config_1.default.customVolunteerPartnerOrgs.some(org => org === volunteerPartnerOrg);
        let summaryStats;
        if (volunteer.sentHourSummaryIntroEmail === undefined)
            return;
        if (customCheck)
            summaryStats = await (0, reportUtils_1.telecomHourSummaryStats)(volunteer, start.toDate(), end.toDate());
        else
            summaryStats = await (0, VolunteerService_1.getHourSummaryStats)(id, start.toDate(), end.toDate());
        const isWeeklySummaryAllHoursActive = await (0, FeatureFlagService_1.getWeeklySummaryAllHoursFlag)(id);
        const allowZeroHours = isWeeklySummaryAllHoursActive && !volunteerPartnerOrg;
        /*
          The smallest this number can be is .01 hours =36 seconds (as per the rounding
          in VolunteerService.ts:68-70) So users with 36-54 seconds of time will have
          .01 hours coaching which gets rounded down to 0 hours/minutes at formatting
          in MailService/index.js:87-99. So we need to check .01 hours in addition
          to 0 prevent an email from getting sent that displays 0 hours of volutneering
          TODO: clean up formatting rounding logic to round 30+ seconds up a minute
          */
        if (!summaryStats ||
            (!allowZeroHours && summaryStats.totalVolunteerHours <= 0.01))
            return;
        await MailService.sendHourSummaryEmail(firstName, email, sentHourSummaryIntroEmail, start.format('dddd, MMM D'), end.format('dddd, MMM D'), summaryStats.totalCoachingHours, summaryStats.totalElapsedAvailability, summaryStats.totalQuizzesPassed, summaryStats.totalVolunteerHours, customCheck);
        if (!sentHourSummaryIntroEmail)
            await (0, queries_1.updateVolunteerHourSummaryIntroById)(id);
    }
    catch (e) {
        throw new Error(`Job/${_1.Jobs.EmailWeeklyHourSummary} for userId: ${volunteer.id}, startDate: ${startDate}, endDate: ${endDate} with error: ${e}`);
    }
};
