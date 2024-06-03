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
exports.addBackgroundInfo = exports.updatePendingVolunteerStatus = exports.getPendingVolunteerApprovalStatus = exports.getVolunteersToReview = exports.queuePartnerOnboardingEventEmails = exports.queueFailedFirstAttemptedQuizEmail = exports.queueOnboardingEventEmails = exports.queueOnboardingReminderOneEmail = exports.getHourSummaryStats = void 0;
const constants_1 = require("../constants");
const UserAction_1 = require("../models/UserAction");
const VolunteerRepo = __importStar(require("../models/Volunteer"));
const jobs_1 = require("../worker/jobs");
const AnalyticsService = __importStar(require("./AnalyticsService"));
const AvailabilityService_1 = require("./AvailabilityService");
const MailService = __importStar(require("./MailService"));
const QueueService_1 = __importDefault(require("./QueueService"));
const SessionService_1 = require("./SessionService");
const UserAction_2 = require("../models/UserAction");
async function getHourSummaryStats(volunteerId, fromDate, toDate) {
    // TODO: promise.all fails fast, do we want this? - handle error?
    const [quizzesPassed, elapsedAvailability, timeTutoredMS,] = await Promise.all([
        (0, UserAction_2.getQuizzesPassedForDateRangeById)(volunteerId, fromDate, toDate),
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
exports.getHourSummaryStats = getHourSummaryStats;
async function queueOnboardingReminderOneEmail(volunteerId) {
    const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7;
    await QueueService_1.default.add(jobs_1.Jobs.EmailOnboardingReminderOne, { volunteerId }, { delay: sevenDaysInMs, removeOnComplete: true, removeOnFail: true });
}
exports.queueOnboardingReminderOneEmail = queueOnboardingReminderOneEmail;
async function queueOnboardingEventEmails(volunteerId) {
    await QueueService_1.default.add(jobs_1.Jobs.EmailVolunteerQuickTips, { volunteerId }, 
    // process job 5 days after the volunteer is onboarded
    {
        delay: 1000 * 60 * 60 * 24 * 5,
        removeOnComplete: true,
        removeOnFail: true,
    });
}
exports.queueOnboardingEventEmails = queueOnboardingEventEmails;
async function queueFailedFirstAttemptedQuizEmail(category, email, firstName, volunteerId) {
    await QueueService_1.default.add(jobs_1.Jobs.EmailFailedFirstAttemptedQuiz, {
        category,
        email,
        firstName,
        volunteerId,
    }, {
        removeOnComplete: true,
        removeOnFail: true,
    });
}
exports.queueFailedFirstAttemptedQuizEmail = queueFailedFirstAttemptedQuizEmail;
async function queuePartnerOnboardingEventEmails(volunteerId) {
    await QueueService_1.default.add(jobs_1.Jobs.EmailPartnerVolunteerLowHoursSelected, { volunteerId }, 
    // process job 10 days after the volunteer is onboarded
    {
        delay: 1000 * 60 * 60 * 24 * 10,
        removeOnComplete: true,
        removeOnFail: true,
    });
}
exports.queuePartnerOnboardingEventEmails = queuePartnerOnboardingEventEmails;
async function getVolunteersToReview(page = 1) {
    const pageNum = page;
    const PER_PAGE = 15;
    const skip = (pageNum - 1) * PER_PAGE;
    try {
        // Replaced by VolunteerRepo.getVolunteersToReview
        const volunteers = await VolunteerRepo.getVolunteersToReview(PER_PAGE, skip);
        const isLastPage = volunteers.length < PER_PAGE;
        return { volunteers, isLastPage };
    }
    catch (error) {
        throw new Error(error.message);
    }
}
exports.getVolunteersToReview = getVolunteersToReview;
function getPendingVolunteerApprovalStatus(photoIdStatus, hasCompletedBackgroundInfo) {
    return photoIdStatus === constants_1.STATUS.APPROVED && hasCompletedBackgroundInfo;
}
exports.getPendingVolunteerApprovalStatus = getPendingVolunteerApprovalStatus;
async function updatePendingVolunteerStatus(volunteerId, photoIdStatus) {
    const volunteerBeforeUpdate = await VolunteerRepo.getVolunteerForPendingStatus(volunteerId);
    if (!volunteerBeforeUpdate)
        return;
    const hasCompletedBackgroundInfo = volunteerBeforeUpdate.occupations &&
        volunteerBeforeUpdate.occupations.length > 0 &&
        volunteerBeforeUpdate.country
        ? true
        : false;
    // A volunteer must have the following list items approved before being considered an approved volunteer
    // 1. photo id
    // 2. completed background information
    const isApproved = getPendingVolunteerApprovalStatus(photoIdStatus, hasCompletedBackgroundInfo);
    await VolunteerRepo.updateVolunteerPending(volunteerId, isApproved, photoIdStatus);
    if (photoIdStatus === constants_1.PHOTO_ID_STATUS.REJECTED &&
        volunteerBeforeUpdate.photoIdStatus !== constants_1.PHOTO_ID_STATUS.REJECTED) {
        await (0, UserAction_1.createAccountAction)({
            userId: volunteerId,
            action: constants_1.ACCOUNT_USER_ACTIONS.REJECTED_PHOTO_ID,
        });
        AnalyticsService.captureEvent(volunteerId, constants_1.EVENTS.PHOTO_ID_REJECTED, {
            event: constants_1.EVENTS.PHOTO_ID_REJECTED,
        });
        MailService.sendRejectedPhotoSubmission(volunteerBeforeUpdate);
    }
    const isNewlyApproved = isApproved && !volunteerBeforeUpdate.approved;
    if (isNewlyApproved) {
        await (0, UserAction_1.createAccountAction)({
            userId: volunteerId,
            action: constants_1.ACCOUNT_USER_ACTIONS.APPROVED,
        });
        AnalyticsService.captureEvent(volunteerId, constants_1.EVENTS.ACCOUNT_APPROVED, {
            event: constants_1.EVENTS.ACCOUNT_APPROVED,
        });
    }
    if (isNewlyApproved && !volunteerBeforeUpdate.onboarded)
        MailService.sendApprovedNotOnboardedEmail(volunteerBeforeUpdate);
}
exports.updatePendingVolunteerStatus = updatePendingVolunteerStatus;
async function addBackgroundInfo(volunteerId, update, ip) {
    const volunteer = await VolunteerRepo.getVolunteerContactInfoById(volunteerId);
    if (!volunteer)
        throw new Error('Volunteer for background info not found');
    const volunteerPartnerOrg = volunteer.volunteerPartnerOrg;
    let approved;
    if (volunteerPartnerOrg) {
        approved = true;
        await (0, UserAction_1.createAccountAction)({
            userId: volunteerId,
            action: constants_1.ACCOUNT_USER_ACTIONS.APPROVED,
            ipAddress: ip,
        });
        // TODO: if not onboarded, send a partner-specific version of the "approved but not onboarded" email
    }
    // remove fields with empty strings and empty arrays from the update
    for (const field in update) {
        const tField = field;
        if ((update &&
            update[tField] &&
            Array.isArray(update[tField]) &&
            update[tField].length === 0) ||
            update[tField] === '')
            update[tField] = undefined;
    }
    await (0, UserAction_1.createAccountAction)({
        userId: volunteerId,
        action: constants_1.ACCOUNT_USER_ACTIONS.COMPLETED_BACKGROUND_INFO,
        ipAddress: ip,
    });
    await VolunteerRepo.updateVolunteerBackgroundInfo(volunteerId, {
        ...update,
        approved,
    });
}
exports.addBackgroundInfo = addBackgroundInfo;
