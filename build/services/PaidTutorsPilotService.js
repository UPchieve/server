"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketUser = exports.bucketFor = void 0;
const constants_1 = require("../constants");
const FeatureFlagService_1 = require("./FeatureFlagService");
const UserProductFlags_1 = require("../models/UserProductFlags");
const AnalyticsService_1 = require("./AnalyticsService");
async function bucketFor(userId) {
    const results = await (0, UserProductFlags_1.getUPFByUserId)(userId);
    return results === null || results === void 0 ? void 0 : results.paidTutorsPilotGroup;
}
exports.bucketFor = bucketFor;
const eligibleSubjects = [constants_1.SUBJECT_TYPES.MATH, constants_1.SUBJECT_TYPES.COLLEGE];
async function bucketUser(userId, topic) {
    const existingGroup = await bucketFor(userId);
    if (existingGroup) {
        return existingGroup;
    }
    else if (eligibleSubjects.includes(topic)) {
        // Let posthog decide whether this user is in test or control
        // https://posthog.com/docs/libraries/node#advanced-overriding-server-properties
        const group = await (0, FeatureFlagService_1.getPaidTutorsPilotStudentEligibilityFeatureFlag)(userId);
        if (group === 'test' || group === 'control') {
            (0, AnalyticsService_1.identify)(userId, { paidTutorsPilotGroup: group });
            await (0, UserProductFlags_1.updatePaidTutorsPilotGroup)(userId, group);
        }
        return group;
    }
}
exports.bucketUser = bucketUser;
