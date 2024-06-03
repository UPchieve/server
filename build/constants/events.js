"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_EVENTS = exports.STUDENT_EVENTS = exports.USM_EVENTS = exports.FEEDBACK_EVENTS = exports.SESSION_EVENTS = void 0;
var SESSION_EVENTS;
(function (SESSION_EVENTS) {
    SESSION_EVENTS["SESSION_ENDED"] = "session-ended";
    SESSION_EVENTS["SESSION_REPORTED"] = "session-reported";
    SESSION_EVENTS["SESSION_METRICS_CALCULATED"] = "session-metrics-calculated";
    SESSION_EVENTS["PAST_SESSION_ADDED"] = "past-session-added";
    SESSION_EVENTS["SESSION_FLAGS_SET"] = "session-flags-set";
    SESSION_EVENTS["FEEDBACK_FLAGS_SET"] = "feedback-flags-set";
    SESSION_EVENTS["REPORT_FLAGS_SET"] = "report-flags-set";
    SESSION_EVENTS["SESSION_REVIEW_REASONS_SET"] = "session-review-reasons-set";
    SESSION_EVENTS["FEEDBACK_REVIEW_REASONS_SET"] = "feedback-review-reasons-set";
    SESSION_EVENTS["REPORT_REVIEW_REASONS_SET"] = "report-review-reasons-set";
})(SESSION_EVENTS = exports.SESSION_EVENTS || (exports.SESSION_EVENTS = {}));
var FEEDBACK_EVENTS;
(function (FEEDBACK_EVENTS) {
    FEEDBACK_EVENTS["FEEDBACK_SAVED"] = "feedback-saved";
})(FEEDBACK_EVENTS = exports.FEEDBACK_EVENTS || (exports.FEEDBACK_EVENTS = {}));
var USM_EVENTS;
(function (USM_EVENTS) {
    USM_EVENTS["SESSION_PROCESSORS_READY"] = "session-processors-ready";
    USM_EVENTS["FEEDBACK_PROCESSORS_READY"] = "feedback-processors-ready";
    USM_EVENTS["REPORT_PROCESSORS_READY"] = "report-processors-ready";
})(USM_EVENTS = exports.USM_EVENTS || (exports.USM_EVENTS = {}));
var STUDENT_EVENTS;
(function (STUDENT_EVENTS) {
    STUDENT_EVENTS["STUDENT_CREATED"] = "student-created";
})(STUDENT_EVENTS = exports.STUDENT_EVENTS || (exports.STUDENT_EVENTS = {}));
var USER_EVENTS;
(function (USER_EVENTS) {
    USER_EVENTS["USER_CREATED"] = "user-created";
})(USER_EVENTS = exports.USER_EVENTS || (exports.USER_EVENTS = {}));
