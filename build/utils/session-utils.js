"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asSaveMessageData = exports.asJoinSessionData = exports.asAdminFilteredSessionsData = exports.asSessionTimedOutData = exports.asReportSessionData = exports.asReviewSessionData = exports.asSessionsToReviewData = exports.asStartSessionData = exports.asRequestIdentifiers = exports.createEmptyHeatMap = exports.isSubjectUsingDocumentEditor = exports.isSessionFulfilled = exports.calculateTimeTutored = exports.isSessionParticipant = exports.getMessagesAfterDate = exports.didParticipantsChat = exports.ReportSessionError = exports.EndSessionError = exports.StartSessionError = void 0;
const ts_custom_error_1 = require("ts-custom-error");
const constants_1 = require("../constants");
const constants_2 = require("../constants");
const Session_1 = require("../models/Session");
const type_utils_1 = require("./type-utils");
class StartSessionError extends ts_custom_error_1.CustomError {
}
exports.StartSessionError = StartSessionError;
class EndSessionError extends ts_custom_error_1.CustomError {
}
exports.EndSessionError = EndSessionError;
class ReportSessionError extends ts_custom_error_1.CustomError {
}
exports.ReportSessionError = ReportSessionError;
function didParticipantsChat(messages, studentId, volunteerId) {
    let studentSentMessage = false;
    let volunteerSentMessage = false;
    for (const message of messages) {
        const messagerId = message.user;
        if (studentId === messagerId)
            studentSentMessage = true;
        if (volunteerId === messagerId)
            volunteerSentMessage = true;
        if (studentSentMessage && volunteerSentMessage)
            break;
    }
    return studentSentMessage && volunteerSentMessage;
}
exports.didParticipantsChat = didParticipantsChat;
function getMessagesAfterDate(messages, date) {
    if (!date)
        return [];
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.createdAt >= date)
            return messages.slice(i);
    }
    return [];
}
exports.getMessagesAfterDate = getMessagesAfterDate;
function isSessionParticipant(studentId, volunteerId, userId, chatbotId) {
    if (!userId)
        return false;
    return (userId === studentId ||
        (userId === volunteerId && !!volunteerId) ||
        userId === (chatbotId ? chatbotId : ''));
}
exports.isSessionParticipant = isSessionParticipant;
async function calculateTimeTutored(session) {
    const threeHoursMs = 1000 * 60 * 60 * 3;
    const fifteenMinsMs = 1000 * 60 * 15;
    const { volunteerJoinedAt, endedAt, volunteerId } = session;
    const messages = await (0, Session_1.getMessagesForFrontend)(session.id);
    if (!volunteerId || !volunteerJoinedAt || !endedAt)
        return 0;
    // skip if no messages are sent
    if (messages.length === 0)
        return 0;
    const volunteerJoinDate = new Date(volunteerJoinedAt);
    const sessionEndDate = new Date(endedAt);
    let sessionLengthMs = sessionEndDate.getTime() - volunteerJoinDate.getTime();
    // skip if volunteer joined after the session ended
    if (sessionLengthMs < 0)
        return 0;
    let latestMessageIndex = messages.length - 1;
    let wasMessageSentAfterSessionEnded = messages[latestMessageIndex].createdAt > sessionEndDate;
    // TODO: refactor - Don't allow users to send a message once the sessions ends
    // get the latest message that was sent within a 15 minute window of the message prior.
    // Sometimes sessions are not ended by either participant and one of the participants may send
    // a message to see if the other participant is still active before ending the session.
    // Exclude these messages when getting the total session end time
    if (sessionLengthMs > threeHoursMs || wasMessageSentAfterSessionEnded) {
        while (latestMessageIndex > 0 &&
            (wasMessageSentAfterSessionEnded ||
                messages[latestMessageIndex].createdAt.getTime() -
                    messages[latestMessageIndex - 1].createdAt.getTime() >
                    fifteenMinsMs)) {
            latestMessageIndex--;
            wasMessageSentAfterSessionEnded =
                messages[latestMessageIndex].createdAt > sessionEndDate;
        }
    }
    const latestMessageDate = new Date(messages[latestMessageIndex].createdAt);
    // skip if the latest message was sent before a volunteer joined
    // or skip if the only messages that were sent were after a session has ended
    if (latestMessageDate <= volunteerJoinDate || wasMessageSentAfterSessionEnded)
        return 0;
    sessionLengthMs = latestMessageDate.getTime() - volunteerJoinDate.getTime();
    return sessionLengthMs;
}
exports.calculateTimeTutored = calculateTimeTutored;
function isSessionFulfilled(session) {
    const hasEnded = !!session.endedAt;
    const hasVolunteerJoined = !!session.volunteerId;
    return hasEnded || hasVolunteerJoined;
}
exports.isSessionFulfilled = isSessionFulfilled;
function isSubjectUsingDocumentEditor(toolType) {
    return toolType === constants_1.TOOL_TYPES.DOCUMENT_EDITOR;
}
exports.isSubjectUsingDocumentEditor = isSubjectUsingDocumentEditor;
function createEmptyHeatMap() {
    const heatMap = {};
    for (const day in constants_2.DAYS) {
        const currentDay = {};
        for (const hour in constants_2.HOURS) {
            currentDay[constants_2.HOURS[hour]] = 0;
        }
        heatMap[constants_2.DAYS[day]] = currentDay;
    }
    return heatMap;
}
exports.createEmptyHeatMap = createEmptyHeatMap;
const requestIdentifierValidators = {
    ip: type_utils_1.asString,
    userAgent: type_utils_1.asString,
};
exports.asRequestIdentifiers = (0, type_utils_1.asFactory)(requestIdentifierValidators);
exports.asStartSessionData = (0, type_utils_1.asFactory)({
    ...requestIdentifierValidators,
    sessionSubTopic: type_utils_1.asString,
    sessionType: type_utils_1.asString,
    problemId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    assignmentId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    studentId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    docEditorVersion: (0, type_utils_1.asOptional)(type_utils_1.asNumber),
});
exports.asSessionsToReviewData = (0, type_utils_1.asFactory)({
    users: type_utils_1.asString,
    page: type_utils_1.asString,
});
exports.asReviewSessionData = (0, type_utils_1.asFactory)({
    sessionId: type_utils_1.asString,
    reviewed: type_utils_1.asBoolean,
    toReview: type_utils_1.asBoolean,
});
exports.asReportSessionData = (0, type_utils_1.asFactory)({
    sessionId: type_utils_1.asString,
    reportReason: type_utils_1.asString,
    reportMessage: type_utils_1.asString,
    source: (0, type_utils_1.asOptional)(type_utils_1.asString),
});
exports.asSessionTimedOutData = (0, type_utils_1.asFactory)({
    ...requestIdentifierValidators,
    sessionId: type_utils_1.asString,
    timeout: type_utils_1.asNumber,
});
exports.asAdminFilteredSessionsData = (0, type_utils_1.asFactory)({
    showBannedUsers: type_utils_1.asString,
    showTestUsers: type_utils_1.asString,
    minSessionLength: type_utils_1.asString,
    sessionActivityFrom: type_utils_1.asString,
    sessionActivityTo: type_utils_1.asString,
    minMessagesSent: type_utils_1.asString,
    studentRating: type_utils_1.asString,
    volunteerRating: type_utils_1.asString,
    firstTimeStudent: type_utils_1.asString,
    firstTimeVolunteer: type_utils_1.asString,
    isReported: type_utils_1.asString,
    page: type_utils_1.asString,
});
exports.asJoinSessionData = (0, type_utils_1.asFactory)({
    socket: (0, type_utils_1.asFactory)({
        id: type_utils_1.asString,
        connected: type_utils_1.asBoolean,
        disconnected: type_utils_1.asBoolean,
    }),
    joinedFrom: (0, type_utils_1.asOptional)(type_utils_1.asString),
});
exports.asSaveMessageData = (0, type_utils_1.asFactory)({
    sessionId: type_utils_1.asString,
    message: type_utils_1.asString,
});
