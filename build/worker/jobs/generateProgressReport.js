"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Session_1 = require("../../models/Session");
const ProgressReportsService_1 = require("../../services/ProgressReportsService");
const sockets_1 = require("../sockets");
const FeatureFlagService_1 = require("../../services/FeatureFlagService");
const config_1 = __importDefault(require("../../config"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../../logger"));
const type_utils_1 = require("../../utils/type-utils");
async function sendProgressReport(userId, data) {
    const protocol = config_1.default.NODE_ENV === 'dev' ? 'http' : 'https';
    const port = config_1.default.NODE_ENV === 'dev' ? `:${config_1.default.apiPort}` : '';
    const url = `${protocol}://${config_1.default.clusterServerAddress}${port}/api/webhooks/progress-reports/processed`;
    try {
        await axios_1.default.post(url, data, {
            headers: {
                'x-api-key': config_1.default.subwayApiCredentials,
            },
        });
    }
    catch (error) {
        const errorMessage = `Failed to send progress report via HTTP to user ${userId} error ${error}`;
        logger_1.default.error(errorMessage);
        throw new Error(errorMessage);
    }
}
async function generateAndEmitProgressReport(userId, reportOptions) {
    let report;
    let reportGenerationError;
    try {
        report = await (0, ProgressReportsService_1.generateProgressReportForUser)(userId, reportOptions);
    }
    catch (error) {
        reportGenerationError = error;
        logger_1.default.error(`Error generating progress report: ${error}`);
        report = {
            status: 'error',
            summary: undefined,
            concepts: undefined,
        };
    }
    const data = {
        userId: userId,
        ...reportOptions,
        report,
    };
    const socket = (0, sockets_1.getSocket)();
    if (socket.connected)
        socket.emit('progress-report:processed', data);
    else
        await sendProgressReport(userId, data);
    if (reportGenerationError)
        throw reportGenerationError;
}
exports.default = async (job) => {
    const sessionId = (0, type_utils_1.asUlid)(job.data.sessionId);
    const session = await (0, Session_1.getSessionById)(sessionId);
    const isProgressReportsActive = await (0, FeatureFlagService_1.getProgressReportsFeatureFlag)(session.studentId);
    if (session.subject !== 'reading' ||
        !isProgressReportsActive ||
        session.timeTutored < config_1.default.minSessionLength)
        return;
    const tasks = [
        // Single session analysis
        generateAndEmitProgressReport(session.studentId, {
            sessionId: session.id,
            subject: session.subject,
        }),
        // Group session analysis
        generateAndEmitProgressReport(session.studentId, {
            subject: session.subject,
        }),
    ];
    // Execute both generation tasks in parallel
    const results = await Promise.allSettled(tasks);
    const errors = results
        .filter((result) => result.status === 'rejected')
        .map((result, i) => `Error in ${i === 0 ? 'single' : 'group'} session report: ${result.reason}`);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
};
