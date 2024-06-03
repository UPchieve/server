"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeWebhooks = void 0;
const res_error_1 = require("../res-error");
const type_utils_1 = require("../../utils/type-utils");
const SocketService_1 = __importDefault(require("../../services/SocketService"));
const auth_utils_1 = require("../../utils/auth-utils");
function routeWebhooks(router) {
    router.post('/webhooks/progress-reports/processed', auth_utils_1.authPassport.isWorker, async function (req, res) {
        try {
            const userId = (0, type_utils_1.asUlid)(req.body.userId);
            const sessionId = (0, type_utils_1.asUlid)(req.body.sessionId);
            const subject = (0, type_utils_1.asString)(req.body.subject);
            const report = req.body.report;
            if (!userId || !report)
                return res.sendStatus(400);
            const socketService = SocketService_1.default.getInstance();
            socketService.emitProgressReportProcessedToUser(userId, {
                sessionId,
                subject,
                report,
            });
            return res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeWebhooks = routeWebhooks;
