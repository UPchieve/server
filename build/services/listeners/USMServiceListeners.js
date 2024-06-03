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
exports.listeners = void 0;
const events_1 = require("../../constants/events");
const USMService = __importStar(require("../UserSessionMetricsService"));
const register_1 = __importDefault(require("./register"));
function listeners() {
    // prepare processors
    (0, register_1.default)(events_1.SESSION_EVENTS.SESSION_ENDED, USMService.prepareSessionProcessors, 'prepareSessionProcessors');
    (0, register_1.default)(events_1.FEEDBACK_EVENTS.FEEDBACK_SAVED, USMService.prepareFeedbackProcessors, 'prepareFeedbackProcessors');
    (0, register_1.default)(events_1.SESSION_EVENTS.SESSION_REPORTED, USMService.prepareReportProcessors, 'prepareReportProcessors');
    // process post-session metrics
    (0, register_1.default)(events_1.USM_EVENTS.SESSION_PROCESSORS_READY, USMService.processSessionFlags, 'processSessionFlags');
    (0, register_1.default)(events_1.USM_EVENTS.SESSION_PROCESSORS_READY, USMService.processSessionReviewReasons, 'processSessionReviewReasons');
    // process feedback metrics
    (0, register_1.default)(events_1.USM_EVENTS.FEEDBACK_PROCESSORS_READY, USMService.processFeedbackFlags, 'processFeedbackFlags');
    (0, register_1.default)(events_1.USM_EVENTS.FEEDBACK_PROCESSORS_READY, USMService.processFeedbackReviewReasons, 'processFeedbackReviewReasons');
    // process session reported metrics
    (0, register_1.default)(events_1.USM_EVENTS.REPORT_PROCESSORS_READY, USMService.processReportFlags, 'processReportFlags');
    (0, register_1.default)(events_1.USM_EVENTS.REPORT_PROCESSORS_READY, USMService.processReportReviewReasons, 'processReportReviewReasons');
    // save student metrics
    (0, register_1.default)(events_1.USM_EVENTS.SESSION_PROCESSORS_READY, USMService.processStudentUpdateQuery, 'processStudentUpdateQuery');
    (0, register_1.default)(events_1.USM_EVENTS.FEEDBACK_PROCESSORS_READY, USMService.processStudentUpdateQuery, 'processStudentUpdateQuery');
    (0, register_1.default)(events_1.USM_EVENTS.REPORT_PROCESSORS_READY, USMService.processStudentUpdateQuery, 'processStudentUpdateQuery');
    // save volunteer metrics
    (0, register_1.default)(events_1.USM_EVENTS.SESSION_PROCESSORS_READY, USMService.processVolunteerUpdateQuery, 'processVolunteerUpdateQuery');
    (0, register_1.default)(events_1.USM_EVENTS.FEEDBACK_PROCESSORS_READY, USMService.processVolunteerUpdateQuery, 'processVolunteerUpdateQuery');
    (0, register_1.default)(events_1.USM_EVENTS.REPORT_PROCESSORS_READY, USMService.processVolunteerUpdateQuery, 'processVolunteerUpdateQuery');
    // trigger side effects for the session e.g queueing apology emails
    (0, register_1.default)(events_1.USM_EVENTS.SESSION_PROCESSORS_READY, USMService.processTriggerMetricActions, 'processTriggerMetricActions');
    (0, register_1.default)(events_1.USM_EVENTS.FEEDBACK_PROCESSORS_READY, USMService.processTriggerMetricActions, 'processTriggerMetricActions');
    (0, register_1.default)(events_1.USM_EVENTS.REPORT_PROCESSORS_READY, USMService.processTriggerMetricActions, 'processTriggerMetricActions');
}
exports.listeners = listeners;
