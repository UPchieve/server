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
exports.deleteSelfFavoritedVolunteersActions = exports.createAdminAction = exports.createAccountAction = exports.createSessionAction = exports.createQuizAction = exports.upsertIpAddress = exports.userHasTakenQuiz = exports.getSessionRequestedUserAgentFromSessionId = exports.getQuizzesPassedForDateRangeForTelecomReportByVolunteerId = exports.getQuizzesPassedForDateRangeById = void 0;
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
const constants_1 = require("../../constants");
const Subjects_1 = require("../Subjects");
async function getQuizzesPassedForDateRangeById(userId, start, end) {
    try {
        const result = await pgQueries.getQuizzesPassedForDateRangeByVolunteerId.run({ userId, start, end }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).total;
        return 0;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizzesPassedForDateRangeById = getQuizzesPassedForDateRangeById;
async function getQuizzesPassedForDateRangeForTelecomReportByVolunteerId(userId, start, end) {
    try {
        const result = await pgQueries.getQuizzesPassedForDateRangeForTelecomReportByVolunteerId.run({ userId, start, end }, (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeRequired)(row));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizzesPassedForDateRangeForTelecomReportByVolunteerId = getQuizzesPassedForDateRangeForTelecomReportByVolunteerId;
async function getSessionRequestedUserAgentFromSessionId(sessionId) {
    try {
        const result = await pgQueries.getSessionRequestedUserAgentFromSessionId.run({ sessionId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeSomeOptional)(result[0], [
                'browser',
                'browserVersion',
                'operatingSystemVersion',
                'operatingSystem',
            ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionRequestedUserAgentFromSessionId = getSessionRequestedUserAgentFromSessionId;
async function userHasTakenQuiz(userId) {
    try {
        const result = await pgQueries.userHasTakenQuiz.run({ userId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).exists;
        return false;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.userHasTakenQuiz = userHasTakenQuiz;
async function upsertIpAddress(ip, tc) {
    try {
        const result = await pgQueries.upsertIpAddress.run({ ip }, tc);
        if (!result.length)
            throw new Error('Error upserting IP address');
        return (0, pgUtils_1.makeRequired)(result[0]).id;
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.upsertIpAddress = upsertIpAddress;
async function createQuizAction(params) {
    const client = await (0, db_1.getClient)().connect();
    try {
        let ip = undefined;
        if (params.ipAddress)
            ip = await upsertIpAddress(params.ipAddress, client);
        const subjectType = await (0, Subjects_1.getSubjectType)(params.quizSubcategory);
        const result = await pgQueries.createQuizAction.run({
            action: params.action,
            actionType: constants_1.USER_ACTION_TYPES.QUIZ,
            ipAddressId: ip,
            quizCategory: subjectType ? subjectType.toUpperCase() : '',
            quizSubcategory: params.quizSubcategory.toUpperCase(),
            userId: params.userId,
        }, client);
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Error('insertion of quiz user action did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
    finally {
        client.release();
    }
}
exports.createQuizAction = createQuizAction;
async function createSessionAction(params) {
    const client = await (0, db_1.getClient)().connect();
    try {
        let ip = undefined;
        if (params.ipAddress)
            ip = await upsertIpAddress(params.ipAddress, client);
        const result = await pgQueries.createSessionAction.run({
            action: params.action,
            actionType: constants_1.USER_ACTION_TYPES.SESSION,
            browser: params.browser ? params.browser : null,
            browserVersion: params.browserVersion ? params.browserVersion : null,
            device: params.device ? params.device : null,
            ipAddressId: ip,
            operatingSystem: params.operatingSystem ? params.operatingSystem : null,
            operatingSystemVersion: params.operatingSystemVersion
                ? params.operatingSystemVersion
                : null,
            sessionId: params.sessionId,
            userId: params.userId,
        }, client);
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Error('insertion of session user action did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
    finally {
        client.release();
    }
}
exports.createSessionAction = createSessionAction;
async function createAccountAction(params, tc) {
    const client = tc !== null && tc !== void 0 ? tc : (await (0, db_1.getClient)().connect());
    try {
        let ipId = undefined;
        if (params.ipAddress)
            ipId = await upsertIpAddress(params.ipAddress, client);
        const result = await pgQueries.createAccountAction.run({
            action: params.action,
            actionType: constants_1.USER_ACTION_TYPES.ACCOUNT,
            ipAddressId: ipId,
            referenceEmail: params.referenceEmail
                ? params.referenceEmail.toLowerCase()
                : null,
            sessionId: params.sessionId ? params.sessionId : null,
            userId: params.userId,
            volunteerId: params.volunteerId ? params.volunteerId : null,
            banReason: params.banReason ? params.banReason : null,
        }, client);
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Error('insertion of account user action did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
    finally {
        // @ts-ignore
        if (!tc && client.release)
            client.release();
    }
}
exports.createAccountAction = createAccountAction;
async function createAdminAction(action, userId) {
    try {
        const result = await pgQueries.createAdminAction.run({
            action,
            actionType: constants_1.USER_ACTION_TYPES.ADMIN,
            userId: userId,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Error('insertion of admin user action did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createAdminAction = createAdminAction;
async function deleteSelfFavoritedVolunteersActions() {
    try {
        await pgQueries.deleteSelfFavoritedVolunteersActions.run(undefined, (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoDeleteError(err);
    }
}
exports.deleteSelfFavoritedVolunteersActions = deleteSelfFavoritedVolunteersActions;
