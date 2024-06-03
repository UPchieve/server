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
exports.resError = void 0;
const ts_custom_error_1 = require("ts-custom-error");
const Sentry = __importStar(require("@sentry/node"));
const Errors_1 = require("../models/Errors");
const auth_utils_1 = require("../utils/auth-utils");
const config_1 = __importDefault(require("../config"));
const session_utils_1 = require("../utils/session-utils");
const logger_1 = __importDefault(require("../logger"));
const ReportService_1 = require("../services/ReportService");
const EligibilityService_1 = require("../services/EligibilityService");
function resError(res, err, status) {
    let message = '';
    if (err instanceof Error || err instanceof ts_custom_error_1.CustomError) {
        logger_1.default.error(err);
        if (status) {
            /* keep provided status */
        }
        // user is not authenticated
        else if (err instanceof Errors_1.NotAuthenticatedError)
            status = 401;
        // user is authenthicated, but not authorized to retrieve resource
        else if (err instanceof Errors_1.NotAllowedError)
            status = 403;
        // database lookup unexpectedly returned null
        else if (err instanceof Errors_1.LookupError)
            status = 422;
        // business logic errors
        else if (err instanceof auth_utils_1.RegistrationError)
            status = 422;
        else if (err instanceof auth_utils_1.ResetError)
            status = 422;
        else if (err instanceof session_utils_1.StartSessionError)
            status = 422;
        else if (err instanceof ReportService_1.ReportNoDataFoundError)
            status = 422;
        else if (err instanceof EligibilityService_1.ExistingUserError) {
            status = 422;
            message = 'Email already in use';
        }
        // bad input
        else if (err instanceof Errors_1.InputError)
            status = 422;
        else if (err instanceof Errors_1.AlreadyInUseError)
            status = 409;
        // unknown error
        else
            status = 500;
        if (config_1.default.NODE_ENV === 'production' && status === 500)
            Sentry.captureException(err);
        res.status(status).json({
            err: message || err.message,
        });
    }
    else {
        logger_1.default.error(`Unexpected non-error type thrown: ${err}`);
        res.status(500);
    }
}
exports.resError = resError;
