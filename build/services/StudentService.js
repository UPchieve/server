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
exports.queueProcrastinationTextReminder = exports.adminGetActivePartnersForStudent = exports.getStudentSignupSources = exports.getFavoriteVolunteersPaginated = exports.checkAndUpdateVolunteerFavoriting = exports.processStudentTrackingPostHog = exports.queueOnboardingEmails = void 0;
const constants_1 = require("../constants");
const jobs_1 = require("../worker/jobs");
const QueueService_1 = __importDefault(require("./QueueService"));
const AnalyticsService = __importStar(require("./AnalyticsService"));
const StudentRepo = __importStar(require("../models/Student/queries"));
const config_1 = __importDefault(require("../config"));
const Errors_1 = require("./Errors");
const UserAction_1 = require("../models/UserAction");
const moment_1 = __importDefault(require("moment"));
const User_1 = require("../models/User");
const queueOnboardingEmails = async (studentId) => {
    await QueueService_1.default.add(jobs_1.Jobs.EmailStudentOnboardingHowItWorks, { studentId }, 
    // process job 1 day after the student account is created
    {
        delay: 1000 * 60 * 60 * 24 * 1,
        removeOnComplete: true,
        removeOnFail: true,
    });
    await QueueService_1.default.add(jobs_1.Jobs.EmailMeetOurVolunteers, { studentId }, 
    // process job 3 days after the student account is created
    {
        delay: 1000 * 60 * 60 * 24 * 3,
        removeOnComplete: true,
        removeOnFail: true,
    });
    await QueueService_1.default.add(jobs_1.Jobs.EmailStudentOnboardingMission, { studentId }, 
    // process job 10 days after the student account is created
    {
        delay: 1000 * 60 * 60 * 24 * 10,
        removeOnComplete: true,
        removeOnFail: true,
    });
    await QueueService_1.default.add(jobs_1.Jobs.EmailStudentOnboardingSurvey, { studentId }, 
    // process job 14 days after the student account is created
    {
        delay: 1000 * 60 * 60 * 24 * 14,
        removeOnComplete: true,
        removeOnFail: true,
    });
};
exports.queueOnboardingEmails = queueOnboardingEmails;
// registered as listener on student-created
async function processStudentTrackingPostHog(studentId) {
    AnalyticsService.captureEvent(studentId, constants_1.EVENTS.ACCOUNT_CREATED);
}
exports.processStudentTrackingPostHog = processStudentTrackingPostHog;
async function checkAndUpdateVolunteerFavoriting(isFavorite, studentId, volunteerId, sessionId, ip) {
    if (isFavorite) {
        const totalFavoriteVolunteers = await StudentRepo.getTotalFavoriteVolunteers(studentId.toString());
        if (config_1.default.favoriteVolunteerLimit - totalFavoriteVolunteers > 0) {
            await (0, UserAction_1.createAccountAction)({
                userId: studentId,
                volunteerId: volunteerId,
                sessionId: sessionId,
                action: constants_1.ACCOUNT_USER_ACTIONS.VOLUNTEER_FAVORITED,
            });
            await StudentRepo.addFavoriteVolunteer(studentId, volunteerId);
            return { isFavorite: true };
        }
        throw new Errors_1.FavoriteLimitReachedError('Favorite volunteer limit reached.');
    }
    else {
        await (0, UserAction_1.createAccountAction)({
            userId: studentId,
            volunteerId: volunteerId,
            sessionId: sessionId,
            action: constants_1.ACCOUNT_USER_ACTIONS.VOLUNTEER_UNFAVORITED,
        });
        await StudentRepo.deleteFavoriteVolunteer(studentId, volunteerId);
        return { isFavorite: false };
    }
}
exports.checkAndUpdateVolunteerFavoriting = checkAndUpdateVolunteerFavoriting;
async function getFavoriteVolunteersPaginated(userId, page) {
    const limit = 5;
    const offset = limit * (page - 1);
    return await StudentRepo.getFavoriteVolunteersPaginated(userId, limit, offset);
}
exports.getFavoriteVolunteersPaginated = getFavoriteVolunteersPaginated;
async function getStudentSignupSources() {
    return await StudentRepo.getStudentSignupSources();
}
exports.getStudentSignupSources = getStudentSignupSources;
async function adminGetActivePartnersForStudent(studentId) {
    return await StudentRepo.getActivePartnersForStudent(studentId);
}
exports.adminGetActivePartnersForStudent = adminGetActivePartnersForStudent;
const queueProcrastinationTextReminder = async (studentId, phoneNumber, reminderDate) => {
    await (0, User_1.updateUserPhoneNumberByUserId)(studentId, phoneNumber);
    const utcReminderDate = (0, moment_1.default)(reminderDate, 'MM-DD-YYYY HH:mm a').tz('GMT');
    const diffInMilliseconds = utcReminderDate.diff((0, moment_1.default)().utc());
    await QueueService_1.default.add(jobs_1.Jobs.StudentProcrastinationTextReminder, { userId: studentId }, {
        delay: diffInMilliseconds,
        removeOnComplete: true,
        removeOnFail: true,
    });
    AnalyticsService.captureEvent(studentId, constants_1.EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_QUEUED, {
        event: constants_1.EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_QUEUED,
    });
};
exports.queueProcrastinationTextReminder = queueProcrastinationTextReminder;
