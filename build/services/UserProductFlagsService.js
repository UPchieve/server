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
exports.incentiveProgramEnrollmentEnroll = exports.incentiveProgramEnrollmentVerify = exports.checkIfInIncentiveProgram = void 0;
const constants_1 = require("../constants");
const User_1 = require("../models/User");
const UserProductFlags_1 = require("../models/UserProductFlags");
const TwilioService = __importStar(require("./TwilioService"));
async function checkIfInIncentiveProgram(userId) {
    const flags = await (0, UserProductFlags_1.getPublicUPFByUserId)(userId);
    if (flags === null || flags === void 0 ? void 0 : flags.fallIncentiveProgram)
        throw new Error('Already in the fall incentive program');
}
exports.checkIfInIncentiveProgram = checkIfInIncentiveProgram;
// TODO: Remove once VerificationSerivice.initiateVerification supports SMS
async function incentiveProgramEnrollmentVerify(userId, firstName, phone) {
    try {
        const currentUser = await (0, User_1.getUserIdByPhone)(phone);
        if (currentUser)
            throw new Error('Phone number in use');
        await checkIfInIncentiveProgram(userId);
        await TwilioService.sendVerification(phone, constants_1.VERIFICATION_METHOD.SMS, firstName, userId);
    }
    catch (error) {
        throw error;
    }
}
exports.incentiveProgramEnrollmentVerify = incentiveProgramEnrollmentVerify;
async function incentiveProgramEnrollmentEnroll(userId) {
    try {
        const userVerificationInfo = await (0, User_1.getUserVerificationInfoById)(userId);
        if (!(userVerificationInfo === null || userVerificationInfo === void 0 ? void 0 : userVerificationInfo.phoneVerified))
            throw new Error('Your phone number must be verified before joining the program.');
        await (0, UserProductFlags_1.updateFallIncentiveProgram)(userId, true);
    }
    catch (error) {
        throw error;
    }
}
exports.incentiveProgramEnrollmentEnroll = incentiveProgramEnrollmentEnroll;
