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
exports.routeSession = void 0;
const SocketService_1 = __importDefault(require("../../services/SocketService"));
const SessionService = __importStar(require("../../services/SessionService"));
const auth_utils_1 = require("../../utils/auth-utils");
const Errors_1 = require("../../models/Errors");
const res_error_1 = require("../res-error");
const session_utils_1 = require("../../utils/session-utils");
const extract_user_1 = require("../extract-user");
const type_utils_1 = require("../../utils/type-utils");
function routeSession(router) {
    // io is now passed to this module so that API events can trigger socket events as needed
    const socketService = SocketService_1.default.getInstance();
    router.route('/session/new').post(async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const sessionId = await SessionService.startSession(user, {
                ...req.body,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
            });
            res.json({ sessionId });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.route('/session/end').post(async function (req, res) {
        try {
            if (!Object.prototype.hasOwnProperty.call(req.body, 'sessionId'))
                throw new Errors_1.InputError('Missing sessionId body string');
            const user = (0, extract_user_1.extractUser)(req);
            await SessionService.endSession((0, type_utils_1.asUlid)(req.body.sessionId), user.id, false, socketService, {
                userAgent: req.get('User-Agent') || '',
                ip: req.ip,
            });
            res.json({ sessionId: req.body.sessionId });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.route('/session/check').post(async function (req, res) {
        try {
            if (!Object.prototype.hasOwnProperty.call(req.body, 'sessionId'))
                throw new Errors_1.InputError('Missing sessionId body string');
            const sessionId = await SessionService.checkSession(req.body.sessionId);
            res.json({
                sessionId,
            });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    // TODO: switch to a GET request
    router.route('/session/current').post(async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const currentSession = await SessionService.currentSession(user.id);
            if (!currentSession) {
                res.json(null);
            }
            else {
                res.json({
                    sessionId: currentSession._id,
                    data: currentSession,
                });
            }
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.route('/session/recap-dms').post(async function (req, res) {
        try {
            const sessionId = (0, type_utils_1.asString)(req.body.sessionId);
            const currentSession = await SessionService.getRecapSessionForDms(sessionId);
            if (!currentSession) {
                (0, res_error_1.resError)(res, new Errors_1.LookupError('No current session'), 404);
            }
            else {
                res.json({
                    sessionId: currentSession._id,
                    data: currentSession,
                });
            }
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.route('/session/latest').post(async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const latestSession = await SessionService.studentLatestSession(user.id);
            if (!latestSession) {
                res.json(null);
            }
            else {
                res.json({
                    sessionId: latestSession.id,
                    data: latestSession,
                });
            }
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/session/review', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const { sessions, isLastPage } = await SessionService.sessionsToReview(req.query.page, { studentFirstName: req.query.studentFirstName });
            res.json({ sessions, isLastPage });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.put('/session/:sessionId', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const { sessionId } = req.params;
            await SessionService.reviewSession({
                ...req.body,
                sessionId,
            });
            res.sendStatus(200);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/session/:sessionId/photo-url', async function (req, res) {
        try {
            const { sessionId } = req.params;
            const { uploadUrl, imageUrl } = await SessionService.getImageAndUploadUrl(sessionId);
            res.json({ uploadUrl, imageUrl });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.post('/session/:sessionId/report', async function (req, res) {
        try {
            const { sessionId } = req.params;
            const user = (0, extract_user_1.extractUser)(req);
            await SessionService.reportSession(user, {
                sessionId,
                ...req.body,
            });
            res.json({ msg: 'Success' });
        }
        catch (error) {
            if (error instanceof session_utils_1.ReportSessionError)
                return (0, res_error_1.resError)(res, error, 422);
            (0, res_error_1.resError)(res, error);
        }
    });
    router.post('/session/:sessionId/timed-out', async function (req, res) {
        try {
            const { sessionId } = req.params;
            const { timeout } = req.body;
            const { ip } = req;
            const user = (0, extract_user_1.extractUser)(req);
            const userAgent = req.get('User-Agent');
            await SessionService.sessionTimedOut(user, {
                sessionId,
                timeout,
                ip,
                userAgent,
            });
            res.sendStatus(200);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/sessions', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const { sessions, isLastPage, } = await SessionService.adminFilteredSessions(req.query);
            res.json({ sessions, isLastPage });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/session/:sessionId/admin', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const { sessionId } = req.params;
            const session = await SessionService.adminSessionView(sessionId);
            res.json({ session });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/session/:sessionId', async function (req, res) {
        try {
            const { sessionId } = req.params;
            // TODO: could be undefined
            const session = await SessionService.publicSession(sessionId);
            res.json({ session });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/session/:sessionId/notifications', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const { sessionId } = req.params;
            const notifications = await SessionService.getSessionNotifications(sessionId);
            res.json({ notifications });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/sessions/history', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const { pastSessions, page, isLastPage, } = await SessionService.getSessionHistory(user.id, (0, type_utils_1.asString)(req.query.page));
            res.json({ page, isLastPage, pastSessions });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/sessions/history/total', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const total = await SessionService.getTotalSessionHistory(user.id);
            res.json({ total });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/sessions/history/:sessionId/eligible', async function (req, res) {
        try {
            const { sessionId } = req.params;
            const { studentId } = req.body;
            const isEligible = await SessionService.isEligibleForSessionRecap(sessionId, (0, type_utils_1.asString)(studentId));
            res.json({ isEligible });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/sessions/:sessionId/recap', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const { sessionId } = req.params;
            const session = await SessionService.getSessionRecap((0, type_utils_1.asUlid)(sessionId), user.id);
            const isRecapDmsAvailable = await SessionService.isRecapDmsAvailable(session.id, session.studentId, session.volunteerId, user.isVolunteer);
            res.json({ session, isRecapDmsAvailable });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeSession = routeSession;
