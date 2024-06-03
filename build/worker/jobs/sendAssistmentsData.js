"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWrapper = exports.sendData = exports.buildRequest = exports.pluckMessages = void 0;
const axios_1 = __importDefault(require("axios"));
const exponential_backoff_1 = require("exponential-backoff");
const config_1 = __importDefault(require("../../config"));
const AssistmentsData_1 = require("../../models/AssistmentsData");
const Session_1 = require("../../models/Session");
const type_utils_1 = require("../../utils/type-utils");
const Errors_1 = require("../../models/Errors");
const logger_1 = __importDefault(require("../../logger"));
function pluckMessages(messages) {
    const final = [];
    for (const message of messages) {
        final.push({
            contents: message.contents,
            createdAt: message.createdAt.getTime(),
            userId: message.user.toString(),
        });
    }
    return final;
}
exports.pluckMessages = pluckMessages;
async function buildRequest(data) {
    try {
        const params = {
            assignmentXref: data.assignmentId,
            userXref: data.studentId,
        };
        const session = await (0, Session_1.getSessionById)(data.sessionId);
        const messages = await (0, Session_1.getMessagesForFrontend)(data.sessionId);
        if (!session.endedAt)
            throw new Error('Assistments session has not ended!');
        const partSession = {
            createdAt: session.createdAt.getTime(),
            endedAt: session.endedAt.getTime(),
            id: session.id,
            messages: pluckMessages(messages),
            studentId: session.studentId,
            subject: session.topic,
            subTopic: session.subject,
            timeTutored: session.timeTutored,
            volunteerJoinedAt: session.volunteerJoinedAt
                ? session.volunteerJoinedAt.getTime()
                : undefined,
            volunteerId: session.volunteerId,
        };
        const payload = {
            studentId: data.studentId,
            assignmentId: data.assignmentId,
            problemId: String(data.problemId),
            session: partSession,
        };
        return { params, payload };
    }
    catch (err) {
        throw new Error(`Error building request to send AssistmentsData ${data.id}: ${err.message}`);
    }
}
exports.buildRequest = buildRequest;
function buildAuthHeader() {
    const parts = config_1.default.assistmentsAuthSchema.split('{TOKEN}');
    if (parts.length === 2)
        return parts[0] + config_1.default.assistmentsToken + parts[1];
    throw new Error('Could not build Assistments auth token');
}
async function sendData(params, payload) {
    let status;
    let message;
    let res;
    try {
        res = await axios_1.default.post(`${config_1.default.assistmentsBaseURL}/assignments/${params.assignmentXref}/exdata/${params.userXref}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: buildAuthHeader(),
            },
            validateStatus: () => true, // always resolve the promise regardless of status code
        });
        message = res.data;
        status = res.status;
    }
    catch (err) {
        logger_1.default.error(`Attempt to send assistments data failed, err=${err.message}`);
        throw new Errors_1.AssistmentsError(`Encountered error while attempting to send Assistments data`, true);
    }
    if (status === 201) {
        logger_1.default.info(`Successfully sent assistments data for session ${payload.session.id}`);
        return;
    }
    const retry = ![401, 403, 404].includes(status);
    throw new Errors_1.AssistmentsError(`Request to send assistments data was rejected with status ${status}`, retry);
}
exports.sendData = sendData;
async function sendWrapper(params, payload) {
    try {
        await (0, exponential_backoff_1.backOff)(() => sendData(params, payload), {
            jitter: 'full',
            maxDelay: 2000,
            numOfAttempts: 10,
            retry: (e, attemptNumber) => {
                logger_1.default.warn({ error: e.message, sessionId: payload.session.id }, 'Failed to send assistments data');
                return e instanceof Errors_1.AssistmentsError && e.retry;
            },
        });
    }
    catch (err) {
        throw new Error(`Error sending AssistmentsData for session ${payload.session.id}: Used up all attempts to send data`);
    }
}
exports.sendWrapper = sendWrapper;
exports.default = async (job) => {
    const sessionId = (0, type_utils_1.asString)(job.data.sessionId);
    const data = await (0, AssistmentsData_1.getAssistmentsDataBySession)(sessionId);
    if (data && !data.sent) {
        const { params, payload } = await buildRequest(data);
        await sendWrapper(params, payload);
        try {
            await (0, AssistmentsData_1.updateAssistmentsDataSentById)(data.id);
        }
        catch (err) {
            throw new Error(`Error updating assistments data ${data.id}: ${err.message}`);
        }
    }
};
