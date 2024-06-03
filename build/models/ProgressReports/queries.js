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
exports.getUnreadProgressReportOverviewSubjectsByUserId = exports.updateProgressReportsReadAtByReportIds = exports.getLatestProgressReportIdBySubject = exports.getAllProgressReportIdsByUserIdAndSubject = exports.getProgressReportSessionsForSubjectByPagination = exports.getProgressReportConceptsByReportId = exports.getProgressReportSummariesForMany = exports.getProgressReportByReportId = exports.getProgressReportInfoBySessionId = exports.updateProgressReportStatus = exports.insertProgressReportConceptDetail = exports.insertProgressReportConcept = exports.insertProgressReportSummaryDetail = exports.insertProgressReportSummary = exports.insertProgressReportSession = exports.insertProgressReport = void 0;
const Errors_1 = require("../Errors");
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
async function insertProgressReport(userId, status, tc) {
    try {
        const result = await pgQueries.insertProgressReport.run({
            id: (0, pgUtils_1.getDbUlid)(),
            userId,
            status,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).id;
        throw new Errors_1.RepoCreateError(`insertProgressReport: Insert query did not return new row for user ${userId}`);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.insertProgressReport = insertProgressReport;
async function insertProgressReportSession(reportId, sessionId, analysisType, tc) {
    try {
        const result = await pgQueries.insertProgressReportSession.run({
            reportId,
            sessionId,
            analysisType,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoCreateError(`insertProgressReportSession: Insert query did not return new row for report ${reportId}`);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.insertProgressReportSession = insertProgressReportSession;
async function insertProgressReportSummary(reportId, data, tc) {
    try {
        const result = await pgQueries.insertProgressReportSummary.run({
            id: (0, pgUtils_1.getDbUlid)(),
            reportId,
            summary: data.summary,
            overallGrade: data.overallGrade,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).id;
        throw new Errors_1.RepoCreateError(`insertProgressReportSummary: Insert query did not return new row for report ${reportId}`);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.insertProgressReportSummary = insertProgressReportSummary;
async function insertProgressReportSummaryDetail(reportSummaryId, data, tc) {
    try {
        const result = await pgQueries.insertProgressReportSummaryDetail.run({
            id: (0, pgUtils_1.getDbUlid)(),
            content: data.content,
            reportSummaryId,
            focusArea: data.focusArea,
            infoType: data.infoType,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).id;
        throw new Errors_1.RepoCreateError(`insertProgressReportSummaryDetail: Insert query did not return new row for report summary ${reportSummaryId}`);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.insertProgressReportSummaryDetail = insertProgressReportSummaryDetail;
async function insertProgressReportConcept(reportId, data, tc) {
    try {
        const result = await pgQueries.insertProgressReportConcept.run({
            id: (0, pgUtils_1.getDbUlid)(),
            name: data.name,
            description: data.description,
            grade: data.grade,
            reportId,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).id;
        throw new Errors_1.RepoCreateError(`insertProgressReportConcept: Insert query did not return new row for report ${reportId}`);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.insertProgressReportConcept = insertProgressReportConcept;
async function insertProgressReportConceptDetail(reportConceptId, data, tc) {
    try {
        const result = await pgQueries.insertProgressReportConceptDetail.run({
            id: (0, pgUtils_1.getDbUlid)(),
            content: data.content,
            reportConceptId,
            focusArea: data.focusArea,
            infoType: data.infoType,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).id;
        throw new Errors_1.RepoCreateError(`insertProgressReportConceptDetail: Insert query did not return new row for progress report concept ${reportConceptId}`);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.insertProgressReportConceptDetail = insertProgressReportConceptDetail;
async function updateProgressReportStatus(reportId, status, tc) {
    try {
        const result = await pgQueries.updateProgressReportStatus.run({
            reportId,
            status,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError(`updateProgressReportStatus: Update query did not return ok for ${reportId} to status ${status}`);
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateProgressReportStatus = updateProgressReportStatus;
async function getProgressReportInfoBySessionId(userId, sessionId, analysisType, tc) {
    try {
        const result = await pgQueries.getProgressReportInfoBySessionId.run({
            userId,
            sessionId,
            analysisType,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length) {
            const data = (0, pgUtils_1.makeSomeOptional)(result[0], ['readAt']);
            return {
                ...data,
                status: data.status,
            };
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getProgressReportInfoBySessionId = getProgressReportInfoBySessionId;
async function getProgressReportByReportId(reportId, tc) {
    try {
        const result = await pgQueries.getProgressReportByReportId.run({
            reportId,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length) {
            const data = (0, pgUtils_1.makeSomeOptional)(result[0], ['readAt']);
            return {
                ...data,
                status: data.status,
            };
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getProgressReportByReportId = getProgressReportByReportId;
async function getProgressReportSummariesForMany(reportIds, tc) {
    try {
        const result = await pgQueries.getProgressReportSummariesForMany.run({
            reportIds,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['reportReadAt']));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getProgressReportSummariesForMany = getProgressReportSummariesForMany;
async function getProgressReportConceptsByReportId(reportId, tc) {
    try {
        const result = await pgQueries.getProgressReportConceptsByReportId.run({
            reportId,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return result.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['reportReadAt']));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getProgressReportConceptsByReportId = getProgressReportConceptsByReportId;
async function getProgressReportSessionsForSubjectByPagination(userId, data, tc) {
    try {
        const result = await pgQueries.getProgressReportSessionsForSubjectByPagination.run({
            userId,
            subject: data.subject,
            analysisType: data.analysisType,
            limit: data.limit,
            offset: data.offset,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeRequired)(row));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getProgressReportSessionsForSubjectByPagination = getProgressReportSessionsForSubjectByPagination;
async function getAllProgressReportIdsByUserIdAndSubject(userId, subject, analysisType, tc) {
    try {
        const result = await pgQueries.getAllProgressReportIdsByUserIdAndSubject.run({
            userId,
            subject,
            analysisType,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeRequired)(row).id);
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAllProgressReportIdsByUserIdAndSubject = getAllProgressReportIdsByUserIdAndSubject;
async function getLatestProgressReportIdBySubject(userId, subject, analysisType, tc) {
    try {
        const result = await pgQueries.getLatestProgressReportIdBySubject.run({
            userId,
            subject,
            analysisType,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length) {
            const data = (0, pgUtils_1.makeSomeOptional)(result[0], ['readAt']);
            return {
                ...data,
                status: data.status,
            };
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getLatestProgressReportIdBySubject = getLatestProgressReportIdBySubject;
async function updateProgressReportsReadAtByReportIds(reportIds, tc) {
    try {
        const result = await pgQueries.updateProgressReportsReadAtByReportIds.run({ reportIds }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError(`updateProgressReportReadAt: Update query did not return ok for ${reportIds.join(',')}`);
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateProgressReportsReadAtByReportIds = updateProgressReportsReadAtByReportIds;
async function getUnreadProgressReportOverviewSubjectsByUserId(userId, tc) {
    try {
        const result = await pgQueries.getUnreadProgressReportOverviewSubjectsByUserId.run({
            userId,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeRequired)(row).subject);
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUnreadProgressReportOverviewSubjectsByUserId = getUnreadProgressReportOverviewSubjectsByUserId;
