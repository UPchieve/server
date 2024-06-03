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
exports.getUserSessionStats = exports.getUserSessionsByUserId = exports.sessionHasBannedParticipant = exports.volunteerSentMessageAfterSessionEnded = exports.isEligibleForSessionRecap = exports.getSessionRecap = exports.getTotalSessionHistory = exports.getSessionHistory = exports.getSessionsForVolunteerHourSummary = exports.updateSessionPhotoKey = exports.updateSessionFailedJoinsById = exports.updateSessionReviewReasonsById = exports.getSessionsForAdminFilter = exports.getVolunteerForEmailFirstSession = exports.getStudentForEmailFirstSession = exports.getVolunteersForGentleWarning = exports.getSessionsVolunteerRating = exports.getSessionsWithAvgWaitTimePerDayAndHour = exports.addMessageToSessionById = exports.getSessionForChatbot = exports.updateSessionVolunteerById = exports.getLatestSessionByStudentId = exports.getCurrentSessionBySessionId = exports.getMessageInfoByMessageId = exports.getSessionHistoryIdsByUserId = exports.getRecapSessionForDmsBySessionId = exports.getCurrentSessionByUserId = exports.handleSessionParsingForUser = exports.createSession = exports.getSessionByIdWithStudentAndVolunteer = exports.getMessagesForFrontend = exports.getPublicSessionById = exports.getLongRunningSessions = exports.updateSessionToEnd = exports.updateSessionHasWhiteboardDoc = exports.updateSessionQuillDoc = exports.updateSessionTimeTutored = exports.updateSessionReported = exports.getActiveSessionsWithVolunteers = exports.getTotalTimeTutoredForDateRange = exports.getSessionsToReview = exports.getSessionToEndById = exports.updateSessionReviewedStatusById = exports.updateSessionFlagsById = exports.getSessionById = exports.getUnfulfilledSessions = exports.addSessionNotification = void 0;
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const constants_1 = require("../../constants");
const queries_1 = require("../Feedback/queries");
const type_utils_1 = require("../../utils/type-utils");
const Notification_1 = require("../Notification");
const Survey_1 = require("../Survey");
const config_1 = __importDefault(require("../../config"));
async function addSessionNotification(sessionId, notification) {
    try {
        const result = await pgQueries.addNotification.run({
            ...notification,
            sessionId,
            id: (0, pgUtils_1.getDbUlid)(),
        }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoCreateError('Insert notification did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.addSessionNotification = addSessionNotification;
// sessions that have not yet been fulfilled by a volunteer
async function getUnfulfilledSessions() {
    try {
        const result = await pgQueries.getUnfilledSessions.run({
            start: (0, moment_1.default)()
                .subtract(1, 'day')
                .toDate(),
        }, (0, db_1.getClient)());
        const sessions = result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['volunteer', 'paidTutorsPilotGroup']));
        const oneMinuteAgo = (0, moment_1.default)().subtract(1, 'minutes');
        const fileteredSessions = sessions.filter(session => {
            const isNewStudent = session.isFirstTimeStudent;
            const wasSessionCreatedAMinuteAgo = (0, moment_1.default)(oneMinuteAgo).isBefore(session.createdAt);
            // Don't show new students' sessions for a minute (they often cancel immediately)
            if (isNewStudent && wasSessionCreatedAMinuteAgo)
                return false;
            return true;
        });
        return fileteredSessions.map(v => ({
            ...v,
            _id: v.id,
            student: {
                firstname: v.studentFirstName,
                isTestUser: v.studentTestUser,
            },
        }));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUnfulfilledSessions = getUnfulfilledSessions;
async function getSessionById(sessionId) {
    try {
        const result = await pgQueries.getSessionById.run({ sessionId }, (0, db_1.getClient)());
        if (!result.length)
            throw new Errors_1.RepoReadError('Session not found');
        return (0, pgUtils_1.makeSomeOptional)(result[0], [
            'volunteerId',
            'quillDoc',
            'volunteerJoinedAt',
            'endedAt',
            'endedByRole',
            'studentBanned',
        ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionById = getSessionById;
async function updateSessionFlagsById(sessionId, flags) {
    const client = await (0, db_1.getClient)().connect();
    try {
        await client.query('BEGIN');
        const errors = [];
        for (const flag of flags) {
            const result = await pgQueries.insertSessionFlagById.run({ sessionId, flag }, client);
            if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
                errors.push(`Update query for flag ${flag} did not return ok`);
        }
        if (errors.length)
            throw new Errors_1.RepoReadError(errors.join('\n'));
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
exports.updateSessionFlagsById = updateSessionFlagsById;
async function updateSessionReviewedStatusById(sessionId, reviewed, toReview) {
    try {
        const result = await pgQueries.updateSessionReviewedStatusById.run({
            sessionId,
            reviewed,
            toReview,
        }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query was not acknowledged');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionReviewedStatusById = updateSessionReviewedStatusById;
async function getSessionToEndById(sessionId) {
    var _a, _b;
    try {
        const result = await pgQueries.getSessionToEndById.run({ sessionId }, (0, db_1.getClient)());
        if (!result.length)
            throw new Errors_1.RepoReadError('Session not found');
        const rawSession = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'volunteerJoinedAt',
            'endedAt',
            'volunteerEmail',
            'volunteerId',
            'volunteerFirstName',
            'volunteerNumPastSessions',
            'volunteerPartnerOrg',
        ]);
        let volunteerValue = undefined;
        if (rawSession.volunteerId &&
            rawSession.volunteerFirstName &&
            rawSession.volunteerEmail &&
            !!rawSession.volunteerNumPastSessions) {
            volunteerValue = {
                id: rawSession.volunteerId,
                firstName: rawSession.volunteerFirstName,
                email: (_a = rawSession.volunteerEmail) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
                numPastSessions: rawSession.volunteerNumPastSessions,
                volunteerPartnerOrg: rawSession.volunteerPartnerOrg,
            };
        }
        return {
            ...rawSession,
            student: {
                id: rawSession.studentId,
                firstName: rawSession.studentFirstName,
                email: (_b = rawSession.studentEmail) === null || _b === void 0 ? void 0 : _b.toLowerCase(),
                numPastSessions: rawSession.studentNumPastSessions,
            },
            volunteer: volunteerValue,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionToEndById = getSessionToEndById;
async function getSessionsToReview(limit, offset, filterBy = {}) {
    try {
        const result = await pgQueries.getSessionsToReview.run({ limit, offset, withStudentFirstName: filterBy.studentFirstName }, (0, db_1.getClient)());
        return Promise.all(result.map(async (v) => {
            const temp = (0, pgUtils_1.makeSomeOptional)(v, [
                'volunteer',
                'reviewReasons',
                'studentCounselingFeedback',
            ]);
            const studentRating = await (0, Survey_1.getSessionRating)(temp.id, constants_1.USER_ROLES.STUDENT);
            return {
                ...temp,
                studentRating,
                _id: temp.id,
            };
        }));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionsToReview = getSessionsToReview;
async function getTotalTimeTutoredForDateRange(volunteerId, start, end) {
    try {
        const result = await pgQueries.getTotalTimeTutoredForDateRange.run({ volunteerId, start, end }, (0, db_1.getClient)());
        if (!(result.length && result[0].total))
            return 0;
        // manually parse out incoming bigint to number
        return Number((0, pgUtils_1.makeRequired)(result[0]).total);
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
}
exports.getTotalTimeTutoredForDateRange = getTotalTimeTutoredForDateRange;
async function getActiveSessionsWithVolunteers() {
    try {
        const result = await pgQueries.getActiveSessionVolunteers.run(undefined, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v).volunteerId);
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
}
exports.getActiveSessionsWithVolunteers = getActiveSessionsWithVolunteers;
async function updateSessionReported(sessionId, reportReason, reportMessage) {
    try {
        const result = await pgQueries.updateSessionReported.run({ id: (0, pgUtils_1.getDbUlid)(), sessionId, reportReason, reportMessage }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionReported = updateSessionReported;
async function updateSessionTimeTutored(sessionId, timeTutored) {
    try {
        const result = await pgQueries.updateSessionTimeTutored.run({ sessionId, timeTutored }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionTimeTutored = updateSessionTimeTutored;
async function updateSessionQuillDoc(sessionId, quillDoc) {
    try {
        const result = await pgQueries.updateSessionQuillDoc.run({ sessionId, quillDoc }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionQuillDoc = updateSessionQuillDoc;
async function updateSessionHasWhiteboardDoc(sessionId, hasWhiteboardDoc) {
    try {
        const result = await pgQueries.updateSessionHasWhiteboardDoc.run({ sessionId, hasWhiteboardDoc }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionHasWhiteboardDoc = updateSessionHasWhiteboardDoc;
async function updateSessionToEnd(sessionId, endedAt, endedBy) {
    try {
        const result = await pgQueries.updateSessionToEnd.run({ sessionId, endedAt, endedBy }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionToEnd = updateSessionToEnd;
async function getLongRunningSessions(start, end) {
    try {
        const result = await pgQueries.getLongRunningSessions.run({ start, end }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v).id);
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
}
exports.getLongRunningSessions = getLongRunningSessions;
async function getPublicSessionById(sessionId) {
    try {
        const result = await pgQueries.getPublicSessionById.run({ sessionId }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const rawRow = (0, pgUtils_1.makeRequired)(result[0]);
        return {
            ...rawRow,
            _id: rawRow.id,
            student: {
                _id: rawRow.studentId,
                firstName: rawRow.studentFirstName,
            },
            volunteer: {
                _id: rawRow.volunteerId,
                firstName: rawRow.volunteerFirstName,
            },
        };
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
}
exports.getPublicSessionById = getPublicSessionById;
async function getMessagesForFrontend(sessionId, client) {
    try {
        const usableClient = client ? client : (0, db_1.getClient)();
        const result = await pgQueries.getSessionMessagesForFrontend.run({ sessionId }, usableClient);
        return result.map(v => (0, pgUtils_1.makeRequired)(v));
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
}
exports.getMessagesForFrontend = getMessagesForFrontend;
async function getSessionByIdWithStudentAndVolunteer(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const sessionResult = await pgQueries.getSessionForAdminView.run({ sessionId }, client);
        if (!sessionResult.length)
            throw new Error('Session not found');
        const session = (0, pgUtils_1.makeSomeOptional)(sessionResult[0], [
            'volunteerJoinedAt',
            'photos',
            'endedAt',
            'endedBy',
            'quillDoc',
            'reportMessage',
            'reportReason',
            'reviewReasons',
        ]);
        const userAgentResult = await pgQueries.getSessionUserAgent.run({ sessionId }, client);
        const userAgent = userAgentResult.length
            ? (0, pgUtils_1.makeSomeRequired)(userAgentResult[0], [])
            : undefined;
        const userResult = await pgQueries.getUserForSessionAdminView.run({ sessionId }, client);
        const users = userResult.map(v => (0, pgUtils_1.makeRequired)(v));
        const volunteer = users.find(v => !!v.isVolunteer);
        const student = users.find(v => !v.isVolunteer);
        if (!student)
            throw new Errors_1.RepoReadError(`Did not find student for session ${sessionId}`);
        const messages = await getMessagesForFrontend(sessionId, client);
        const feedbacks = await (0, queries_1.getFeedbackBySessionId)(sessionId); // need this to display legacy feedback from before context sharing
        const presessionSurvey = await (0, Survey_1.getPresessionSurveyResponse)(sessionId);
        const studentPostsessionSurvey = await (0, Survey_1.getPostsessionSurveyResponse)(sessionId, constants_1.USER_ROLES.STUDENT);
        const volunteerPostsessionSurvey = await (0, Survey_1.getPostsessionSurveyResponse)(sessionId, constants_1.USER_ROLES.VOLUNTEER);
        const notifications = await (0, Notification_1.getSessionNotificationsWithSessionId)(sessionId);
        return {
            ...session,
            student: { ...student, _id: student.id },
            volunteer: volunteer ? { ...volunteer, _id: volunteer.id } : undefined,
            messages,
            feedbacks,
            surveyResponses: {
                presessionSurvey,
                studentPostsessionSurvey,
                volunteerPostsessionSurvey,
            },
            _id: session.id,
            userAgent,
            notifications,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.getSessionByIdWithStudentAndVolunteer = getSessionByIdWithStudentAndVolunteer;
async function createSession(studentId, subject, studentBanned) {
    try {
        const result = await pgQueries.createSession.run({ id: (0, pgUtils_1.getDbUlid)(), studentId, subject, studentBanned }, (0, db_1.getClient)());
        return (0, pgUtils_1.makeRequired)(result[0]).id;
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createSession = createSession;
async function handleSessionParsingForUser(session, client) {
    try {
        const messages = await getMessagesForFrontend(session.id, client);
        const userResult = await pgQueries.getCurrentSessionUser.run({ sessionId: session.id }, client);
        const users = userResult.map(v => (0, pgUtils_1.makeRequired)(v));
        const student = users.find(v => !v.isVolunteer);
        if (!student)
            throw new Error('Session student not found');
        const volunteer = users.find(v => v.isVolunteer);
        return {
            ...session,
            student: { _id: session.studentId, ...student },
            volunteer: !!volunteer && session.volunteerId
                ? { _id: session.volunteerId, ...volunteer }
                : undefined,
            _id: session.id,
            messages,
        };
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
}
exports.handleSessionParsingForUser = handleSessionParsingForUser;
async function getCurrentSessionByUserId(userId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.getCurrentSessionByUserId.run({ userId }, client);
        if (!result.length)
            return;
        else {
            const session = (0, pgUtils_1.makeSomeOptional)(result[0], [
                'volunteerId',
                'endedAt',
                'volunteerJoinedAt',
            ]);
            return handleSessionParsingForUser(session, client);
        }
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
    finally {
        client.release();
    }
}
exports.getCurrentSessionByUserId = getCurrentSessionByUserId;
async function getRecapSessionForDmsBySessionId(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.getRecapSessionForDmsBySessionId.run({ sessionId }, client);
        if (!result.length)
            return;
        else {
            const session = (0, pgUtils_1.makeRequired)(result[0]);
            return handleSessionParsingForUser(session, client);
        }
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
    finally {
        client.release();
    }
}
exports.getRecapSessionForDmsBySessionId = getRecapSessionForDmsBySessionId;
async function getSessionHistoryIdsByUserId(userId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.getSessionHistoryIdsByUserId.run({ userId, minSessionLength: config_1.default.minSessionLength }, client);
        if (!result.length)
            return [];
        else
            return result.map(v => (0, pgUtils_1.makeRequired)(v));
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
    finally {
        client.release();
    }
}
exports.getSessionHistoryIdsByUserId = getSessionHistoryIdsByUserId;
async function getMessageInfoByMessageId(messageId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.getMessageInfoByMessageId.run({ messageId }, client);
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
    finally {
        client.release();
    }
}
exports.getMessageInfoByMessageId = getMessageInfoByMessageId;
async function getCurrentSessionBySessionId(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.getCurrentSessionBySessionId.run({ sessionId }, client);
        const session = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'volunteerJoinedAt',
            'volunteerId',
            'endedAt',
        ]);
        const messages = await getMessagesForFrontend(session.id, client);
        const userResult = await pgQueries.getCurrentSessionUser.run({ sessionId: session.id }, client);
        const users = userResult.map(v => (0, pgUtils_1.makeRequired)(v));
        const student = users.find(v => !v.isVolunteer);
        if (!student)
            throw new Error('Session student not found');
        const volunteer = users.find(v => v.isVolunteer);
        return {
            ...session,
            student: { _id: session.studentId, ...student },
            volunteer: !!volunteer && session.volunteerId
                ? { _id: session.volunteerId, ...volunteer }
                : undefined,
            _id: session.id,
            messages,
        };
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
    finally {
        client.release();
    }
}
exports.getCurrentSessionBySessionId = getCurrentSessionBySessionId;
async function getLatestSessionByStudentId(studentId) {
    try {
        const result = await pgQueries.getLatestSessionByStudentId.run({ studentId }, (0, db_1.getClient)());
        if (!result.length)
            return;
        return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (error) {
        throw error;
    }
}
exports.getLatestSessionByStudentId = getLatestSessionByStudentId;
async function updateSessionVolunteerById(sessionId, volunteerId) {
    try {
        const result = await pgQueries.updateSessionVolunteerById.run({ sessionId, volunteerId }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionVolunteerById = updateSessionVolunteerById;
async function getSessionForChatbot(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.getSessionForChatbot.run({ sessionId }, client);
        const session = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'endedAt',
            'volunteerJoinedAt',
        ]);
        const messages = await getMessagesForFrontend(sessionId, client);
        return {
            ...session,
            messages,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.getSessionForChatbot = getSessionForChatbot;
async function addMessageToSessionById(sessionId, senderId, contents) {
    try {
        const result = await pgQueries.insertNewMessage.run({ id: (0, pgUtils_1.getDbUlid)(), sessionId, senderId, contents }, (0, db_1.getClient)());
        if (!result.length)
            throw new Errors_1.RepoCreateError('Insert did not return ok');
        return (0, pgUtils_1.makeRequired)(result[0]).id;
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.addMessageToSessionById = addMessageToSessionById;
async function getSessionsWithAvgWaitTimePerDayAndHour(start, end) {
    try {
        const result = await pgQueries.getSessionsWithAvgWaitTimePerDayAndHour.run({ start, end }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionsWithAvgWaitTimePerDayAndHour = getSessionsWithAvgWaitTimePerDayAndHour;
async function getSessionsVolunteerRating(volunteerId) {
    try {
        const result = await pgQueries.getSessionsForReferCoworker.run({ volunteerId }, (0, db_1.getClient)());
        return Promise.all(result.map(async (row) => {
            const session = (0, pgUtils_1.makeSomeOptional)(row, ['volunteerFeedback']);
            const sessionVolunteerRating = {
                id: session.id,
            };
            if (session.volunteerFeedback) {
                const rating = await (0, Survey_1.getSessionRating)(session.id, constants_1.USER_ROLES.VOLUNTEER);
                sessionVolunteerRating.sessionRating = rating;
            }
            return sessionVolunteerRating;
        }));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionsVolunteerRating = getSessionsVolunteerRating;
async function getVolunteersForGentleWarning(sessionId) {
    try {
        const result = await pgQueries.getVolunteersForGentleWarning.run({
            sessionId: (0, type_utils_1.isPgId)(sessionId) ? sessionId : undefined,
            mongoSessionId: (0, type_utils_1.isPgId)(sessionId) ? undefined : sessionId,
        }, (0, db_1.getClient)());
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
exports.getVolunteersForGentleWarning = getVolunteersForGentleWarning;
async function getStudentForEmailFirstSession(sessionId) {
    try {
        const result = await pgQueries.getStudentForEmailFirstSession.run({
            sessionId: (0, type_utils_1.isPgId)(sessionId) ? sessionId : undefined,
            mongoSessionId: (0, type_utils_1.isPgId)(sessionId) ? undefined : sessionId,
        }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const ret = (0, pgUtils_1.makeRequired)(result[0]);
        ret.email = ret.email.toLowerCase();
        return ret;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentForEmailFirstSession = getStudentForEmailFirstSession;
async function getVolunteerForEmailFirstSession(sessionId) {
    try {
        const result = await pgQueries.getVolunteerForEmailFirstSession.run({
            sessionId: (0, type_utils_1.isPgId)(sessionId) ? sessionId : undefined,
            mongoSessionId: (0, type_utils_1.isPgId)(sessionId) ? undefined : sessionId,
        }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const ret = (0, pgUtils_1.makeRequired)(result[0]);
        ret.email = ret.email.toLowerCase();
        return ret;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerForEmailFirstSession = getVolunteerForEmailFirstSession;
async function getSessionsForAdminFilter(start, end, limit, offset, options) {
    try {
        const sessionResult = await pgQueries.getSessionsForAdminFilter.run({ start, end, limit, offset, ...options }, (0, db_1.getClient)());
        const sessions = sessionResult.map(v => (0, pgUtils_1.makeSomeOptional)(v, [
            'volunteerEmail',
            'volunteerFirstName',
            'volunteerIsBanned',
            'volunteerTestUser',
            'volunteerTotalPastSessions',
            'reviewReasons',
        ]));
        const sessionsInfo = sessions.map(async (session) => {
            const studentRating = await (0, Survey_1.getSessionRating)(session.id, constants_1.USER_ROLES.STUDENT);
            const volunteerRating = await (0, Survey_1.getSessionRating)(session.id, constants_1.USER_ROLES.VOLUNTEER);
            let volunteer = undefined;
            if (session.volunteerFirstName &&
                session.volunteerEmail &&
                !!session.volunteerIsBanned &&
                !!session.volunteerTestUser &&
                !!session.volunteerTotalPastSessions) {
                volunteer = {
                    firstname: session.volunteerFirstName,
                    isBanned: session.volunteerIsBanned,
                    isTestUser: session.volunteerTestUser,
                    totalPastSessions: session.volunteerTotalPastSessions,
                };
                session.volunteerEmail = session.volunteerEmail.toLowerCase();
            }
            const student = {
                firstname: session.studentFirstName,
                isBanned: session.studentIsBanned,
                isTestUser: session.studentTestUser,
                totalPastSessions: session.studentTotalPastSessions,
            };
            return {
                ...session,
                studentRating,
                volunteerRating,
                student,
                volunteer,
                reviewReasons: session.reviewReasons || [],
                _id: session.id,
            };
        });
        return Promise.all(sessionsInfo);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionsForAdminFilter = getSessionsForAdminFilter;
async function updateSessionReviewReasonsById(sessionId, reviewReasons, 
// Use this property to override the reviewed status of a session
reviewed) {
    const client = await (0, db_1.getClient)().connect();
    try {
        await client.query('BEGIN');
        for (const flag of reviewReasons) {
            const result = await pgQueries.insertSessionReviewReason.run({ sessionId, flag }, client);
            if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
                throw new Error('Insert did not return ok');
        }
        const result = await pgQueries.updateSessionToReview.run({ sessionId, reviewed }, client);
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Error('Updating to_review did not return ok');
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoCreateError(err);
    }
    finally {
        client.release();
    }
}
exports.updateSessionReviewReasonsById = updateSessionReviewReasonsById;
async function updateSessionFailedJoinsById(sessionId, userId) {
    try {
        const result = await pgQueries.insertSessionFailedJoin.run({ sessionId, userId }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionFailedJoinsById = updateSessionFailedJoinsById;
async function updateSessionPhotoKey(sessionId, photoKey) {
    try {
        const result = await pgQueries.insertSessionPhotoKey.run({ sessionId, photoKey }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateSessionPhotoKey = updateSessionPhotoKey;
async function getSessionsForVolunteerHourSummary(volunteerId, start, end) {
    try {
        const result = await pgQueries.getSessionsForVolunteerHourSummary.run({ volunteerId, start, end }, (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeRequired)(row));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionsForVolunteerHourSummary = getSessionsForVolunteerHourSummary;
async function getSessionHistory(userId, limit, offset) {
    try {
        const result = await pgQueries.getSessionHistory.run({
            userId,
            minSessionLength: config_1.default.minSessionLength,
            limit,
            offset,
        }, (0, db_1.getClient)());
        if (result.length)
            return result.map(v => (0, pgUtils_1.makeRequired)(v));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionHistory = getSessionHistory;
async function getTotalSessionHistory(userId) {
    try {
        const result = await pgQueries.getTotalSessionHistory.run({ userId, minSessionLength: config_1.default.minSessionLength }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).total;
        return 0;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getTotalSessionHistory = getTotalSessionHistory;
async function getSessionRecap(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const sessionResult = await pgQueries.getSessionRecap.run({ sessionId }, client);
        if (!sessionResult.length)
            throw new Errors_1.RepoReadError('Session not found');
        const session = (0, pgUtils_1.makeSomeOptional)(sessionResult[0], ['quillDoc']);
        const messages = await getMessagesForFrontend(sessionId, client);
        return { ...session, messages };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.getSessionRecap = getSessionRecap;
async function isEligibleForSessionRecap(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.isEligibleForSessionRecap.run({ sessionId, minSessionLength: config_1.default.minSessionLength }, client);
        if (!result.length)
            return false;
        else
            return (0, pgUtils_1.makeRequired)(result[0]).isEligible;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.isEligibleForSessionRecap = isEligibleForSessionRecap;
async function volunteerSentMessageAfterSessionEnded(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.volunteerSentMessageAfterSessionEnded.run({ sessionId }, client);
        return !!result.length;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.volunteerSentMessageAfterSessionEnded = volunteerSentMessageAfterSessionEnded;
async function sessionHasBannedParticipant(sessionId) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const result = await pgQueries.sessionHasBannedParticipant.run({ sessionId }, client);
        return !!result.length;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.sessionHasBannedParticipant = sessionHasBannedParticipant;
async function getUserSessionsByUserId(userId, filter = {
    start: undefined,
    end: undefined,
    subject: '',
    topic: undefined,
    sessionId: undefined,
}) {
    try {
        const result = await pgQueries.getUserSessionsByUserId.run({
            userId,
            start: filter.start,
            end: filter.end,
            subject: filter.subject,
            topic: filter.topic,
            sessionId: filter.sessionId,
        }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['volunteerId', 'quillDoc']));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserSessionsByUserId = getUserSessionsByUserId;
async function getUserSessionStats(userId) {
    try {
        const result = await pgQueries.getUserSessionStats.run({
            userId,
            minSessionLength: config_1.default.minSessionLength,
        }, (0, db_1.getClient)());
        const userSessionStats = {};
        for (const subject of result.map(v => (0, pgUtils_1.makeRequired)(v))) {
            const { subjectName, topicName, totalRequested, totalHelped } = subject;
            userSessionStats[subjectName] = {
                totalRequested,
                totalHelped,
                topicName,
            };
        }
        return userSessionStats;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserSessionStats = getUserSessionStats;
