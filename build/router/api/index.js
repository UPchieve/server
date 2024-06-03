"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const auth_utils_1 = require("../../utils/auth-utils");
const add_last_activity_1 = require("../../middleware/add-last-activity");
const add_user_action_1 = require("../../middleware/add-user-action");
const volunteers_1 = require("./volunteers");
const verify_1 = require("./verify");
const session_1 = require("./session");
const calendar_1 = require("./calendar");
const feedback_1 = require("./feedback");
const sockets_1 = require("./sockets");
const moderate_1 = require("./moderate");
const push_token_1 = require("./push-token");
const reports_1 = require("./reports");
const survey_1 = require("./survey");
const stats_1 = require("./stats");
const training_1 = require("./training");
const user_1 = require("./user");
const product_flags_1 = require("./product-flags");
const students_1 = require("./students");
const subjects_1 = require("./subjects");
const progress_reports_1 = require("./progress-reports");
const admin_1 = require("./admin");
const webhooks_1 = require("./webhooks");
const MailService_1 = require("../../services/MailService");
const User_1 = require("../../models/User");
const config_1 = __importDefault(require("../../config"));
function routes(app, sessionStore, io) {
    const router = (0, express_1.Router)();
    (0, volunteers_1.routeVolunteers)(router);
    (0, user_1.routeUser)(router);
    (0, verify_1.routeVerify)(router);
    (0, session_1.routeSession)(router);
    (0, calendar_1.routeCalendar)(router);
    (0, training_1.routeTraining)(router);
    (0, feedback_1.routeFeedback)(router);
    (0, sockets_1.routeSockets)(io, sessionStore);
    (0, moderate_1.routeModeration)(router);
    (0, push_token_1.routePushToken)(router);
    (0, reports_1.routeReports)(router);
    (0, survey_1.routeSurvey)(router);
    (0, stats_1.routes)(router);
    (0, product_flags_1.routeProductFlags)(router);
    (0, students_1.routeStudents)(router);
    (0, subjects_1.routeSubjects)(router);
    (0, progress_reports_1.routeProgressReports)(router);
    (0, webhooks_1.routeWebhooks)(router);
    (0, admin_1.routeAdmin)(app, router);
    router.post('/send-referral-email', async function (req, res) {
        try {
            if (!req.user) {
                res.json({ success: false });
                return;
            }
            const user = await (0, User_1.getUserReferralLink)(req.user.id);
            if (!user) {
                res.json({ success: false });
                return;
            }
            const referralLink = `https://${config_1.default.client.host}/referral/${user.referralCode}`;
            await (0, MailService_1.sendReferralProgramEmail)(user.email, user.firstName, referralLink);
            res.json({ success: true });
        }
        catch {
            res.json({ success: false });
        }
    });
    app.use(add_last_activity_1.addLastActivity);
    app.use(add_user_action_1.addUserAction);
    app.use('/api', auth_utils_1.authPassport.bypassMiddlewareForWebhooks(auth_utils_1.authPassport.isAuthenticated), router);
}
exports.routes = routes;
