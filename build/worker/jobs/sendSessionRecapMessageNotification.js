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
const constants_1 = require("../../constants");
const Session_1 = require("../../models/Session");
const AnalyticsService_1 = require("../../services/AnalyticsService");
const type_utils_1 = require("../../utils/type-utils");
const MailService = __importStar(require("../../services/MailService"));
const link_builders_1 = require("../../utils/link-builders");
const sendSessionHistoryMessage = async (message) => {
    const { senderId, studentUserId, volunteerEmail, volunteerFirstName, studentEmail, studentFirstName, sessionId, contents, } = message;
    const sessionRecapLink = (0, link_builders_1.buildAppLink)(`sessions/${sessionId}/recap`);
    const isSenderStudent = senderId === studentUserId;
    const email = isSenderStudent ? volunteerEmail : studentEmail;
    const senderFirstName = isSenderStudent
        ? studentFirstName
        : volunteerFirstName;
    const receiverFirstName = isSenderStudent
        ? volunteerFirstName
        : studentFirstName;
    await MailService.sendSessionRecapMessage(email, receiverFirstName, senderFirstName, sessionRecapLink, contents);
    return sessionRecapLink;
};
exports.default = async (job) => {
    const messageId = (0, type_utils_1.asString)(job.data.messageId);
    const message = await (0, Session_1.getMessageInfoByMessageId)(messageId);
    if (!message || !message.sentAfterSession)
        return;
    const senderId = message.senderId;
    const receiverId = senderId === message.studentUserId
        ? message.volunteerUserId
        : message.studentUserId;
    try {
        const sessionRecapLink = await sendSessionHistoryMessage(message);
        (0, AnalyticsService_1.captureEvent)(senderId, constants_1.EVENTS.SESSION_RECAP_MESSAGE_NOTIFICATION_SENT, {
            event: constants_1.EVENTS.SESSION_RECAP_MESSAGE_NOTIFICATION_SENT,
            sessionId: message.sessionId,
            senderId,
            receiverId,
            sessionRecapLink,
        });
    }
    catch (error) {
        throw new Error(`Failed to send session recap message ${messageId} to receiver: ${receiverId} from ${senderId}. Error: ${error}`);
    }
};
