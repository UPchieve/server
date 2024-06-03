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
exports.saveContactFormSubmission = exports.MailSendError = void 0;
const ts_custom_error_1 = require("ts-custom-error");
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const isLength_1 = __importDefault(require("validator/lib/isLength"));
const newrelic_1 = __importDefault(require("newrelic"));
const ContactFormSubmissionRepo = __importStar(require("../models/ContactFormSubmission/queries"));
const MailService = __importStar(require("./MailService"));
const type_utils_1 = require("../utils/type-utils");
const Errors_1 = require("../models/Errors");
const asContactFormSubmissionData = (0, type_utils_1.asFactory)({
    message: type_utils_1.asString,
    topic: type_utils_1.asString,
    userEmail: type_utils_1.asString,
    userId: (0, type_utils_1.asOptional)(type_utils_1.asString),
});
class MailSendError extends ts_custom_error_1.CustomError {
    constructor(mailType, err) {
        super(`failed to send ${mailType} through email provider: ${err}`);
    }
}
exports.MailSendError = MailSendError;
const topics = [
    'General question',
    'General feedback',
    'Technical issue',
    'Feature request',
    'Subject suggestion',
    'Other',
];
function topicIsValid(topic) {
    return topics.includes(topic);
}
function messageIsValid(message) {
    return (0, isLength_1.default)(message, {
        min: 1,
        max: 500,
    });
}
// TODO: this function is redundant
async function sendContactForm(topic, message, email) {
    try {
        await MailService.sendContactForm({
            topic,
            message,
            email,
        });
    }
    catch (err) {
        throw new MailSendError('contact form submission', err.message);
    }
}
async function saveContactFormSubmission(data) {
    const { topic, userEmail, userId, message } = asContactFormSubmissionData(data);
    if (!topicIsValid(topic) || !(0, isEmail_1.default)(userEmail) || !messageIsValid(message))
        throw new Errors_1.InputError('Contact form submission data not valid');
    await newrelic_1.default.startSegment('service:contactFormSubmission:saveToDatabase', true, async () => {
        try {
            if (!userId) {
                await ContactFormSubmissionRepo.createContactFormByEmail(message, topic, userEmail);
            }
            else {
                await ContactFormSubmissionRepo.createContactFormByUser(userId, message, topic);
            }
        }
        catch (err) {
            throw err;
        }
    });
    await newrelic_1.default.startSegment('service:contactFormSubmission:sendEmail', true, async () => {
        try {
            await sendContactForm(userEmail, message, topic);
        }
        catch (err) {
            throw err;
        }
    });
}
exports.saveContactFormSubmission = saveContactFormSubmission;
