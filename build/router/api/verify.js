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
exports.routeVerify = void 0;
const newrelic_1 = __importDefault(require("newrelic"));
const VerificationService = __importStar(require("../../services/VerificationService"));
const logger_1 = __importDefault(require("../../logger"));
const res_error_1 = require("../res-error");
const extract_user_1 = require("../extract-user");
const Errors_1 = require("../../models/Errors");
const auth_utils_1 = require("../../utils/auth-utils");
const sendVerificationCommon = async (req, res) => {
    const user = (0, extract_user_1.extractUser)(req);
    const payload = {
        userId: user.id,
        firstName: user.firstName,
        ...req.body,
    };
    try {
        await VerificationService.initiateVerification(payload);
        res.sendStatus(200);
    }
    catch (err) {
        let message = 'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.';
        let status = 500;
        if (err instanceof Errors_1.TwilioError) {
            // custom logging for NR alerts
            logger_1.default.error({ 'error.name': 'twilio verification', error: err }, err.message);
            if (err.status === 429) {
                status = 429;
                message =
                    "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one.";
            }
        }
        else if (err instanceof Errors_1.SmsVerificationDisabledError) {
            status = 403;
            message = err.message;
        }
        (0, res_error_1.resError)(res, new Error(message), status);
    }
};
function routeVerify(router) {
    router
        .route('/verify/send')
        .post(async function (req, res) {
        await sendVerificationCommon(req, res);
    });
    router
        .route('/verify/v2/send')
        .post(auth_utils_1.authPassport.checkRecaptcha, async function (req, res) {
        await sendVerificationCommon(req, res);
    });
    router.route('/verify/confirm').post(async function (req, res) {
        const user = (0, extract_user_1.extractUser)(req);
        const payload = {
            userId: user.id,
            ...req.body,
        };
        newrelic_1.default.addCustomAttribute('role', user.isVolunteer ? 'volunteer' : 'student');
        try {
            const isVerified = await VerificationService.confirmVerification(payload);
            res.json({ success: isVerified });
        }
        catch (err) {
            // custom logging for NR alerts
            logger_1.default.error({ 'error.name': 'twilio verification', error: err }, err.message);
            let status = 500;
            let message = 'Please double-check your verification code. If the problem persists, please contact the UPchieve team at support@upchieve.org for help.';
            if (err instanceof Errors_1.TwilioError && err.status === 404) {
                status = 400;
                message =
                    'The code has expired. Please request a new verification code and try again.';
            }
            else if (err instanceof Errors_1.SmsVerificationDisabledError) {
                status = 403;
                message = err.message;
            }
            (0, res_error_1.resError)(res, new Error(message), status);
        }
    });
}
exports.routeVerify = routeVerify;
