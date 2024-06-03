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
exports.getProgressReportSurveyResponse = exports.deleteDuplicateUserSurveys = exports.getSessionRating = exports.getPostsessionSurveyResponsesForSessionMetrics = exports.getPostsessionSurveyResponse = exports.getPresessionSurveyResponse = exports.formatSurveyDefinition = exports.getPostsessionSurveyDefinition = exports.getSimpleSurveyDefinition = exports.getStudentsPresessionGoal = exports.getPresessionSurveyForFeedback = exports.saveUserSurveyAndSubmissions = exports.savePresessionSurvey = exports.parseQueryResult = void 0;
const db_1 = require("../../db");
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
const fix_number_int_1 = require("../../utils/fix-number-int");
const constants_1 = require("../../constants");
const lodash_1 = __importDefault(require("lodash"));
// parse a query result containing `responseData` from JSON to an object
function parseQueryResult(result) {
    const responseData = typeof result.responseData === 'string'
        ? JSON.parse(result.responseData)
        : result.responseData;
    return { ...result, responseData: (0, fix_number_int_1.fixNumberInt)(responseData) };
}
exports.parseQueryResult = parseQueryResult;
async function savePresessionSurvey(userId, sessionId, responseData) {
    try {
        const result = await pgQueries.savePresessionSurvey.run({
            id: (0, pgUtils_1.getDbUlid)(),
            userId,
            sessionId,
            responseData: JSON.stringify(responseData),
        }, (0, db_1.getClient)());
        if (result.length) {
            const survey = (0, pgUtils_1.makeRequired)(result[0]);
            return parseQueryResult(survey);
        }
        throw new Errors_1.RepoCreateError('Error upserting presession survey');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.savePresessionSurvey = savePresessionSurvey;
async function saveUserSurveyAndSubmissions(userId, surveyData, submissions) {
    var _a, _b;
    const client = await (0, db_1.getClient)().connect();
    try {
        await client.query('BEGIN');
        const result = await pgQueries.saveUserSurvey.run({
            surveyId: surveyData.surveyId,
            userId,
            sessionId: (_a = surveyData.sessionId) !== null && _a !== void 0 ? _a : undefined,
            progressReportId: (_b = surveyData.progressReportId) !== null && _b !== void 0 ? _b : undefined,
            surveyTypeId: surveyData.surveyTypeId,
        }, (0, db_1.getClient)());
        if (!result.length) {
            throw new Errors_1.RepoCreateError('Error upserting user survey');
        }
        const survey = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'sessionId',
            'progressReportId',
        ]);
        const errors = [];
        for (const submission of submissions) {
            const result = await pgQueries.saveUserSurveySubmissions.run({
                userSurveyId: survey.id,
                questionId: submission.questionId,
                responseChoiceId: submission.responseChoiceId,
                openResponse: submission.openResponse
                    ? submission.openResponse
                    : undefined,
            }, client);
            if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
                errors.push(`Insert query for user survey submission ${JSON.stringify(submission)} did not return ok`);
        }
        if (errors.length)
            throw new Errors_1.RepoReadError(errors.join('\n'));
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
exports.saveUserSurveyAndSubmissions = saveUserSurveyAndSubmissions;
// @todo: clean up old presession survey code
// NOTE: this query can be replaced by a JOIN that happens when we fetch
// the session on the feedback page
async function getPresessionSurveyForFeedback(userId, sessionId) {
    try {
        const result = await pgQueries.getPresessionSurveyForFeedback.run({
            userId,
            sessionId,
        }, (0, db_1.getClient)());
        if (result.length) {
            const survey = (0, pgUtils_1.makeRequired)(result[0]);
            return parseQueryResult(survey);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPresessionSurveyForFeedback = getPresessionSurveyForFeedback;
async function getStudentsPresessionGoal(sessionId) {
    try {
        const result = await pgQueries.getStudentsPresessionGoal.run({
            sessionId,
        }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).goal;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentsPresessionGoal = getStudentsPresessionGoal;
async function getSimpleSurveyDefinition(surveyType, subjectName) {
    try {
        const result = await pgQueries.getSimpleSurveyDefinition.run({ subjectName, surveyType }, (0, db_1.getClient)());
        const resultArr = result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['responseDisplayImage']));
        return formatSurveyDefinition(resultArr);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSimpleSurveyDefinition = getSimpleSurveyDefinition;
async function getPostsessionSurveyDefinition(surveyType, sessionId, userRole) {
    try {
        const replacementColumns = await pgQueries.getPostsessionSurveyReplacementColumns.run({ surveyType, sessionId, userRole }, (0, db_1.getClient)());
        const replacementColumnsArr = replacementColumns.map(c => (0, pgUtils_1.makeSomeRequired)(c, ['id']));
        const surveyDefinitionExceptReplacementColumns = await pgQueries.getPostsessionSurveyDefinitionWithoutReplacementColumns.run({ surveyType, sessionId, userRole }, (0, db_1.getClient)());
        const resultArr = surveyDefinitionExceptReplacementColumns.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['responseDisplayImage']));
        return formatSurveyDefinition(resultArr, replacementColumnsArr);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPostsessionSurveyDefinition = getPostsessionSurveyDefinition;
function formatSurveyDefinition(resultArr, replacementColumns) {
    const rowsByQuestion = lodash_1.default.groupBy(resultArr, v => v.questionId);
    const survey = [];
    for (const [question, rows] of Object.entries(rowsByQuestion)) {
        const responses = [];
        const temp = rows[0];
        let questionText = temp.questionText;
        if (replacementColumns) {
            const associatedReplacementColumns = replacementColumns.filter((col) => question == col.id)[0];
            if (associatedReplacementColumns &&
                associatedReplacementColumns.replacementText1) {
                questionText = questionText.replace(/%s/, associatedReplacementColumns.replacementText1);
                if (associatedReplacementColumns.replacementText2) {
                    questionText = questionText.replace(/%s/, associatedReplacementColumns.replacementText2);
                }
            }
        }
        const questionData = {
            questionId: question,
            questionText: questionText,
            displayPriority: temp.displayPriority,
            questionType: temp.questionType,
        };
        const sortedRows = rows.sort((a, b) => a.responseDisplayPriority - b.responseDisplayPriority);
        for (const row of sortedRows) {
            const responseItem = {
                responseId: row.responseId,
                responseText: row.responseText,
                responseDisplayPriority: row.responseDisplayPriority,
                responseDisplayImage: row.responseDisplayImage,
            };
            responses.push(responseItem);
        }
        survey.push({
            ...questionData,
            responses: responses,
        });
    }
    return {
        surveyId: resultArr[0].surveyId,
        surveyTypeId: resultArr[0].surveyTypeId,
        survey,
    };
}
exports.formatSurveyDefinition = formatSurveyDefinition;
async function getPresessionSurveyResponse(sessionId) {
    try {
        const result = await pgQueries.getPresessionSurveyResponse.run({ sessionId }, (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeSomeOptional)(row, ['displayImage']));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPresessionSurveyResponse = getPresessionSurveyResponse;
async function getPostsessionSurveyResponse(sessionId, userRole) {
    try {
        if (userRole === constants_1.USER_ROLES.STUDENT) {
            const result = await pgQueries.getStudentPostsessionSurveyResponse.run({ sessionId }, (0, db_1.getClient)());
            if (result.length)
                return result.map(row => (0, pgUtils_1.makeSomeOptional)(row, ['response']));
            return [];
        }
        else {
            const result = await pgQueries.getVolunteerPostsessionSurveyResponse.run({ sessionId }, (0, db_1.getClient)());
            if (result.length)
                return result.map(row => (0, pgUtils_1.makeSomeOptional)(row, ['response']));
            return [];
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPostsessionSurveyResponse = getPostsessionSurveyResponse;
async function getPostsessionSurveyResponsesForSessionMetrics(sessionId) {
    try {
        const studentResponses = await getPostsessionSurveyResponse(sessionId, constants_1.USER_ROLES.STUDENT);
        const volunteerResponses = await getPostsessionSurveyResponse(sessionId, constants_1.USER_ROLES.VOLUNTEER);
        return studentResponses.concat(volunteerResponses);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPostsessionSurveyResponsesForSessionMetrics = getPostsessionSurveyResponsesForSessionMetrics;
async function getSessionRating(sessionId, userRole) {
    if (userRole === constants_1.USER_ROLES.STUDENT) {
        const ratings = await pgQueries.getStudentSessionRating.run({ sessionId }, (0, db_1.getRoClient)());
        const result = ratings.map(rate => rate.score);
        return result.length ? result[0] : undefined;
    }
    const ratings = await pgQueries.getVolunteerSessionRating.run({ sessionId }, (0, db_1.getRoClient)());
    const result = ratings.map(rate => rate.score);
    return result.length ? result[0] : undefined;
}
exports.getSessionRating = getSessionRating;
async function deleteDuplicateUserSurveys() {
    try {
        await pgQueries.deleteDuplicateUserSurveys.run(undefined, (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoDeleteError(err);
    }
}
exports.deleteDuplicateUserSurveys = deleteDuplicateUserSurveys;
async function getProgressReportSurveyResponse(userId, progressReportId) {
    try {
        const result = await pgQueries.getProgressReportSurveyResponse.run({ userId, progressReportId }, (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeSomeOptional)(row, ['displayImage']));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getProgressReportSurveyResponse = getProgressReportSurveyResponse;
