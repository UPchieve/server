"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserRole = exports.asUserRole = exports.saveUserSurvey = exports.getContextSharingForVolunteer = exports.asSaveUserSurveyAndSubmissions = exports.asSurveySubmissions = void 0;
const Session_1 = require("../models/Session");
const Survey_1 = require("../models/Survey");
const User_1 = require("../models/User");
const type_utils_1 = require("../utils/type-utils");
const constants_1 = require("../constants");
const EventsService_1 = require("./EventsService");
exports.asSurveySubmissions = (0, type_utils_1.asFactory)({
    questionId: type_utils_1.asNumber,
    responseChoiceId: type_utils_1.asNumber,
    openResponse: type_utils_1.asString,
});
exports.asSaveUserSurveyAndSubmissions = (0, type_utils_1.asFactory)({
    surveyId: type_utils_1.asNumber,
    sessionId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    progressReportId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    surveyTypeId: type_utils_1.asNumber,
    submissions: (0, type_utils_1.asArray)(exports.asSurveySubmissions),
});
async function getContextSharingForVolunteer(sessionId) {
    const responses = await (0, Survey_1.getPresessionSurveyResponse)(sessionId);
    const session = await (0, Session_1.getSessionById)(sessionId);
    const totalStudentSessions = await (0, User_1.getTotalSessionsByUserId)(session.studentId);
    return {
        totalStudentSessions,
        responses,
    };
}
exports.getContextSharingForVolunteer = getContextSharingForVolunteer;
async function saveUserSurvey(userId, data) {
    const survey = (0, exports.asSaveUserSurveyAndSubmissions)(data);
    const userSurvey = {
        surveyId: survey.surveyId,
        sessionId: survey.sessionId,
        surveyTypeId: survey.surveyTypeId,
        progressReportId: survey.progressReportId,
    };
    // filter out questions the user didn't answer
    const submissions = survey.submissions.filter(resp => resp.responseChoiceId !== null);
    await (0, Survey_1.saveUserSurveyAndSubmissions)(userId, userSurvey, submissions);
    if (userSurvey.sessionId)
        EventsService_1.emitter.emit(constants_1.FEEDBACK_EVENTS.FEEDBACK_SAVED, userSurvey.sessionId);
}
exports.saveUserSurvey = saveUserSurvey;
exports.asUserRole = (0, type_utils_1.asEnum)(constants_1.USER_ROLES);
function parseUserRole(param) {
    const cleanedInput = (0, exports.asUserRole)(param);
    return cleanedInput;
}
exports.parseUserRole = parseUserRole;
