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
const _1 = require(".");
const Session_1 = require("../../models/Session");
const Volunteer_1 = require("../../models/Volunteer");
const TwilioService = __importStar(require("../../services/TwilioService"));
const sessionUtils = __importStar(require("../../utils/session-utils"));
const type_utils_1 = require("../../utils/type-utils");
const logger_1 = require("../logger");
exports.default = async (job) => {
    const sessionId = (0, type_utils_1.asString)(job.data.sessionId);
    const volunteerId = (0, type_utils_1.asString)(job.data.volunteerId);
    const session = await (0, Session_1.getSessionById)(sessionId);
    if (!session)
        return;
    const fulfilled = sessionUtils.isSessionFulfilled(session);
    if (fulfilled)
        return (0, logger_1.log)(`Cancel ${_1.Jobs.SendFollowupText} for ${sessionId} to ${volunteerId}: fulfilled`);
    const volunteer = await (0, Volunteer_1.getVolunteerContactInfoById)(volunteerId);
    if (!volunteer)
        return;
    try {
        await TwilioService.sendFollowupText(sessionId, volunteerId, volunteer.phone);
        (0, logger_1.log)(`Successfully sent followup for session ${session.id} to volunteer ${volunteer.id}`);
    }
    catch (error) {
        throw new Error(`Failed to send followup for session ${session.id} to volunteer ${volunteer.id}: ${error}`);
    }
};
