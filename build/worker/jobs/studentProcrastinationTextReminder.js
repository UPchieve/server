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
const User_1 = require("../../models/User");
const AnalyticsService_1 = require("../../services/AnalyticsService");
const TwilioService = __importStar(require("../../services/TwilioService"));
const type_utils_1 = require("../../utils/type-utils");
exports.default = async (job) => {
    const userId = (0, type_utils_1.asString)(job.data.userId);
    const user = await (0, User_1.getUserContactInfoById)(userId);
    if (!user || !user.phone)
        return;
    try {
        const messageId = await TwilioService.sendProcrastinationTextReminder(user.id, user.firstName, user.phone);
        if (messageId)
            (0, AnalyticsService_1.captureEvent)(user.id, constants_1.EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_SENT, {
                event: constants_1.EVENTS.STUDENT_PROCRASTINATION_PREVENTION_REMINDER_SENT,
            });
    }
    catch (error) {
        throw new Error(`Failed to send procrastination reminder text to student: ${user.id}. Error: ${error}`);
    }
};
