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
const logger_1 = require("../../logger");
const MailService = __importStar(require("../../../services/MailService"));
const queries_1 = require("../../../models/Volunteer/queries");
const index_1 = require("../index");
const type_utils_1 = require("../../../utils/type-utils");
exports.default = async (job) => {
    const { name: currentJob } = job;
    const volunteerId = (0, type_utils_1.asString)(job.data.volunteerId);
    const volunteer = await (0, queries_1.getVolunteerForOnboardingById)(volunteerId);
    if (volunteer) {
        try {
            let delay = 0;
            let nextJob = '';
            const { firstName, email } = volunteer;
            if (currentJob === index_1.Jobs.EmailOnboardingReminderOne) {
                const hasUnlockedASubject = volunteer.subjects.length > 0;
                const hasSelectedAvailability = !!volunteer.availabilityLastModifiedAt;
                const hasCompletedBackgroundInfo = !!volunteer.country;
                // Volunteer has not completed onboarding 7 days after creating  account
                await MailService.sendOnboardingReminderOne(firstName, email, hasCompletedBackgroundInfo, volunteer.hasCompletedUpchieve101, hasUnlockedASubject, hasSelectedAvailability);
                delay = 1000 * 60 * 60 * 24 * 7;
                nextJob = index_1.Jobs.EmailOnboardingReminderTwo;
            }
            if (currentJob === index_1.Jobs.EmailOnboardingReminderTwo) {
                // Volunteer has not completed onboarding 7 days after sending onboarding reminder one
                await MailService.sendOnboardingReminderTwo(email, firstName);
                delay = 1000 * 60 * 60 * 24 * 10;
                nextJob = index_1.Jobs.EmailOnboardingReminderThree;
            }
            if (currentJob === index_1.Jobs.EmailOnboardingReminderThree) {
                // Volunteer has not completed onboarding 10 days after sending onboarding reminder two
                await MailService.sendOnboardingReminderThree(email, firstName);
            }
            (0, logger_1.log)(`Emailed ${currentJob} to volunteer ${volunteerId}`);
            if (nextJob)
                job.queue.add(nextJob, { volunteerId: volunteerId.toString() }, { delay, removeOnComplete: true, removeOnFail: true });
        }
        catch (error) {
            throw new Error(`Failed to email ${currentJob} to volunteer ${volunteerId}: ${error}`);
        }
    }
};
