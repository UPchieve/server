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
const constants_1 = require("../../../constants");
const User_1 = require("../../../models/User");
const MailService = __importStar(require("../../../services/MailService"));
const safe_async_1 = require("../../../utils/safe-async");
const type_utils_1 = require("../../../utils/type-utils");
async function emailReportedSession(job) {
    const { data: { reportedBy, reportReason, reportMessage, isBanReason }, } = job;
    const userId = (0, type_utils_1.asString)(job.data.userId);
    const sessionId = (0, type_utils_1.asString)(job.data.sessionId);
    // a user should receive this email regardless of banned status
    // need full user to create sendGrid contact below
    // user with getReportedUser from User Repo
    const user = await (0, User_1.getReportedUser)(userId);
    const errors = [];
    if (!user)
        errors.push(`user ${userId} not found`);
    else {
        if (isBanReason) {
            const banAlert = await (0, safe_async_1.safeAsync)(
            // TODO: double check the email
            MailService.sendBannedUserAlert(userId, constants_1.USER_BAN_REASONS.SESSION_REPORTED, sessionId));
            if (banAlert.error)
                errors.push(`Failed to send ban alert email: ${banAlert.error.message}`);
            const contactResponse = await (0, safe_async_1.safeAsync)(MailService.createContact(user.id));
            if (contactResponse.error)
                errors.push(`Failed to add user ${userId} to ban email group: ${contactResponse.error.message}`);
        }
        const reportAlert = await (0, safe_async_1.safeAsync)(MailService.sendReportedSessionAlert(sessionId, reportedBy, reportReason, reportMessage));
        if (reportAlert.error)
            errors.push(`Failed to send report alert email: ${reportAlert.error.message}`);
        if (user.isVolunteer) {
            const volunteerEmail = await (0, safe_async_1.safeAsync)(MailService.sendCoachReported(user.email, user.firstName));
            if (volunteerEmail.error)
                errors.push(`Failed to send volunteer ${user.id} email for report: ${volunteerEmail.error.message}`);
        }
        else {
            const studentEmail = await (0, safe_async_1.safeAsync)(MailService.sendStudentReported(user.email, user.firstName, reportReason));
            if (studentEmail.error)
                errors.push(`Failed to send student ${user.id} email for report: ${studentEmail.error.message}`);
        }
        let errMsg = '';
        for (const err of errors) {
            if (err)
                errMsg += `${err}\n`;
        }
        if (errMsg)
            throw new Error(errMsg);
    }
}
exports.default = emailReportedSession;
