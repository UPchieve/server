"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeProgressReports = void 0;
const ProgressReportsService_1 = require("../../services/ProgressReportsService");
const extract_user_1 = require("../extract-user");
const res_error_1 = require("../res-error");
const type_utils_1 = require("../../utils/type-utils");
const Errors_1 = require("../../services/Errors");
function routeProgressReports(router) {
    router.get('/progress-reports/sessions/:sessionId', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const sessionId = (0, type_utils_1.asUlid)(req.params.sessionId);
            const report = await (0, ProgressReportsService_1.getProgressReportForUserSession)(user.id, sessionId);
            res.json(report);
        }
        catch (err) {
            if (err instanceof Errors_1.ProgressReportNotFoundError)
                res.sendStatus(200);
            else
                (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/progress-reports/subjects/:subject', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const subject = (0, type_utils_1.asString)(req.params.subject);
            const page = (0, type_utils_1.asNumber)(req.query.page);
            const result = await (0, ProgressReportsService_1.getProgressReportsForSubjectPaginated)(user.id, subject, page);
            res.json(result);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/progress-reports/summaries/:subject', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const subject = (0, type_utils_1.asString)(req.params.subject);
            const summaries = await (0, ProgressReportsService_1.getProgressReportSummariesBySubject)(user.id, subject);
            res.json(summaries);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/progress-reports/summaries/:subject/latest', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const subject = (0, type_utils_1.asString)(req.params.subject);
            const summary = await (0, ProgressReportsService_1.getLatestProgressReportSummaryBySubject)(user.id, subject);
            res.json(summary);
        }
        catch (err) {
            if (err instanceof Errors_1.ProgressReportNotFoundError)
                res.sendStatus(200);
            else
                (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/progress-reports/read', async function (req, res) {
        try {
            const reportIds = (0, type_utils_1.asArray)(type_utils_1.asString)(req.body.reportIds);
            await (0, ProgressReportsService_1.readProgressReportsByIds)(reportIds);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/progress-reports/unread', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const subjects = await (0, ProgressReportsService_1.getUnreadProgressReportOverviewSubjects)(user.id);
            res.json({ subjects });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeProgressReports = routeProgressReports;
