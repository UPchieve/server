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
exports.createVolunteer = exports.updateVolunteerQuiz = exports.addVolunteerCertification = exports.getVolunteersForWaitingReferences = exports.getVolunteersForReadyToCoach = exports.getVolunteersForNiceToMeetYou = exports.updateVolunteerOnboarded = exports.updateVolunteerApproved = exports.updateVolunteerReferenceStatus = exports.getVolunteerForPendingStatus = exports.checkReferenceExistsBeforeAdding = exports.getReferencesByVolunteerForAdminDetail = exports.getReferencesByVolunteer = exports.getVolunteersForEmailReferenceApology = exports.getVolunteersForEmailReference = exports.updateVolunteerSentInactive90DayEmail = exports.updateVolunteerSentInactive60DayEmail = exports.updateVolunteerSentInactive30DayEmail = exports.updateVolunteerPhotoIdById = exports.updateVolunteerTrainingById = exports.getVolunteerTrainingCourses = exports.updateVolunteerTotalHoursById = exports.updateVolunteerElapsedAvailabilityById = exports.updateVolunteersReadyToCoachByIds = exports.deleteVolunteerReferenceByEmail = exports.updateVolunteerPending = exports.updateVolunteerReferenceStatusById = exports.updateVolunteerReferenceSentById = exports.getInactiveVolunteers = exports.updateVolunteerReferenceSubmission = exports.addVolunteerReferenceById = exports.getVolunteerByReference = exports.getVolunteersNotifiedBySessionId = exports.getVolunteersNotifiedSinceDate = exports.getVolunteersForTelecomReport = exports.getVolunteerForOnboardingById = exports.getVolunteersForTotalHours = exports.getVolunteerIdsForElapsedAvailability = exports.updateVolunteerThroughAvailability = exports.updateVolunteerHourSummaryIntroById = exports.getVolunteersForWeeklyHourSummary = exports.getActiveQuizzesForVolunteers = exports.getCertificationsForVolunteer = exports.getQuizzesForVolunteers = exports.getPartnerVolunteerForLowHours = exports.getVolunteerForQuickTips = exports.getVolunteersForBlackoutOver = exports.getVolunteerContactInfoByIds = exports.getSubjectsForVolunteer = exports.getVolunteerContactInfoById = void 0;
exports.getVolunteersForAnalyticsReport = exports.getUniqueStudentsHelpedForAnalyticsReportSummary = exports.getVolunteersOnDeck = exports.getVolunteerForScheduleUpdate = exports.checkIfVolunteerMutedSubject = exports.getNextVolunteerToNotify = exports.updateVolunteerBackgroundInfo = exports.getQuizzesPassedForDateRange = exports.getReferencesToFollowup = exports.getVolunteersToReview = exports.updateVolunteerForAdmin = exports.getPartnerOrgByKey = exports.getVolunteerForTextResponse = void 0;
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
const Availability_1 = require("../Availability");
const config_1 = __importDefault(require("../../config"));
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../../constants");
const AssociatedPartner_1 = require("../AssociatedPartner");
const type_utils_1 = require("../../utils/type-utils");
const training_courses_1 = require("../../utils/training-courses");
const User_1 = require("../User");
const VolunteerPartnerOrg_1 = require("../VolunteerPartnerOrg");
const ReportService_1 = require("../../services/ReportService");
async function getVolunteerContactInfoById(userId) {
    try {
        const result = await pgQueries.getVolunteerContactInfoById.run({ userId }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const ret = (0, pgUtils_1.makeSomeOptional)(result[0], ['volunteerPartnerOrg']);
        ret.email = ret.email.toLowerCase();
        return ret;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerContactInfoById = getVolunteerContactInfoById;
async function getSubjectsForVolunteer(userId) {
    try {
        const result = await pgQueries.getSubjectsForVolunteer.run({ userId }, (0, db_1.getClient)());
        const subjects = result.map(v => (0, pgUtils_1.makeRequired)(v).subject);
        return subjects;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSubjectsForVolunteer = getSubjectsForVolunteer;
async function getVolunteerContactInfoByIds(userIds) {
    try {
        const result = await pgQueries.getVolunteerContactInfoByIds.run({ userIds }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerContactInfoByIds = getVolunteerContactInfoByIds;
async function getVolunteersForBlackoutOver(startDate) {
    try {
        const result = await pgQueries.getVolunteersForBlackoutOver.run({ startDate }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForBlackoutOver = getVolunteersForBlackoutOver;
async function getVolunteerForQuickTips(userId) {
    try {
        const vResult = await pgQueries.getVolunteerForQuickTips.run({
            userId: (0, type_utils_1.isPgId)(userId) ? userId : undefined,
            mongoUserId: (0, type_utils_1.isPgId)(userId) ? undefined : userId,
        }, (0, db_1.getClient)());
        if (!vResult.length)
            return;
        const volunteer = (0, pgUtils_1.makeSomeOptional)(vResult[0], ['volunteerPartnerOrg']);
        const availability = await (0, Availability_1.getAvailabilityForVolunteer)(userId);
        volunteer.email = volunteer.email.toLowerCase();
        return {
            ...volunteer,
            availability,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerForQuickTips = getVolunteerForQuickTips;
async function getPartnerVolunteerForLowHours(userId) {
    try {
        const vResult = await pgQueries.getPartnerVolunteerForLowHours.run({
            userId: (0, type_utils_1.isPgId)(userId) ? userId : undefined,
            mongoUserId: (0, type_utils_1.isPgId)(userId) ? undefined : userId,
        }, (0, db_1.getClient)());
        if (!vResult.length)
            return;
        const volunteer = (0, pgUtils_1.makeRequired)(vResult[0]); // volunteerPartnerOrg must exist
        volunteer.email = volunteer.email.toLowerCase();
        const availability = await (0, Availability_1.getAvailabilityForVolunteer)(userId);
        return {
            ...volunteer,
            availability,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPartnerVolunteerForLowHours = getPartnerVolunteerForLowHours;
async function getQuizzesForVolunteers(userIds, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getQuizzesForVolunteers.run({ userIds }, client);
        const rows = result.map(v => (0, pgUtils_1.makeRequired)(v));
        const rowsByUser = lodash_1.default.groupBy(rows, v => v.userId);
        const map = {};
        for (const user of userIds) {
            const temp = {};
            const rows = rowsByUser[user] || [];
            for (const row of rows) {
                temp[row.name] = {
                    passed: row.passed,
                    tries: row.tries,
                    lastAttemptedAt: row.lastAttemptedAt,
                };
            }
            map[user] = temp;
        }
        return map;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizzesForVolunteers = getQuizzesForVolunteers;
async function getCertificationsForVolunteer(userIds, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getCertificationsForVolunteer.run({ userIds }, client);
        const rows = result.map(v => (0, pgUtils_1.makeRequired)(v));
        const rowsByUser = lodash_1.default.groupBy(rows, v => v.userId);
        const map = {};
        for (const user of userIds) {
            const temp = {};
            const rows = rowsByUser[user] || [];
            for (const row of rows) {
                temp[row.name] = {
                    passed: true,
                    tries: 1,
                    lastAttemptedAt: row.lastAttemptedAt,
                };
            }
            map[user] = temp;
        }
        return map;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getCertificationsForVolunteer = getCertificationsForVolunteer;
async function getActiveQuizzesForVolunteers(userIds, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getActiveQuizzesForVolunteers.run({ userIds }, client);
        const rows = result.map(v => (0, pgUtils_1.makeRequired)(v));
        const rowsByUser = lodash_1.default.groupBy(rows, v => v.userId);
        const map = {};
        for (const user of userIds) {
            const temp = {};
            const rows = rowsByUser[user] || [];
            for (const row of rows) {
                temp[row.name] = {
                    passed: row.passed,
                    tries: row.tries,
                    lastAttemptedAt: row.lastAttemptedAt,
                };
            }
            map[user] = temp;
        }
        return map;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getActiveQuizzesForVolunteers = getActiveQuizzesForVolunteers;
async function getVolunteersForWeeklyHourSummary() {
    try {
        const result = await pgQueries.getVolunteersForWeeklyHourSummary.run(undefined, (0, db_1.getClient)());
        const rows = result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']));
        const quizzes = await getQuizzesForVolunteers(rows.map(v => v.id));
        return rows.map(v => ({
            ...v,
            quizzes: quizzes[v.id],
        }));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForWeeklyHourSummary = getVolunteersForWeeklyHourSummary;
async function updateVolunteerHourSummaryIntroById(userId) {
    try {
        const result = await pgQueries.updateVolunteerHourSummaryIntroById.run({ userId }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerHourSummaryIntroById = updateVolunteerHourSummaryIntroById;
async function updateVolunteerThroughAvailability(userId, timezone, onboarded) {
    try {
        const result = await pgQueries.updateVolunteerThroughAvailability.run({ userId, onboarded, timezone }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerThroughAvailability = updateVolunteerThroughAvailability;
async function getVolunteerIdsForElapsedAvailability() {
    try {
        const result = await pgQueries.getVolunteerIdsForElapsedAvailability.run(undefined, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v).userId);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerIdsForElapsedAvailability = getVolunteerIdsForElapsedAvailability;
async function getVolunteersForTotalHours() {
    try {
        const result = await pgQueries.getVolunteersForTotalHours.run({ targetPartnerOrgs: config_1.default.customVolunteerPartnerOrgs }, (0, db_1.getClient)());
        const rows = result.map(v => (0, pgUtils_1.makeRequired)(v));
        const quizzes = await getQuizzesForVolunteers(rows.map(v => v.id));
        return rows.map(v => ({
            ...v,
            quizzes: quizzes[v.id],
        }));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForTotalHours = getVolunteersForTotalHours;
async function getVolunteerForOnboardingById(userId) {
    var _a;
    try {
        const result = await pgQueries.getVolunteerForOnboardingById.run({
            userId: (0, type_utils_1.isPgId)(userId) ? userId : undefined,
            mongoUserId: (0, type_utils_1.isPgId)(userId) ? undefined : userId,
        }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const volunteer = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'availabilityLastModifiedAt',
            'country',
        ]);
        const trainingCourses = await getVolunteerTrainingCourses(volunteer.id);
        if (volunteer.email) {
            volunteer.email = volunteer.email.toLowerCase();
        }
        return {
            ...volunteer,
            hasCompletedUpchieve101: !!((_a = trainingCourses['upchieve101']) === null || _a === void 0 ? void 0 : _a.complete),
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerForOnboardingById = getVolunteerForOnboardingById;
// TODO: break out anything that uses RO client into their own repo
async function getVolunteersForTelecomReport(partnerOrg) {
    try {
        const result = await pgQueries.getVolunteersForTelecomReport.run({ partnerOrg }, (0, db_1.getAnalyticsClient)());
        const rows = result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']));
        const quizzes = await getQuizzesForVolunteers(rows.map(v => v.id));
        return rows.map(v => ({
            ...v,
            quizzes: quizzes[v.id],
        }));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForTelecomReport = getVolunteersForTelecomReport;
async function getVolunteersNotifiedSinceDate(sinceDate) {
    try {
        const result = await pgQueries.getVolunteersNotifiedSinceDate.run({ sinceDate }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v).id);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersNotifiedSinceDate = getVolunteersNotifiedSinceDate;
async function getVolunteersNotifiedBySessionId(sessionId) {
    try {
        const result = await pgQueries.getVolunteersNotifiedBySessionId.run({ sessionId }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v).userId);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersNotifiedBySessionId = getVolunteersNotifiedBySessionId;
async function getVolunteerByReference(referenceId) {
    try {
        const result = await pgQueries.getVolunteerByReference.run({ referenceId }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const ret = (0, pgUtils_1.makeRequired)(result[0]);
        ret.referenceEmail = ret.referenceEmail.toLowerCase();
        return ret;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerByReference = getVolunteerByReference;
async function addVolunteerReferenceById(volunteerId, reference) {
    try {
        reference.email = reference.email.toLowerCase();
        const result = await pgQueries.addVolunteerReferenceById.run({
            id: (0, pgUtils_1.getDbUlid)(),
            userId: volunteerId,
            ...reference,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoCreateError('Insert query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoCreateError)
            throw err;
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.addVolunteerReferenceById = addVolunteerReferenceById;
async function updateVolunteerReferenceSubmission(referenceId, referenceSubmission) {
    try {
        const result = await pgQueries.updateVolunteerReferenceSubmission.run({ referenceId, ...referenceSubmission }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerReferenceSubmission = updateVolunteerReferenceSubmission;
async function getInactiveVolunteers(thirtyDaysAgoStartOfDay, thirtyDaysAgoEndOfDay, sixtyDaysAgoStartOfDay, sixtyDaysAgoEndOfDay, ninetyDaysAgoStartOfDay, ninetyDaysAgoEndOfDay) {
    try {
        const thirtyResult = await pgQueries.getInactiveVolunteers.run({ start: thirtyDaysAgoStartOfDay, end: thirtyDaysAgoEndOfDay }, (0, db_1.getClient)());
        const thirties = thirtyResult.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']));
        const sixtyResult = await pgQueries.getInactiveVolunteers.run({ start: sixtyDaysAgoStartOfDay, end: sixtyDaysAgoEndOfDay }, (0, db_1.getClient)());
        const sixties = sixtyResult.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']));
        const ninetyResult = await pgQueries.getInactiveVolunteers.run({ start: ninetyDaysAgoStartOfDay, end: ninetyDaysAgoEndOfDay }, (0, db_1.getClient)());
        const nineties = ninetyResult.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']));
        return {
            inactiveThirtyDays: thirties,
            inactiveSixtyDays: sixties,
            inactiveNinetyDays: nineties,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getInactiveVolunteers = getInactiveVolunteers;
async function updateVolunteerReferenceSentById(referenceId) {
    try {
        const result = await pgQueries.updateVolunteerReferenceSentById.run({
            referenceId,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerReferenceSentById = updateVolunteerReferenceSentById;
async function updateVolunteerReferenceStatusById(referenceId, status) {
    try {
        const result = await pgQueries.updateVolunteerReferenceStatusById.run({
            referenceId,
            status: status.toLowerCase(),
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerReferenceStatusById = updateVolunteerReferenceStatusById;
async function updateVolunteerPending(userId, approved, photoIdStatus) {
    try {
        const result = await pgQueries.updateVolunteerPending.run({ userId, approved, status: photoIdStatus.toLowerCase() }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerPending = updateVolunteerPending;
async function deleteVolunteerReferenceByEmail(userId, referenceEmail) {
    try {
        const result = await pgQueries.deleteVolunteerReferenceById.run({
            userId,
            referenceEmail: referenceEmail.toLowerCase(),
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.deleteVolunteerReferenceByEmail = deleteVolunteerReferenceByEmail;
async function updateVolunteersReadyToCoachByIds(userIds) {
    try {
        const result = await pgQueries.updateVolunteersReadyToCoachByIds.run({
            userIds,
        }, (0, db_1.getClient)());
        const errors = [];
        for (const row of result) {
            try {
                if (!(0, pgUtils_1.makeRequired)(row).ok)
                    throw new Error('Updated row did not return ok');
            }
            catch (err) {
                errors.push(err.message);
            }
        }
        if (errors.length)
            throw new Errors_1.RepoUpdateError(errors.join('\n'));
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteersReadyToCoachByIds = updateVolunteersReadyToCoachByIds;
async function updateVolunteerElapsedAvailabilityById(userId, elapsedAvailability) {
    try {
        const result = await pgQueries.updateVolunteerElapsedAvailabilityById.run({
            userId,
            elapsedAvailability,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerElapsedAvailabilityById = updateVolunteerElapsedAvailabilityById;
async function updateVolunteerTotalHoursById(userId, totalHours) {
    try {
        const result = await pgQueries.updateVolunteerTotalHoursById.run({
            userId,
            totalHours: String(totalHours),
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerTotalHoursById = updateVolunteerTotalHoursById;
async function getVolunteerTrainingCourses(userId, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getVolunteerTrainingCourses.run({ userId }, client);
        const map = {};
        for (const row of result) {
            const temp = { ...(0, pgUtils_1.makeRequired)(row) };
            map[temp.trainingCourse] = {
                ...temp,
                isComplete: temp.complete,
                progress: await (0, training_courses_1.getProgress)(temp.trainingCourse, temp.completedMaterials, userId),
            };
        }
        return map;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerTrainingCourses = getVolunteerTrainingCourses;
async function updateVolunteerTrainingById(userId, trainingCourse, complete, progress, materialKey) {
    try {
        const result = await pgQueries.updateVolunteerTrainingById.run({
            userId,
            trainingCourse,
            complete,
            progress,
            materialKey,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerTrainingById = updateVolunteerTrainingById;
async function updateVolunteerPhotoIdById(userId, key, status) {
    try {
        const result = await pgQueries.updateVolunteerPhotoIdById.run({
            userId,
            key,
            status,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerPhotoIdById = updateVolunteerPhotoIdById;
async function updateVolunteerSentInactive30DayEmail(userId) {
    try {
        const result = await pgQueries.updateVolunteerSentInactive30DayEmail.run({
            userId,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerSentInactive30DayEmail = updateVolunteerSentInactive30DayEmail;
async function updateVolunteerSentInactive60DayEmail(userId) {
    try {
        const result = await pgQueries.updateVolunteerSentInactive60DayEmail.run({
            userId,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerSentInactive60DayEmail = updateVolunteerSentInactive60DayEmail;
async function updateVolunteerSentInactive90DayEmail(userId) {
    try {
        const result = await pgQueries.updateVolunteerSentInactive90DayEmail.run({
            userId,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerSentInactive90DayEmail = updateVolunteerSentInactive90DayEmail;
async function getVolunteersForEmailReference() {
    try {
        const result = await pgQueries.getVolunteerUnsentReferences.run(undefined, (0, db_1.getClient)());
        const references = result.map(v => (0, pgUtils_1.makeRequired)(v));
        const volunteers = await getVolunteerContactInfoByIds(references.map(v => v.userId));
        const map = lodash_1.default.groupBy(references, v => v.userId);
        return volunteers.map(v => {
            const references = [];
            for (const ref of map[v.id]) {
                references.push({
                    id: ref.id,
                    firstName: ref.firstName,
                    lastName: ref.lastName,
                    email: ref.email.toLowerCase(),
                });
            }
            return {
                ...v,
                references: references,
            };
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForEmailReference = getVolunteersForEmailReference;
// TODO: remove once job is executed
async function getVolunteersForEmailReferenceApology() {
    try {
        const result = await pgQueries.getReferencesForReferenceFormApology.run(undefined, (0, db_1.getClient)());
        const references = result.map(v => (0, pgUtils_1.makeRequired)(v));
        const volunteers = await getVolunteerContactInfoByIds(references.map(v => v.userId));
        const map = lodash_1.default.groupBy(references, v => v.userId);
        return volunteers.map(v => {
            const references = [];
            for (const ref of map[v.id]) {
                references.push({
                    id: ref.id,
                    firstName: ref.firstName,
                    lastName: ref.lastName,
                    email: ref.email.toLowerCase(),
                });
            }
            return {
                ...v,
                references: references,
            };
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForEmailReferenceApology = getVolunteersForEmailReferenceApology;
async function getReferencesByVolunteer(userId, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getReferencesByVolunteer.run({ userId }, client);
        return result.map(v => {
            const ret = (0, pgUtils_1.makeRequired)(v);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getReferencesByVolunteer = getReferencesByVolunteer;
async function getReferencesByVolunteerForAdminDetail(userId, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getReferencesByVolunteerForAdminDetail.run({ userId }, client);
        return result.map(v => {
            const ret = (0, pgUtils_1.makeSomeRequired)(v, [
                'id',
                'firstName',
                'lastName',
                'status',
                'email',
            ]);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getReferencesByVolunteerForAdminDetail = getReferencesByVolunteerForAdminDetail;
async function checkReferenceExistsBeforeAdding(userId, email) {
    try {
        const result = await pgQueries.checkReferenceExistsBeforeAdding.run({ userId, email: email.toLowerCase() }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.checkReferenceExistsBeforeAdding = checkReferenceExistsBeforeAdding;
async function getVolunteerForPendingStatus(userId) {
    try {
        const result = await pgQueries.getVolunteerForPendingStatus.run({ userId }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const volunteer = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'country',
            'volunteerPartnerOrg',
        ]);
        volunteer.email = volunteer.email.toLowerCase();
        const references = await getReferencesByVolunteer(userId);
        return {
            ...volunteer,
            references,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerForPendingStatus = getVolunteerForPendingStatus;
async function updateVolunteerReferenceStatus(referenceId, status) {
    try {
        const result = await pgQueries.updateVolunteerReferenceStatus.run({ referenceId, status }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerReferenceStatus = updateVolunteerReferenceStatus;
async function updateVolunteerApproved(userId) {
    try {
        const result = await pgQueries.updateVolunteerApproved.run({ userId }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerApproved = updateVolunteerApproved;
async function updateVolunteerOnboarded(userId) {
    try {
        const result = await pgQueries.updateVolunteerOnboarded.run({ userId }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerOnboarded = updateVolunteerOnboarded;
async function getVolunteersForNiceToMeetYou(start, end) {
    try {
        const result = await pgQueries.getVolunteersForNiceToMeetYou.run({ start, end }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForNiceToMeetYou = getVolunteersForNiceToMeetYou;
async function getVolunteersForReadyToCoach() {
    try {
        const result = await pgQueries.getVolunteersForReadyToCoach.run(undefined, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForReadyToCoach = getVolunteersForReadyToCoach;
async function getVolunteersForWaitingReferences(start, end) {
    try {
        const result = await pgQueries.getVolunteersForWaitingReferences.run({ start, end }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeSomeOptional)(v, ['volunteerPartnerOrg']);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForWaitingReferences = getVolunteersForWaitingReferences;
async function addVolunteerCertification(userId, subject) {
    try {
        const result = await pgQueries.addVolunteerCertification.run({ userId, subject }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.addVolunteerCertification = addVolunteerCertification;
async function updateVolunteerQuiz(userId, quiz, passed) {
    try {
        const result = await pgQueries.updateVolunteerQuiz.run({ userId, quiz, passed }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerQuiz = updateVolunteerQuiz;
async function createVolunteer(volunteerData) {
    const client = await (0, db_1.getClient)().connect();
    try {
        volunteerData.email = volunteerData.email.toLowerCase();
        const partnerOrg = volunteerData.volunteerPartnerOrg
            ? await getPartnerOrgByKey(volunteerData.volunteerPartnerOrg, client)
            : undefined;
        await client.query('BEGIN');
        const userId = (0, pgUtils_1.getDbUlid)();
        const userResult = await pgQueries.createVolunteerUser.run({
            userId,
            referralCode: (0, pgUtils_1.generateReferralCode)(userId),
            ...volunteerData,
            signupSourceId: volunteerData.signupSourceId,
            otherSignupSource: volunteerData.otherSignupSource,
        }, client);
        if (!userResult.length && (0, pgUtils_1.makeRequired)(userResult[0]).id)
            throw new Error('Insert query did not return new row');
        const user = (0, pgUtils_1.makeRequired)(userResult[0]);
        const profileResult = await pgQueries.createVolunteerProfile.run({
            userId: user.id,
            timezone: volunteerData.timezone,
            partnerOrgId: partnerOrg === null || partnerOrg === void 0 ? void 0 : partnerOrg.partnerId,
        }, client);
        if (partnerOrg) {
            const vpoInstanceResult = await pgQueries.createUserVolunteerPartnerOrgInstance.run({
                userId,
                vpoName: partnerOrg.partnerName,
            }, client);
            if (!(0, pgUtils_1.makeRequired)(vpoInstanceResult)[0].ok)
                throw new Errors_1.RepoCreateError('Could not create volunteer: user partner org instance creation did not return rows');
        }
        if (!profileResult.length && (0, pgUtils_1.makeRequired)(profileResult[0]).ok)
            throw new Error('Insert query did not return new row');
        await client.query('COMMIT');
        await (0, User_1.insertUserRoleByUserId)(userId, constants_1.USER_ROLES.VOLUNTEER, client);
        return {
            ...user,
            volunteerPartnerOrg: volunteerData.volunteerPartnerOrg,
            isVolunteer: true,
            isAdmin: false,
        };
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoCreateError(err);
    }
    finally {
        client.release();
    }
}
exports.createVolunteer = createVolunteer;
async function getVolunteerForTextResponse(phone) {
    try {
        const result = await pgQueries.getVolunteerForTextResponse.run({ phone }, (0, db_1.getClient)());
        if (!result.length)
            return;
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['endedAt']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerForTextResponse = getVolunteerForTextResponse;
async function getPartnerOrgByKey(partnerKey, client) {
    if (!partnerKey)
        return;
    try {
        const result = await pgQueries.getPartnerOrgByKey.run({
            partnerOrgKey: partnerKey,
        }, client);
        return result.length ? (0, pgUtils_1.makeRequired)(result[0]) : undefined;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPartnerOrgByKey = getPartnerOrgByKey;
async function adminUpdateVolunteerPartnerOrgInstance(volunteerId, newPartnerOrgKey, client) {
    try {
        const newPartnerOrg = await getPartnerOrgByKey(newPartnerOrgKey, client);
        if (newPartnerOrgKey && !newPartnerOrg)
            throw new Error(`New partner org ${newPartnerOrgKey} does not exist`);
        const activePartnerOrgInstanceResults = await pgQueries.getPartnerOrgsByVolunteer.run({ volunteerId }, client);
        const activePartnerOrgInstances = activePartnerOrgInstanceResults.map(v => (0, pgUtils_1.makeRequired)(v));
        // volunteers should not have more than one partner org
        if (activePartnerOrgInstances.length > 1)
            throw new Error(`Volunteer ${volunteerId} has more than 1 partner org; cannot update`);
        const activeOrgInstance = activePartnerOrgInstances[0];
        /**
         *
         * We attempt to deactive the active instance in two cases:
         * 1. We're removing a partner org and there is an active instance
         * 2. We're changing the partner org and there is an active instance
         *
         */
        if ((activeOrgInstance && !newPartnerOrg) ||
            (activeOrgInstance &&
                newPartnerOrg &&
                activeOrgInstance.name !== newPartnerOrg.partnerName)) {
            const updateResult = await pgQueries.adminDeactivateVolunteerPartnershipInstance.run({ userId: volunteerId, vpoId: activeOrgInstance.id }, client);
            if (!(0, pgUtils_1.makeRequired)(updateResult[0]).ok)
                throw new Error(`Deactivating active partner org instance failed for volunteer ${volunteerId}`);
        }
        /**
         *
         * We attempt to add a new active org instance in two cases:
         * 1. We're adding a new partner org and there is no active instance
         * 2. We're changing the partner org
         *
         */
        if ((!activeOrgInstance && newPartnerOrg) ||
            (activeOrgInstance &&
                newPartnerOrg &&
                activeOrgInstance.name !== newPartnerOrg.partnerName)) {
            const insertResult = await pgQueries.createUserVolunteerPartnerOrgInstance.run({
                userId: volunteerId,
                vpoName: newPartnerOrg.partnerName,
            }, client);
            if (!(0, pgUtils_1.makeRequired)(insertResult[0]).ok)
                throw new Error(`Inserting new partner org instance failed for volunteer ${volunteerId}`);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Could not update volunteer partner org: ${err}`);
    }
}
async function updateVolunteerForAdmin(userId, update) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const partnerOrgId = update.volunteerPartnerOrg
            ? await (0, VolunteerPartnerOrg_1.getVolunteerPartnerOrgIdByKey)(update.volunteerPartnerOrg, client)
            : undefined;
        await client.query('BEGIN');
        const userResult = await pgQueries.updateVolunteerUserForAdmin.run({
            userId,
            firstName: update.firstName,
            lastName: update.lastName,
            email: update.email.toLowerCase(),
            isVerified: update.isVerified,
            isBanned: update.isBanned,
            isDeactivated: update.isDeactivated,
        }, client);
        const profileResult = await pgQueries.updateVolunteerProfilesForAdmin.run({
            userId,
            approved: update.isApproved,
            partnerOrgId,
        }, client);
        await adminUpdateVolunteerPartnerOrgInstance(userId, update.volunteerPartnerOrg, client);
        if (!(userResult.length &&
            profileResult.length &&
            (0, pgUtils_1.makeRequired)(userResult[0]).ok &&
            (0, pgUtils_1.makeRequired)(profileResult[0]).ok))
            throw new Errors_1.RepoUpdateError('update query did not return ok');
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoUpdateError(err);
    }
    finally {
        client.release();
    }
}
exports.updateVolunteerForAdmin = updateVolunteerForAdmin;
async function getVolunteersToReview(limit, offset) {
    try {
        const result = await pgQueries.getVolunteersToReview.run({ limit, offset }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeRequired)(v);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersToReview = getVolunteersToReview;
async function getReferencesToFollowup(start, end) {
    try {
        const result = await pgQueries.getReferencesToFollowup.run({ start, end }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeRequired)(v);
            ret.referenceEmail = ret.referenceEmail.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getReferencesToFollowup = getReferencesToFollowup;
async function getQuizzesPassedForDateRange(userId, start, end) {
    try {
        const result = await pgQueries.getQuizzesPassedForDateRange.run({ userId, start, end }, (0, db_1.getClient)());
        return (0, pgUtils_1.makeRequired)(result[0]).total;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizzesPassedForDateRange = getQuizzesPassedForDateRange;
async function updateVolunteerBackgroundInfo(userId, backgroundInfo) {
    try {
        const result = await pgQueries.updateVolunteerBackgroundInfo.run({
            userId,
            ...backgroundInfo,
            occupation: backgroundInfo.occupation
                ? backgroundInfo.occupation.map(v => ({
                    occupation: v,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }))
                : [],
        }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateVolunteerBackgroundInfo = updateVolunteerBackgroundInfo;
async function getNextVolunteerToNotify(options) {
    try {
        const result = await pgQueries.getNextVolunteerToNotify.run(options, (0, db_1.getRoClient)());
        if (!result.length)
            return;
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['volunteerPartnerOrg']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getNextVolunteerToNotify = getNextVolunteerToNotify;
async function checkIfVolunteerMutedSubject(userId, subjectName) {
    try {
        const result = await pgQueries.checkIfVolunteerMutedSubject.run({ userId, subjectName }, (0, db_1.getClient)());
        return result.length ? true : false;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.checkIfVolunteerMutedSubject = checkIfVolunteerMutedSubject;
async function getVolunteerForScheduleUpdate(userId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.getVolunteerForScheduleUpdate.run({ userId }, client);
        if (!result.length)
            throw new Errors_1.RepoReadError('Volunteer not found');
        const volunteer = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'volunteerPartnerOrg',
            'subjects',
        ]);
        const availability = await (0, Availability_1.getAvailabilityForVolunteer)(volunteer.id, client);
        return {
            ...volunteer,
            availability,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.getVolunteerForScheduleUpdate = getVolunteerForScheduleUpdate;
async function getVolunteersOnDeck(subject, excludedIds) {
    try {
        const result = await pgQueries.getVolunteersOnDeck.run({ subject, excludedIds }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersOnDeck = getVolunteersOnDeck;
// TODO: break out anything that uses RO client into their own repo
async function getUniqueStudentsHelpedForAnalyticsReportSummary(volunteerPartnerOrg, start, end) {
    try {
        const associatedPartners = await (0, AssociatedPartner_1.getAssociatedPartnersAndSchools)(volunteerPartnerOrg);
        const result = await pgQueries.getUniqueStudentsHelpedForAnalyticsReportSummary.run({
            volunteerPartnerOrg,
            start,
            end,
            studentPartnerOrgIds: associatedPartners.associatedStudentPartnerOrgs,
            studentSchoolIds: associatedPartners.associatedPartnerSchools,
        }, (0, db_1.getRoClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0])))
            throw new Error(`no volunteer partner org found with key ${volunteerPartnerOrg}`);
        return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUniqueStudentsHelpedForAnalyticsReportSummary = getUniqueStudentsHelpedForAnalyticsReportSummary;
// TODO: break out anything that uses RO client into their own repo
/**
 * Get the next batch of volunteers for the analytics report.
 * Uses cursor pagination on user ID (ULID).
 */
async function getVolunteersForAnalyticsReport(volunteerPartnerOrg, start, end, associatedPartners, pageSize, cursor) {
    try {
        const result = await pgQueries.getVolunteersForAnalyticsReport.run({
            volunteerPartnerOrg,
            start,
            end,
            studentPartnerOrgIds: associatedPartners.associatedStudentPartnerOrgs,
            studentSchoolIds: associatedPartners.associatedPartnerSchools,
            pageSize,
            cursor,
        }, (0, db_1.getAnalyticsClient)());
        if (!result.length) {
            throw new ReportService_1.ReportNoDataFoundError('No volunteers found for partner org');
        }
        const volunteers = result.map(row => {
            const temp = (0, pgUtils_1.makeSomeOptional)(row, [
                'state',
                'dateOnboarded',
                'availabilityLastModifiedAt',
            ]);
            return {
                ...temp,
                // manually parse out incoming bigint to number
                totalPartnerTimeTutored: Number(temp.totalPartnerTimeTutored),
                totalPartnerTimeTutoredWithinRange: Number(temp.totalPartnerTimeTutoredWithinRange),
            };
        });
        return volunteers;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteersForAnalyticsReport = getVolunteersForAnalyticsReport;
