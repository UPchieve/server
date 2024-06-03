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
exports.confirmVerification = exports.initiateVerification = void 0;
const constants_1 = require("../constants");
const type_utils_1 = require("../utils/type-utils");
const is_valid_email_1 = __importDefault(require("../utils/is-valid-email"));
const Errors_1 = require("../models/Errors");
const StudentService = __importStar(require("./StudentService"));
const MailService = __importStar(require("./MailService"));
const TwilioService = __importStar(require("./TwilioService"));
const queries_1 = require("../models/User/queries");
const is_valid_international_phone_number_1 = __importDefault(require("../utils/is-valid-international-phone-number"));
const FeatureFlagService_1 = require("./FeatureFlagService");
const asInitiateVerificationData = (0, type_utils_1.asFactory)({
    userId: type_utils_1.asString,
    sendTo: type_utils_1.asString,
    verificationMethod: (0, type_utils_1.asEnum)(constants_1.VERIFICATION_METHOD),
    firstName: type_utils_1.asString,
});
const asConfirmVerificationData = (0, type_utils_1.asFactory)({
    userId: type_utils_1.asString,
    sendTo: type_utils_1.asString,
    verificationMethod: (0, type_utils_1.asEnum)(constants_1.VERIFICATION_METHOD),
    verificationCode: type_utils_1.asString,
    forSignup: (0, type_utils_1.asOptional)(type_utils_1.asBoolean),
});
async function initiateVerification(data) {
    var _a;
    const { userId, sendTo, verificationMethod, firstName, } = asInitiateVerificationData(data);
    if (verificationMethod === constants_1.VERIFICATION_METHOD.SMS &&
        !(await (0, FeatureFlagService_1.getSmsVerificationFeatureFlag)(userId))) {
        throw new Errors_1.SmsVerificationDisabledError();
    }
    const isPhoneVerification = verificationMethod === constants_1.VERIFICATION_METHOD.SMS;
    let existingUserErrorMessage;
    let existingUserId;
    if (isPhoneVerification) {
        if (!(0, is_valid_international_phone_number_1.default)(sendTo))
            throw new Errors_1.InputError('Must supply a valid phone number');
        existingUserErrorMessage = 'The phone number you entered is already in use';
        existingUserId = await (0, queries_1.getUserIdByPhone)(sendTo);
    }
    else {
        // email verification
        if (!(0, is_valid_email_1.default)(sendTo))
            throw new Errors_1.InputError('Must supply a valid email address');
        existingUserErrorMessage = 'The email address you entered is already in use';
        existingUserId = await (0, queries_1.getUserIdByEmail)(sendTo);
        if (!existingUserId) {
            throw new Errors_1.LookupError('The email address you entered does not match your account email address');
        }
    }
    // Make sure the user from DB matches the one in the request
    if (existingUserId && !(userId === existingUserId))
        throw new Errors_1.AlreadyInUseError(existingUserErrorMessage);
    try {
        await TwilioService.sendVerification(sendTo, verificationMethod, firstName, userId);
    }
    catch (err) {
        const error = err;
        throw new Errors_1.TwilioError((_a = error.message) !== null && _a !== void 0 ? _a : 'Could not send verification', error.status);
    }
}
exports.initiateVerification = initiateVerification;
async function sendEmails(userId) {
    // replaced by getUserContactInfo
    const user = await (0, queries_1.getUserContactInfoById)(userId);
    if (user) {
        if (user.isVolunteer) {
            if (user.volunteerPartnerOrg) {
                await MailService.sendPartnerVolunteerWelcomeEmail(user.email, user.firstName);
            }
            else {
                await MailService.sendOpenVolunteerWelcomeEmail(user.email, user.firstName);
            }
        }
        else {
            await MailService.sendStudentOnboardingWelcomeEmail(user.email, user.firstName);
            await StudentService.queueOnboardingEmails(user.id);
        }
    }
}
async function confirmVerification(data) {
    var _a, _b;
    const { userId, sendTo, verificationMethod, verificationCode, forSignup, } = asConfirmVerificationData(data);
    if (verificationMethod === constants_1.VERIFICATION_METHOD.SMS &&
        !(await (0, FeatureFlagService_1.getSmsVerificationFeatureFlag)(userId))) {
        throw new Errors_1.SmsVerificationDisabledError();
    }
    // Validate code
    const VERIFICATION_CODE_LENGTH = 6;
    if (verificationCode.length !== VERIFICATION_CODE_LENGTH ||
        isNaN(Number(verificationCode)))
        throw new Errors_1.InputError('Must enter a valid 6-digit validation code');
    const shouldSendOnboardingEmails = forSignup !== null && forSignup !== void 0 ? forSignup : true;
    const isPhoneVerification = verificationMethod === constants_1.VERIFICATION_METHOD.SMS;
    let isVerified = false;
    try {
        isVerified = await TwilioService.confirmVerification(sendTo, verificationCode);
    }
    catch (err) {
        const error = err;
        throw new Errors_1.TwilioError((_a = error.message) !== null && _a !== void 0 ? _a : 'Could not confirm verification code', (_b = error.status) !== null && _b !== void 0 ? _b : 500);
    }
    if (isVerified) {
        await (0, queries_1.updateUserVerifiedInfoById)(userId, sendTo, isPhoneVerification);
        if (shouldSendOnboardingEmails) {
            await sendEmails(userId);
        }
    }
    return isVerified;
}
exports.confirmVerification = confirmVerification;
