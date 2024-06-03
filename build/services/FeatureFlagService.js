"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaidTutorsPilotStudentEligibilityFeatureFlag = exports.getProgressReportsFeatureFlag = exports.getAllowDmsToPartnerStudentsFeatureFlag = exports.getSmsVerificationFeatureFlag = exports.getRecapSocketUpdatesFeatureFlag = exports.getWeeklySummaryAllHoursFlag = exports.getSessionRecapDmsFeatureFlag = exports.getProcrastinationTextReminderCopy = exports.getUsingOurPlatformFlag = exports.getMutedSubjectAlertsFlag = exports.getStandardizedCertsFlag = exports.isChatBotEnabled = exports.getAllFlagsForId = exports.getFeatureFlagPayload = void 0;
const constants_1 = require("../constants");
const product_client_1 = require("../product-client");
const time_limit_1 = require("../utils/time-limit");
async function isFeatureEnabled(featureFlagName, userId) {
    return await (0, time_limit_1.timeLimit)({
        promise: product_client_1.client.isFeatureEnabled(featureFlagName, userId),
        fallbackReturnValue: false,
        timeLimitReachedErrorMessage: `Posthog: 'isFeatureEnabled' did not receive response for feature flag '${featureFlagName}'.`,
    });
}
async function getFeatureFlagPayload(featureFlagName, userId) {
    return await (0, time_limit_1.timeLimit)({
        promise: product_client_1.client.getFeatureFlagPayload(featureFlagName, userId),
        fallbackReturnValue: false,
        timeLimitReachedErrorMessage: `Posthog: 'getFeatureFlagPayload' did not receive response for feature flag '${featureFlagName}'.`,
    });
}
exports.getFeatureFlagPayload = getFeatureFlagPayload;
async function getAllFlagsForId(id) {
    return await (0, time_limit_1.timeLimit)({
        promise: product_client_1.client.getAllFlagsAndPayloads(id),
        fallbackReturnValue: { featureFlags: {}, featureFlagPayloads: {} },
        timeLimitReachedErrorMessage: `Posthog: 'getAllFlagsForId' did not receive response.`,
    });
}
exports.getAllFlagsForId = getAllFlagsForId;
function isChatBotEnabled() {
    // TODO: Either put this feature flag into PH, or remove
    // references from code.
    return false;
}
exports.isChatBotEnabled = isChatBotEnabled;
async function getStandardizedCertsFlag(userId) {
    return await isFeatureEnabled(constants_1.FEATURE_FLAGS.STANDARDIZED_CERTS, userId);
}
exports.getStandardizedCertsFlag = getStandardizedCertsFlag;
async function getMutedSubjectAlertsFlag(userId) {
    return await isFeatureEnabled(constants_1.FEATURE_FLAGS.MUTED_SUBJECT_ALERTS, userId);
}
exports.getMutedSubjectAlertsFlag = getMutedSubjectAlertsFlag;
async function getUsingOurPlatformFlag(userId) {
    return await isFeatureEnabled(constants_1.FEATURE_FLAGS.USING_OUR_PLATFORM, userId);
}
exports.getUsingOurPlatformFlag = getUsingOurPlatformFlag;
// The implicit return type expects a JSON shape, but this feature flag only
// has a string payload. We're making an explicit coercion from JSON to string
async function getProcrastinationTextReminderCopy(userId) {
    return product_client_1.client.getFeatureFlagPayload(constants_1.FEATURE_FLAGS.PROCRASTINATION_TEXT_REMINDER, userId);
}
exports.getProcrastinationTextReminderCopy = getProcrastinationTextReminderCopy;
async function getSessionRecapDmsFeatureFlag(userId) {
    return isFeatureEnabled(constants_1.FEATURE_FLAGS.SESSION_RECAP_DMS, userId);
}
exports.getSessionRecapDmsFeatureFlag = getSessionRecapDmsFeatureFlag;
async function getWeeklySummaryAllHoursFlag(userId) {
    return isFeatureEnabled(constants_1.FEATURE_FLAGS.WEEKLY_SUMMARY_ALL_HOURS, userId);
}
exports.getWeeklySummaryAllHoursFlag = getWeeklySummaryAllHoursFlag;
async function getRecapSocketUpdatesFeatureFlag(userId) {
    return isFeatureEnabled(constants_1.FEATURE_FLAGS.RECAP_SOCKET_UPDATES, userId);
}
exports.getRecapSocketUpdatesFeatureFlag = getRecapSocketUpdatesFeatureFlag;
async function getSmsVerificationFeatureFlag(userId) {
    return isFeatureEnabled(constants_1.FEATURE_FLAGS.SMS_VERIFICATION, userId);
}
exports.getSmsVerificationFeatureFlag = getSmsVerificationFeatureFlag;
async function getAllowDmsToPartnerStudentsFeatureFlag(userId) {
    return isFeatureEnabled(constants_1.FEATURE_FLAGS.ALLOW_DMS_TO_PARTNER_STUDENTS, userId);
}
exports.getAllowDmsToPartnerStudentsFeatureFlag = getAllowDmsToPartnerStudentsFeatureFlag;
async function getProgressReportsFeatureFlag(userId) {
    return await isFeatureEnabled(constants_1.FEATURE_FLAGS.PROGRESS_REPORTS, userId);
}
exports.getProgressReportsFeatureFlag = getProgressReportsFeatureFlag;
async function getPaidTutorsPilotStudentEligibilityFeatureFlag(userId) {
    return await (0, time_limit_1.timeLimit)({
        promise: product_client_1.client.getFeatureFlag(constants_1.FEATURE_FLAGS.PAID_TUTORS_PILOT_STUDENT_ELIGIBILITY, userId, {
            personProperties: {
                paidTutorsPilotEligible: 'true',
            },
        }),
        fallbackReturnValue: false,
        timeLimitReachedErrorMessage: `Posthog: 'getFeatureFlag' for '${constants_1.FEATURE_FLAGS.PAID_TUTORS_PILOT_STUDENT_ELIGIBILITY}'.`,
    });
}
exports.getPaidTutorsPilotStudentEligibilityFeatureFlag = getPaidTutorsPilotStudentEligibilityFeatureFlag;
