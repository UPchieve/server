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
const queries_1 = require("../../../models/Student/queries");
const index_1 = require("../index");
const type_utils_1 = require("../../../utils/type-utils");
exports.default = async (job) => {
    const { data: { studentId }, name: currentJob, } = job;
    const student = await (0, queries_1.getStudentContactInfoById)((0, type_utils_1.asString)(studentId));
    if (student) {
        try {
            const { firstName, email } = student;
            if (currentJob === index_1.Jobs.EmailStudentOnboardingHowItWorks ||
                currentJob === index_1.Jobs.EmailStudentUseCases)
                await MailService.sendStudentOnboardingHowItWorks(email, firstName);
            if (currentJob === index_1.Jobs.EmailMeetOurVolunteers)
                await MailService.sendMeetOurVolunteers(email, firstName);
            if (currentJob === index_1.Jobs.EmailStudentOnboardingMission ||
                currentJob === index_1.Jobs.EmailIndependentLearning)
                await MailService.sendStudentOnboardingMission(email, firstName);
            if (currentJob === index_1.Jobs.EmailStudentOnboardingSurvey ||
                currentJob === index_1.Jobs.EmailStudentGoalSetting)
                await MailService.sendStudentOnboardingSurvey(email, firstName);
            (0, logger_1.log)(`Emailed ${currentJob} to student ${studentId}`);
        }
        catch (error) {
            throw new Error(`Failed to email ${currentJob} to student ${studentId}: ${error}`);
        }
    }
};
