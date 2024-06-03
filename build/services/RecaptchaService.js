"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestRecaptcha = exports.getScore = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const Errors_1 = require("../models/Errors");
/**
 * Get the Recaptcha score for the request with the given token
 * @param token
 * @constructor
 */
async function getScore(token) {
    const res = (await axios_1.default.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config_1.default.googleRecaptchaSecret}&response=${token}`));
    return { data: res.data };
}
exports.getScore = getScore;
/**
 * Validates the recaptcha score for the request, throwing errors if
 * any of the validations fail.
 * @throws MissingRecaptchaTokenError if the g-recaptcha-response header is missing
 * @throws LowRecaptchaScoreError if the score is below threshold
 * @throws Error
 * @param req
 */
async function validateRequestRecaptcha(req) {
    var _a, _b, _c, _d;
    const token = req.headers['g-recaptcha-response'];
    if (!token) {
        logger_1.default.info('unable to check grecaptcha: no token in request headers');
        throw new Errors_1.MissingRecaptchaTokenError();
    }
    const result = await getScore(token);
    if (!result.data || !((_a = result.data) === null || _a === void 0 ? void 0 : _a.success)) {
        logger_1.default.error(`grecaptcha result failed: ${JSON.stringify(result.data)}`);
        throw new Error('Could not get recaptcha score for request');
    }
    logger_1.default.info(`grecaptcha result ${result.data.score} for ${result.data.action}`);
    if (result.data.score < config_1.default.googleRecaptchaThreshold) {
        logger_1.default.warn({
            message: `grecaptcha score is below threshold`,
            score: result.data.score,
            action: result.data.action,
            threshold: config_1.default.googleRecaptchaThreshold,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            verificationMethod: (_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.verificationMethod,
        });
        throw new Errors_1.LowRecaptchaScoreError();
    }
}
exports.validateRequestRecaptcha = validateRequestRecaptcha;
