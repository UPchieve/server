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
exports.isRecapDmsAvailable = exports.isEligibleForSessionRecap = exports.getSessionRecap = exports.getTotalSessionHistory = exports.getSessionHistory = exports.handleMessageActivity = exports.volunteersAvailableForSession = exports.getWaitTimeHeatMap = exports.generateAndStoreWaitTimeHeatMap = exports.generateWaitTimeHeatMap = exports.saveMessage = exports.joinSession = exports.getSessionNotifications = exports.publicSession = exports.sessionTimedOut = exports.studentLatestSession = exports.getRecapSessionForDms = exports.currentSession = exports.checkSession = exports.startSession = exports.adminSessionView = exports.adminFilteredSessions = exports.getImageAndUploadUrl = exports.getSessionPhotoUploadUrl = exports.getStaleSessions = exports.processEmailVolunteer = exports.processSessionEditors = exports.storeAndDeleteWhiteboardDoc = exports.storeAndDeleteQuillDoc = exports.addDocEditorVersionTo = exports.processFirstSessionCongratsEmail = exports.processCalculateMetrics = exports.processSessionReported = exports.processAssistmentsSession = exports.endSession = exports.reportSession = exports.handleDmReporting = exports.getTimeTutoredForDateRange = exports.sessionsToReview = exports.reviewSession = void 0;
const case_1 = __importDefault(require("case"));
const crypto_1 = __importDefault(require("crypto"));
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const cache = __importStar(require("../cache"));
const config_1 = __importDefault(require("../config"));
const constants_1 = require("../constants");
const events_1 = require("../constants/events");
const logger_1 = __importDefault(require("../logger"));
const AssistmentsDataRepo = __importStar(require("../models/AssistmentsData"));
const Errors_1 = require("../models/Errors");
const Feedback_1 = require("../models/Feedback");
const NotificationRepo = __importStar(require("../models/Notification"));
const PushToken_1 = require("../models/PushToken");
const Session_1 = require("../models/Session");
const SessionRepo = __importStar(require("../models/Session"));
const UserRepo = __importStar(require("../models/User"));
const UserAction_1 = require("../models/UserAction");
const VolunteerRepo = __importStar(require("../models/Volunteer"));
const sessionUtils = __importStar(require("../utils/session-utils"));
const type_utils_1 = require("../utils/type-utils");
const jobs_1 = require("../worker/jobs");
const AnalyticsService = __importStar(require("./AnalyticsService"));
const AnalyticsService_1 = require("./AnalyticsService");
const AwsService = __importStar(require("./AwsService"));
const EventsService_1 = require("./EventsService");
const PushTokenService = __importStar(require("./PushTokenService"));
const QueueService_1 = __importDefault(require("./QueueService"));
const QuillDocService = __importStar(require("./QuillDocService"));
const TwilioService = __importStar(require("./TwilioService"));
const TwilioService_1 = require("./TwilioService");
const WhiteboardService = __importStar(require("./WhiteboardService"));
const parse_user_agent_1 = require("../utils/parse-user-agent");
const Subjects_1 = require("../models/Subjects");
const FeatureFlagService_1 = require("./FeatureFlagService");
const Student_1 = require("../models/Student");
const Y = __importStar(require("yjs"));
const PaidTutorsPilotService = __importStar(require("./PaidTutorsPilotService"));
async function reviewSession(data) {
    const { sessionId, reviewed, toReview } = sessionUtils.asReviewSessionData(data);
    return SessionRepo.updateSessionReviewedStatusById(sessionId, reviewed, toReview);
}
exports.reviewSession = reviewSession;
// TODO: Use cursor pagination.
async function sessionsToReview(data, filterBy) {
    const page = (0, type_utils_1.asString)(data);
    const pageNum = parseInt(page) || 1;
    const PER_PAGE = 15;
    const skip = (pageNum - 1) * PER_PAGE;
    const sessions = await SessionRepo.getSessionsToReview(PER_PAGE, skip, filterBy);
    const isLastPage = sessions.length < PER_PAGE;
    return { sessions, isLastPage };
}
exports.sessionsToReview = sessionsToReview;
async function getTimeTutoredForDateRange(volunteerId, fromDate, toDate) {
    return await SessionRepo.getTotalTimeTutoredForDateRange(volunteerId, fromDate, toDate);
}
exports.getTimeTutoredForDateRange = getTimeTutoredForDateRange;
async function handleDmReporting(sessionId, sessionFlags) {
    await (0, Session_1.updateSessionFlagsById)(sessionId, sessionFlags);
    await (0, Session_1.updateSessionReviewReasonsById)(sessionId, sessionFlags, false);
}
exports.handleDmReporting = handleDmReporting;
async function reportSession(user, data) {
    const { sessionId, reportReason, reportMessage, source, } = sessionUtils.asReportSessionData(data);
    const session = await SessionRepo.getSessionById(sessionId);
    // Only matched sessions can be reported
    if (!session.volunteerId)
        throw new sessionUtils.ReportSessionError('Unable to report this session');
    const reportedBy = user;
    await SessionRepo.updateSessionReported(sessionId, reportReason, reportMessage);
    // Autoban users if a session is reported from the recap page
    const isBanReason = reportReason === constants_1.SESSION_REPORT_REASON.STUDENT_RUDE || source === 'recap';
    const reportedUser = reportedBy.isVolunteer
        ? session.studentId
        : session.volunteerId;
    if (isBanReason) {
        await UserRepo.banUserById(reportedUser, constants_1.USER_BAN_REASONS.SESSION_REPORTED);
        await (0, UserAction_1.createAccountAction)({
            userId: reportedUser,
            action: constants_1.ACCOUNT_USER_ACTIONS.BANNED,
            sessionId: session.id,
            banReason: reportReason,
        });
        AnalyticsService.captureEvent(reportedUser, constants_1.EVENTS.ACCOUNT_BANNED, {
            event: constants_1.EVENTS.ACCOUNT_BANNED,
            sessionId: session.id,
            banReason: constants_1.USER_BAN_REASONS.SESSION_REPORTED,
        });
        if (source === 'recap') {
            const sessionFlags = reportedBy.isVolunteer
                ? [constants_1.USER_SESSION_METRICS.coachReportedStudentDm]
                : [constants_1.USER_SESSION_METRICS.studentReportedCoachDm];
            handleDmReporting(sessionId, sessionFlags);
        }
    }
    EventsService_1.emitter.emit(events_1.SESSION_EVENTS.SESSION_REPORTED, session.id);
    // Queue up job to send reporting alert emails
    const emailData = {
        userId: reportedUser,
        reportedBy: user.email,
        reportReason,
        reportMessage,
        isBanReason,
        sessionId,
    };
    if (session.endedAt)
        await QueueService_1.default.add(jobs_1.Jobs.EmailSessionReported, emailData, {
            removeOnComplete: true,
            removeOnFail: true,
        });
    else
        await cache.saveWithExpiration(`${sessionId}-reported`, JSON.stringify(emailData));
}
exports.reportSession = reportSession;
async function isSessionAssistments(sessionId) {
    const ad = await AssistmentsDataRepo.getAssistmentsDataBySession(sessionId);
    if (ad)
        return !lodash_1.default.isEmpty(ad);
    else
        return false;
}
async function endSession(sessionId, endedBy = null, isAdmin = false, socketService, identifiers) {
    var _a;
    const reqIdentifiers = identifiers
        ? sessionUtils.asRequestIdentifiers(identifiers)
        : undefined;
    const session = await SessionRepo.getSessionToEndById(sessionId);
    if (session.endedAt)
        throw new sessionUtils.EndSessionError('Session has already ended');
    if (!isAdmin &&
        !sessionUtils.isSessionParticipant(session.student.id, (_a = session.volunteer) === null || _a === void 0 ? void 0 : _a.id, endedBy ? endedBy : null))
        throw new sessionUtils.EndSessionError('Only session participants can end a session');
    await SessionRepo.updateSessionToEnd(session.id, new Date(), 
    // NOTE: endedBy is sometimes null when the session is ended by a worker job
    //        due to the session being unmatched for an extended period of time
    endedBy);
    EventsService_1.emitter.emit(events_1.SESSION_EVENTS.SESSION_ENDED, session.id);
    if (socketService)
        await socketService.emitSessionChange(sessionId);
    if (endedBy && reqIdentifiers)
        await (0, UserAction_1.createSessionAction)({
            userId: endedBy,
            sessionId: sessionId,
            ...(0, parse_user_agent_1.getUserAgentInfo)(reqIdentifiers === null || reqIdentifiers === void 0 ? void 0 : reqIdentifiers.userAgent),
            ipAddress: reqIdentifiers.ip,
            action: constants_1.SESSION_USER_ACTIONS.ENDED,
        });
}
exports.endSession = endSession;
// registered as listener
async function processAssistmentsSession(sessionId) {
    const session = await SessionRepo.getSessionById(sessionId);
    if ((session === null || session === void 0 ? void 0 : session.volunteerId) && (await isSessionAssistments(sessionId))) {
        logger_1.default.info(`Ending an assistments session: ${sessionId}`);
        await QueueService_1.default.add(jobs_1.Jobs.SendAssistmentsData, { sessionId }, { removeOnComplete: true, removeOnFail: true });
    }
}
exports.processAssistmentsSession = processAssistmentsSession;
async function processSessionReported(sessionId) {
    try {
        await QueueService_1.default.add(jobs_1.Jobs.EmailSessionReported, JSON.parse(await cache.get(`${sessionId}-reported`)), { removeOnComplete: true, removeOnFail: true });
        await cache.remove(`${sessionId}-reported`);
    }
    catch (err) {
        // we don't care if the key is not found
        if (!(err instanceof cache.KeyNotFoundError))
            throw err;
    }
}
exports.processSessionReported = processSessionReported;
async function processCalculateMetrics(sessionId) {
    const session = await SessionRepo.getSessionById(sessionId);
    let timeTutored = 0;
    if (!(session.flags.includes(constants_1.USER_SESSION_METRICS.absentStudent) ||
        session.flags.includes(constants_1.USER_SESSION_METRICS.absentVolunteer)))
        timeTutored = await sessionUtils.calculateTimeTutored(session);
    await SessionRepo.updateSessionTimeTutored(sessionId, timeTutored);
    EventsService_1.emitter.emit(events_1.SESSION_EVENTS.SESSION_METRICS_CALCULATED, sessionId);
}
exports.processCalculateMetrics = processCalculateMetrics;
async function processFirstSessionCongratsEmail(sessionId) {
    var _a;
    const session = await SessionRepo.getSessionByIdWithStudentAndVolunteer(sessionId);
    const fifteenMinutes = 1000 * 60 * 15;
    const isLongSession = session.timeTutored
        ? session.timeTutored >= fifteenMinutes
        : false;
    const sendStudentFirstSessionCongrats = session.student.pastSessions.length === 1 && isLongSession;
    const sendVolunteerFirstSessionCongrats = ((_a = session.volunteer) === null || _a === void 0 ? void 0 : _a.pastSessions.length) === 1 && isLongSession;
    // send at 11 am EST tomorrow
    const hourToSendTomorrowInMS = (0, moment_1.default)()
        .utc()
        .startOf('day')
        .add(1, 'day')
        .add(15, 'hour')
        .toDate()
        .getTime();
    const nowInMS = new Date().getTime();
    const delay = hourToSendTomorrowInMS - nowInMS;
    if (sendStudentFirstSessionCongrats)
        await QueueService_1.default.add(jobs_1.Jobs.EmailStudentFirstSessionCongrats, {
            sessionId: session._id,
        }, { delay, removeOnComplete: true, removeOnFail: true });
    if (sendVolunteerFirstSessionCongrats) {
        await QueueService_1.default.add(jobs_1.Jobs.EmailVolunteerFirstSessionCongrats, {
            sessionId: session._id,
        }, { delay, removeOnComplete: true, removeOnFail: true });
    }
}
exports.processFirstSessionCongratsEmail = processFirstSessionCongratsEmail;
async function getDocEditorVersion(sessionId) {
    return await Number(await cache.get(`${sessionId}-doc-editor-version`));
}
async function setDocEditorVersion(sessionId, value) {
    return await cache.saveWithExpiration(`${sessionId}-doc-editor-version`, value);
}
async function addDocEditorVersionTo(session) {
    if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType)) {
        session.docEditorVersion = await getDocEditorVersion(session.id);
    }
}
exports.addDocEditorVersionTo = addDocEditorVersionTo;
async function storeQuillDocV2(sessionId) {
    const quillStateV2 = await QuillDocService.getDocumentUpdates(sessionId);
    const ydoc = new Y.Doc();
    const text = ydoc.getText('quill');
    for (const update of quillStateV2) {
        Y.applyUpdate(ydoc, Uint8Array.from(update.split(',').map(Number)));
    }
    await SessionRepo.updateSessionQuillDoc(sessionId, 
    // Ensure viewing the document in a recap works by matching existing sessions.quill_doc format
    JSON.stringify({ ops: text.toDelta() }));
}
async function storeAndDeleteQuillDoc(sessionId) {
    const quillStateV2 = await QuillDocService.getDocumentUpdates(sessionId);
    const quillState = await QuillDocService.getQuillDocV1(sessionId);
    if (quillStateV2.length) {
        await storeQuillDocV2(sessionId);
    }
    else if (quillState === null || quillState === void 0 ? void 0 : quillState.doc) {
        await SessionRepo.updateSessionQuillDoc(sessionId, JSON.stringify(quillState.doc));
    }
    await QuillDocService.deleteDoc(sessionId);
}
exports.storeAndDeleteQuillDoc = storeAndDeleteQuillDoc;
async function storeAndDeleteWhiteboardDoc(sessionId) {
    const whiteboardDoc = await WhiteboardService.getDoc(sessionId);
    const hasWhiteboardDoc = await WhiteboardService.uploadedToStorage(sessionId, whiteboardDoc);
    await SessionRepo.updateSessionHasWhiteboardDoc(sessionId, hasWhiteboardDoc);
    await WhiteboardService.deleteDoc(sessionId);
}
exports.storeAndDeleteWhiteboardDoc = storeAndDeleteWhiteboardDoc;
async function processSessionEditors(sessionId) {
    const session = await SessionRepo.getSessionById(sessionId);
    if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType))
        await storeAndDeleteQuillDoc(sessionId);
    else
        await storeAndDeleteWhiteboardDoc(sessionId);
}
exports.processSessionEditors = processSessionEditors;
async function processEmailVolunteer(sessionId) {
    var _a;
    const session = await SessionRepo.getSessionToEndById(sessionId);
    if (((_a = session.volunteer) === null || _a === void 0 ? void 0 : _a.numPastSessions) === 10)
        await QueueService_1.default.add(jobs_1.Jobs.EmailVolunteerTenSessionMilestone, {
            volunteerId: session.volunteer.id,
        }, { removeOnComplete: true, removeOnFail: true });
}
exports.processEmailVolunteer = processEmailVolunteer;
/**
 * The worker runs this function every 2 hours at minute 0
 *
 * Get open sessions that were started longer ago than staleThreshold (ms)
 * but no later than the staleThreshold - cron job schedule time
 *
 * Defaults to 12 hours old
 */
async function getStaleSessions(staleThreshold = 43200000) {
    const cutoffDate = Date.now() - staleThreshold;
    const cronJobScheduleTime = 1000 * 60 * 60 * 2; // 2 hours
    const lastCheckedCreatedAtTime = new Date(cutoffDate - cronJobScheduleTime);
    return SessionRepo.getLongRunningSessions(lastCheckedCreatedAtTime, new Date(cutoffDate));
}
exports.getStaleSessions = getStaleSessions;
async function getSessionPhotoUploadUrl(sessionId) {
    const sessionPhotoS3Key = `${sessionId}${crypto_1.default
        .randomBytes(8)
        .toString('hex')}`;
    await SessionRepo.updateSessionPhotoKey(sessionId, sessionPhotoS3Key);
    return sessionPhotoS3Key;
}
exports.getSessionPhotoUploadUrl = getSessionPhotoUploadUrl;
async function getImageAndUploadUrl(data) {
    const sessionId = (0, type_utils_1.asString)(data);
    const sessionPhotoS3Key = await getSessionPhotoUploadUrl(sessionId);
    const uploadUrl = await AwsService.getSessionPhotoUploadUrl(sessionPhotoS3Key);
    const bucketName = config_1.default.awsS3.sessionPhotoBucket;
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${sessionPhotoS3Key}`;
    return { uploadUrl, imageUrl };
}
exports.getImageAndUploadUrl = getImageAndUploadUrl;
async function adminFilteredSessions(data) {
    const { showBannedUsers, showTestUsers, minSessionLength, sessionActivityFrom, sessionActivityTo, minMessagesSent, studentRating, volunteerRating, firstTimeStudent, firstTimeVolunteer, isReported, page, } = sessionUtils.asAdminFilteredSessionsData(data);
    const PER_PAGE = 15;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * PER_PAGE;
    const oneDayInMS = 1000 * 60 * 60 * 24;
    const estTimeOffset = 1000 * 60 * 60 * 4;
    // Add a day to the sessionActivityTo to make it inclusive for the activity range: [sessionActivityFrom, sessionActivityTo]
    const inclusiveSessionActivityTo = new Date(new Date(sessionActivityTo).getTime() + oneDayInMS + estTimeOffset);
    const offsetSessionActivityFrom = new Date(new Date(sessionActivityFrom).getTime() + estTimeOffset);
    const sessions = await SessionRepo.getSessionsForAdminFilter(offsetSessionActivityFrom, inclusiveSessionActivityTo, PER_PAGE, skip, {
        firstTimeStudent: !!firstTimeStudent,
        firstTimeVolunteer: !!firstTimeVolunteer,
        showTestUsers: !!showTestUsers,
        showBannedUsers: !!showBannedUsers,
        reported: !!isReported,
        messageCount: minMessagesSent ? Number(minMessagesSent) : undefined,
        sessionLength: minSessionLength ? Number(minSessionLength) : undefined,
        volunteerRating: volunteerRating ? Number(volunteerRating) : undefined,
        studentRating: studentRating ? Number(studentRating) : undefined,
    });
    const isLastPage = sessions.length < PER_PAGE;
    return { sessions, isLastPage };
}
exports.adminFilteredSessions = adminFilteredSessions;
async function adminSessionView(data) {
    const sessionId = (0, type_utils_1.asString)(data);
    const session = await SessionRepo.getSessionByIdWithStudentAndVolunteer(sessionId);
    if (sessionUtils.isSubjectUsingDocumentEditor(session.toolType) &&
        !session.endedAt) {
        const quillDoc = await QuillDocService.getDoc(sessionId);
        session.quillDoc = JSON.stringify(quillDoc);
    }
    const sessionUserAgent = await (0, UserAction_1.getSessionRequestedUserAgentFromSessionId)(sessionId);
    const feedback = await (0, Feedback_1.getFeedbackBySessionId)(sessionId);
    const bucket = 'sessionPhotoBucket';
    const sessionPhotos = await AwsService.getObjects(bucket, session.photos || []);
    return {
        ...session,
        userAgent: sessionUserAgent,
        feedbacks: feedback,
        photos: sessionPhotos,
    };
}
exports.adminSessionView = adminSessionView;
async function startSession(user, data) {
    const { ip, sessionSubTopic, sessionType, problemId, assignmentId, studentId, userAgent, docEditorVersion, } = sessionUtils.asStartSessionData(data);
    const subject = case_1.default.camel(sessionSubTopic);
    const topic = case_1.default.camel(sessionType);
    const subjectAndTopic = await (0, Subjects_1.getSubjectAndTopic)(subject, topic);
    if (!subjectAndTopic)
        throw new sessionUtils.StartSessionError(`Unable to start new session for the topic ${topic} and subject ${subject}`);
    const userId = user.id;
    if (user.isVolunteer)
        throw new sessionUtils.StartSessionError('Volunteers cannot create new sessions');
    if (user.banned)
        throw new sessionUtils.StartSessionError('Banned students cannot request a new session');
    const currentSession = await SessionRepo.getCurrentSessionByUserId(userId);
    if (currentSession)
        throw new sessionUtils.StartSessionError('Student already has an active session');
    await PaidTutorsPilotService.bucketUser(userId, topic);
    const newSessionId = await SessionRepo.createSession(userId, 
    // NOTE: sessionType and subtopic are kebab-case
    subject, user.banned);
    if (sessionUtils.isSubjectUsingDocumentEditor(subjectAndTopic.toolType)) {
        // Save doc editor version before `beginRegularNotifications` to avoid a client calling `currentSession`
        // and looking for this value before it's set
        await setDocEditorVersion(newSessionId, `${docEditorVersion !== null && docEditorVersion !== void 0 ? docEditorVersion : 1}`);
    }
    const numProblemId = Number(problemId);
    if (numProblemId && assignmentId && studentId)
        try {
            await AssistmentsDataRepo.createAssistmentsDataBySessionId(numProblemId, assignmentId, studentId, newSessionId);
        }
        catch (error) {
            logger_1.default.error(`Unable to create ASSISTments data for session: ${newSessionId}, ASSISTments studentId: ${studentId}, assignmentId: ${assignmentId}, problemId: ${problemId}, error: ${error.message}`);
        }
    if (!user.banned) {
        await (0, TwilioService_1.beginRegularNotifications)(newSessionId);
    }
    // Auto end the session after 45 minutes if the session is unmatched
    const delay = 1000 * 60 * 45;
    await QueueService_1.default.add(jobs_1.Jobs.EndUnmatchedSession, { sessionId: newSessionId }, { delay, removeOnComplete: true, removeOnFail: true });
    // Begin chat bot messages immediately.
    if ((0, FeatureFlagService_1.isChatBotEnabled)())
        await QueueService_1.default.add(jobs_1.Jobs.Chatbot, { sessionId: newSessionId }, { removeOnComplete: true, removeOnFail: true });
    await (0, UserAction_1.createSessionAction)({
        userId: user.id,
        sessionId: newSessionId,
        ...(0, parse_user_agent_1.getUserAgentInfo)(userAgent),
        ipAddress: ip,
        action: constants_1.SESSION_USER_ACTIONS.REQUESTED,
    });
    return newSessionId;
}
exports.startSession = startSession;
async function checkSession(data) {
    const sessionId = (0, type_utils_1.asString)(data);
    const session = await SessionRepo.getSessionById(sessionId);
    return session.id;
}
exports.checkSession = checkSession;
async function currentSession(userId) {
    const session = await SessionRepo.getCurrentSessionByUserId(userId);
    if (session) {
        await addDocEditorVersionTo(session);
    }
    return session;
}
exports.currentSession = currentSession;
async function getRecapSessionForDms(userId) {
    return await SessionRepo.getRecapSessionForDmsBySessionId(userId);
}
exports.getRecapSessionForDms = getRecapSessionForDms;
async function studentLatestSession(data) {
    const userId = (0, type_utils_1.asString)(data);
    return await SessionRepo.getLatestSessionByStudentId(userId);
}
exports.studentLatestSession = studentLatestSession;
async function sessionTimedOut(user, data) {
    const { sessionId, timeout, ip, userAgent, } = sessionUtils.asSessionTimedOutData(data);
    await (0, UserAction_1.createSessionAction)({
        userId: user.id,
        sessionId: sessionId,
        ...(0, parse_user_agent_1.getUserAgentInfo)(userAgent),
        ipAddress: ip,
        action: timeout === 15
            ? constants_1.SESSION_USER_ACTIONS.TIMED_OUT_15_MINS
            : constants_1.SESSION_USER_ACTIONS.TIMED_OUT_45_MINS,
    });
}
exports.sessionTimedOut = sessionTimedOut;
async function publicSession(data) {
    const sessionId = (0, type_utils_1.asString)(data);
    return SessionRepo.getPublicSessionById(sessionId);
}
exports.publicSession = publicSession;
async function getSessionNotifications(data) {
    const sessionId = (0, type_utils_1.asString)(data);
    return NotificationRepo.getSessionNotificationsWithSessionId(sessionId);
}
exports.getSessionNotifications = getSessionNotifications;
async function joinSession(user, session, data) {
    var _a, _b;
    const { socket, joinedFrom } = sessionUtils.asJoinSessionData(data);
    const userAgent = (_a = socket.request) === null || _a === void 0 ? void 0 : _a.headers['user-agent'];
    const ipAddress = (_b = socket.handshake) === null || _b === void 0 ? void 0 : _b.address;
    if (session.endedAt) {
        await SessionRepo.updateSessionFailedJoinsById(session.id, user.id);
        throw new Error('Session has ended');
    }
    if (!user.isVolunteer && session.studentId && session.studentId !== user.id) {
        await SessionRepo.updateSessionFailedJoinsById(session.id, user.id);
        throw new Error(`A student cannot join another student's session`);
    }
    if (user.isVolunteer &&
        session.volunteerId &&
        session.volunteerId !== user.id) {
        SessionRepo.updateSessionFailedJoinsById(session.id, user.id);
        throw new Error('A volunteer has already joined the session');
    }
    const isInitialVolunteerJoin = user.isVolunteer && !session.volunteerId;
    if (isInitialVolunteerJoin) {
        await SessionRepo.updateSessionVolunteerById(session.id, user.id);
        await (0, UserAction_1.createSessionAction)({
            userId: user.id,
            sessionId: session.id,
            ...(0, parse_user_agent_1.getUserAgentInfo)(userAgent ? userAgent : ''),
            ipAddress,
            action: constants_1.SESSION_USER_ACTIONS.JOINED,
        });
        (0, AnalyticsService_1.captureEvent)(user.id, constants_1.EVENTS.SESSION_JOINED, {
            event: constants_1.EVENTS.SESSION_JOINED,
            sessionId: session.id,
            joinedFrom: joinedFrom || '',
        });
        (0, AnalyticsService_1.captureEvent)(session.studentId, constants_1.EVENTS.SESSION_MATCHED, {
            event: constants_1.EVENTS.SESSION_MATCHED,
            sessionId: session.id,
        });
        const pushTokens = await (0, PushToken_1.getPushTokensByUserId)(session.studentId);
        if (pushTokens && pushTokens.length > 0) {
            const tokens = pushTokens.map((token) => token.token);
            await PushTokenService.sendVolunteerJoined(session, tokens);
        }
    }
    // After 30 seconds of the this.createdAt, we can assume the user is
    // rejoining the session instead of joining for the first time
    const thirtySecondsElapsed = 1000 * 30;
    if (!isInitialVolunteerJoin &&
        session.createdAt.getTime() + thirtySecondsElapsed < Date.now()) {
        await (0, UserAction_1.createSessionAction)({
            userId: user.id,
            sessionId: session.id,
            ...(0, parse_user_agent_1.getUserAgentInfo)(userAgent ? userAgent : ''),
            ipAddress,
            action: constants_1.SESSION_USER_ACTIONS.REJOINED,
        });
        (0, AnalyticsService_1.captureEvent)(user.id, constants_1.EVENTS.SESSION_REJOINED, {
            event: constants_1.EVENTS.SESSION_REJOINED,
            sessionId: session.id,
        });
    }
}
exports.joinSession = joinSession;
// TODO: we don't know the shape of the user coming from a socket. user is provided from the client at the moment
async function saveMessage(user, createdAt, data, chatbot) {
    const { sessionId, message } = sessionUtils.asSaveMessageData(data);
    const session = await SessionRepo.getSessionById(sessionId);
    if (!sessionUtils.isSessionParticipant(session.studentId, session.volunteerId, (0, type_utils_1.asString)(user._id), chatbot || null))
        throw new Error('Only session participants are allowed to send messages');
    return await SessionRepo.addMessageToSessionById(sessionId, user._id, message);
}
exports.saveMessage = saveMessage;
async function generateWaitTimeHeatMap(startDate, endDate) {
    const heatMap = sessionUtils.createEmptyHeatMap();
    const map = await SessionRepo.getSessionsWithAvgWaitTimePerDayAndHour(startDate, endDate);
    for (const entry of map) {
        const day = (0, moment_1.default)()
            .weekday(entry.day)
            .format('dddd');
        const hour = constants_1.UTC_TO_HOUR_MAPPING[entry.hour];
        heatMap[day][hour] = entry.averageWaitTime;
    }
    return heatMap;
}
exports.generateWaitTimeHeatMap = generateWaitTimeHeatMap;
async function generateAndStoreWaitTimeHeatMap(startDate, endDate) {
    const heatMap = await generateWaitTimeHeatMap(startDate, endDate);
    await cache.save(config_1.default.cacheKeys.waitTimeHeatMapAllSubjects, JSON.stringify(heatMap));
    return heatMap;
}
exports.generateAndStoreWaitTimeHeatMap = generateAndStoreWaitTimeHeatMap;
async function getWaitTimeHeatMap(user) {
    if (!user.isVolunteer)
        throw new Errors_1.NotAllowedError('Only volunteers may view the heat map');
    try {
        const heatMap = await cache.get(config_1.default.cacheKeys.waitTimeHeatMapAllSubjects);
        return JSON.parse(heatMap);
    }
    catch (err) {
        if (err instanceof cache.KeyNotFoundError) {
            const lastMonday = (0, moment_1.default)()
                .utc()
                .startOf('isoWeek')
                .subtract(1, 'week')
                .toDate();
            const lastSunday = (0, moment_1.default)()
                .utc()
                .endOf('isoWeek')
                .subtract(1, 'week')
                .toDate();
            const heatMap = await generateAndStoreWaitTimeHeatMap(lastMonday, lastSunday);
            return heatMap;
        }
        throw err;
    }
}
exports.getWaitTimeHeatMap = getWaitTimeHeatMap;
async function volunteersAvailableForSession(sessionId, subject) {
    const [activeVolunteers, notifiedForSession, notifiedLastFifteenMins,] = await Promise.all([
        TwilioService.getActiveSessionVolunteers(),
        VolunteerRepo.getVolunteersNotifiedBySessionId(sessionId),
        VolunteerRepo.getVolunteersNotifiedSinceDate(TwilioService.relativeDate(15 * 60 * 1000)),
    ]);
    const excludedVolunteers = [
        ...activeVolunteers,
        ...notifiedForSession,
        ...notifiedLastFifteenMins,
    ];
    const volunteers = await VolunteerRepo.getVolunteersOnDeck(subject, excludedVolunteers);
    return volunteers.length > 0;
}
exports.volunteersAvailableForSession = volunteersAvailableForSession;
async function handleMessageActivity(sessionId) {
    try {
        const state = await cache.get(`${constants_1.SESSION_ACTIVITY_KEY}-${sessionId}`);
        if (Boolean(state)) {
            await QueueService_1.default.add(jobs_1.Jobs.Chatbot, { sessionId }, { removeOnComplete: true, removeOnFail: true });
            await cache.remove(`${constants_1.SESSION_ACTIVITY_KEY}-${sessionId}`);
        }
    }
    catch (err) {
        // TODO: cancel chatbot jobs here
        logger_1.default.error(`Could not process message acitvity state, cancelling chatbot ${err}`);
    }
}
exports.handleMessageActivity = handleMessageActivity;
// TODO: implement these with cursor pagination
async function getSessionHistory(userId, page) {
    const pageNum = parseInt(page);
    const PER_PAGE = 5;
    const skip = (pageNum - 1) * PER_PAGE;
    const pastSessions = await SessionRepo.getSessionHistory(userId, PER_PAGE, skip);
    const isLastPage = pastSessions.length < PER_PAGE;
    return { pastSessions, page: pageNum, isLastPage };
}
exports.getSessionHistory = getSessionHistory;
async function getTotalSessionHistory(userId) {
    return SessionRepo.getTotalSessionHistory(userId);
}
exports.getTotalSessionHistory = getTotalSessionHistory;
async function getSessionRecap(sessionId, userId) {
    const session = await SessionRepo.getSessionRecap(sessionId);
    if (!sessionUtils.isSessionParticipant(session.studentId, session.volunteerId, userId))
        throw new Errors_1.NotAllowedError('Only session participants are allowed to view this session');
    return session;
}
exports.getSessionRecap = getSessionRecap;
async function isEligibleForSessionRecap(sessionId, studentId) {
    const isAllowDmsToPartnerStudentsActive = await (0, FeatureFlagService_1.getAllowDmsToPartnerStudentsFeatureFlag)(studentId);
    if (!isAllowDmsToPartnerStudentsActive) {
        const student = await (0, Student_1.getStudentPartnerInfoById)(studentId);
        if (student === null || student === void 0 ? void 0 : student.studentPartnerOrg)
            return false;
    }
    return await SessionRepo.isEligibleForSessionRecap(sessionId);
}
exports.isEligibleForSessionRecap = isEligibleForSessionRecap;
/**
 *
 * - Banned users should not be able to send DMs in the recap page
 * - Coaches cannot send DMs to partner students unless the flag allow-dms-to-partner-students is on
 * - Coaches can send DMs once session ended and they have the session-recap-dms flag as `true`.
 * - Students are not able to initiate the conversation. A coach must send the first message.
 *   We determine this by looking to see if a coach had sent a message after the
 *   session ended.
 *
 */
async function isRecapDmsAvailable(sessionId, studentId, volunteerId, isVolunteer) {
    const hasBannedParticipant = await SessionRepo.sessionHasBannedParticipant(sessionId);
    if (hasBannedParticipant)
        return false;
    const isAllowDmsToPartnerStudentsActive = await (0, FeatureFlagService_1.getAllowDmsToPartnerStudentsFeatureFlag)(studentId);
    if (!isAllowDmsToPartnerStudentsActive) {
        const student = await (0, Student_1.getStudentPartnerInfoById)(studentId);
        if (student === null || student === void 0 ? void 0 : student.studentPartnerOrg)
            return false;
    }
    const flag = await (0, FeatureFlagService_1.getSessionRecapDmsFeatureFlag)(volunteerId);
    if (!flag)
        return false;
    const sentMessages = await SessionRepo.volunteerSentMessageAfterSessionEnded(sessionId);
    return sentMessages || isVolunteer;
}
exports.isRecapDmsAvailable = isRecapDmsAvailable;
