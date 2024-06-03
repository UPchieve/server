"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeSurvey = void 0;
const Survey_1 = require("../../models/Survey");
const SurveyService_1 = require("../../services/SurveyService");
const type_utils_1 = require("../../utils/type-utils");
const extract_user_1 = require("../extract-user");
const res_error_1 = require("../res-error");
function routeSurvey(router) {
    router.post('/survey/presession/:sessionId', async (req, res) => {
        const user = (0, extract_user_1.extractUser)(req);
        const { sessionId } = req.params;
        const { responseData } = req.body;
        try {
            await (0, Survey_1.savePresessionSurvey)(user.id, (0, type_utils_1.asUlid)(sessionId), responseData // TODO: duck type validation
            );
            res.sendStatus(200);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.post('/survey/save', async (req, res) => {
        const user = (0, extract_user_1.extractUser)(req);
        const { surveyId, surveyTypeId, sessionId, progressReportId, submissions, } = req.body;
        const data = {
            surveyId,
            surveyTypeId,
            sessionId,
            progressReportId,
            submissions,
        };
        try {
            await (0, SurveyService_1.saveUserSurvey)(user.id, data);
            res.sendStatus(200);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    // This route only services the mobile app atm. Remove once
    // the mobile app uses new presession survey work
    router.get('/survey/presession/:sessionId', async (req, res) => {
        const user = (0, extract_user_1.extractUser)(req);
        const { sessionId } = req.params;
        try {
            const survey = await (0, Survey_1.getPresessionSurveyForFeedback)(user.id, (0, type_utils_1.asUlid)(sessionId));
            res.json({ survey });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/survey/presession/:sessionId/goal', async (req, res) => {
        const { sessionId } = req.params;
        try {
            const goal = await (0, Survey_1.getStudentsPresessionGoal)(sessionId);
            res.json({ goal });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/survey/presession', async (req, res) => {
        try {
            const { subject } = req.query;
            const survey = await (0, Survey_1.getSimpleSurveyDefinition)('presession', (0, type_utils_1.asString)(subject));
            res.json(survey);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/survey/presession/response/:sessionId', async (req, res) => {
        try {
            const { sessionId } = req.params;
            const surveyResponse = await (0, SurveyService_1.getContextSharingForVolunteer)((0, type_utils_1.asUlid)(sessionId));
            res.json(surveyResponse);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/survey/postsession', async (req, res) => {
        try {
            const { sessionId, role } = req.query;
            let parsedRole = (0, SurveyService_1.parseUserRole)((0, type_utils_1.asString)(role));
            const survey = await (0, Survey_1.getPostsessionSurveyDefinition)('postsession', (0, type_utils_1.asString)(sessionId), parsedRole);
            res.json({ survey });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/survey/postsession/response', async (req, res) => {
        try {
            const { sessionId, role } = req.query;
            let parsedRole = (0, SurveyService_1.parseUserRole)((0, type_utils_1.asString)(role));
            const surveyResponse = await (0, Survey_1.getPostsessionSurveyResponse)((0, type_utils_1.asUlid)(sessionId), parsedRole);
            res.json(surveyResponse);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/survey/progress-report', async function (req, res) {
        try {
            const survey = await (0, Survey_1.getSimpleSurveyDefinition)('progress-report');
            res.json({ survey });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/survey/progress-report/:progressReportId/response', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const progressReportId = (0, type_utils_1.asString)(req.params.progressReportId);
            const survey = await (0, Survey_1.getProgressReportSurveyResponse)(user.id, progressReportId);
            res.json({ survey });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeSurvey = routeSurvey;
