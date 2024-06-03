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
const logger_1 = require("../../logger");
const MailService = __importStar(require("../../../services/MailService"));
const Session_1 = require("../../../models/Session");
const type_utils_1 = require("../../../utils/type-utils");
exports.default = async (job) => {
    const { name: currentJob } = job;
    const sessionId = (0, type_utils_1.asString)(job.data.sessionId);
    const volunteer = await (0, Session_1.getVolunteerForEmailFirstSession)(sessionId);
    if (volunteer) {
        const { id: volunteerId, firstName, email } = volunteer;
        try {
            await MailService.sendVolunteerFirstSessionCongrats(email, firstName);
            (0, logger_1.log)(`Sent ${currentJob} to volunteer ${volunteerId}`);
        }
        catch (error) {
            throw new Error(`Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`);
        }
    }
};
