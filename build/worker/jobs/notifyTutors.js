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
const queries_1 = require("../../models/Session/queries");
const sessionUtils = __importStar(require("../../utils/session-utils"));
const QueueService_1 = __importDefault(require("../../services/QueueService"));
const TwilioService = __importStar(require("../../services/TwilioService"));
const logger_1 = require("../logger");
const _1 = require(".");
const type_utils_1 = require("../../utils/type-utils");
exports.default = async (job) => {
    const sessionId = (0, type_utils_1.asString)(job.data.sessionId);
    const notificationSchedule = job.data.notificationSchedule;
    const currentNotificationRound = job.data.currentNotificationRound;
    const session = await (0, queries_1.getSessionById)(sessionId);
    const fulfilled = sessionUtils.isSessionFulfilled(session);
    if (fulfilled) {
        await QueueService_1.default.add(_1.Jobs.EmailVolunteerGentleWarning, {
            sessionId,
        }, {
            removeOnComplete: true,
            removeOnFail: true,
        });
        return (0, logger_1.log)(`Cancel ${_1.Jobs.NotifyTutors} for ${sessionId}: fulfilled`);
    }
    const delay = notificationSchedule.shift();
    if (delay)
        await QueueService_1.default.add(_1.Jobs.NotifyTutors, {
            sessionId: sessionId.toString(),
            notificationSchedule,
            currentNotificationRound: currentNotificationRound + 1,
        }, { delay, removeOnComplete: true, removeOnFail: true });
    try {
        const volunteerNotified = await TwilioService.notifyVolunteer(session);
        if (volunteerNotified) {
            (0, logger_1.log)(`Successfully sent notification for session ${session.id} to volunteer ${volunteerNotified}`);
            // send a followup text to the volunteer in 5 mins
            await QueueService_1.default.add(_1.Jobs.SendFollowupText, {
                sessionId: sessionId.toString(),
                volunteerId: volunteerNotified.toString(),
            }, { delay: 1000 * 60 * 5, removeOnComplete: true, removeOnFail: true });
        }
        else {
            (0, logger_1.log)(`No volunteers available for session in ${session.subject}, on notification round ${currentNotificationRound} (session ID ${session.id})`);
        }
    }
    catch (error) {
        throw new Error(`Failed to send notification for session ${session.id}: ${error}`);
    }
};
