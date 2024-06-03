"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_TYPES = exports.CHATBOT_CACHE_KEY = exports.CHATBOT_EMAIL = exports.SESSION_ACTIVITY_KEY = exports.SESSION_REPORT_REASON = exports.TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP = exports.USER_SESSION_METRICS = void 0;
var USER_SESSION_METRICS;
(function (USER_SESSION_METRICS) {
    USER_SESSION_METRICS["absentStudent"] = "Absent student";
    USER_SESSION_METRICS["absentVolunteer"] = "Absent volunteer";
    USER_SESSION_METRICS["lowSessionRatingFromCoach"] = "Low session rating from coach";
    USER_SESSION_METRICS["lowSessionRatingFromStudent"] = "Low session rating from student";
    USER_SESSION_METRICS["lowCoachRatingFromStudent"] = "Low coach rating from student";
    USER_SESSION_METRICS["reported"] = "Reported";
    USER_SESSION_METRICS["onlyLookingForAnswers"] = "Pressuring coach";
    USER_SESSION_METRICS["rudeOrInappropriate"] = "Mean or inappropriate";
    USER_SESSION_METRICS["commentFromStudent"] = "Comment from student";
    USER_SESSION_METRICS["commentFromVolunteer"] = "Comment from volunteer";
    USER_SESSION_METRICS["hasBeenUnmatched"] = "Has been unmatched";
    USER_SESSION_METRICS["hasHadTechnicalIssues"] = "Has had technical issues";
    USER_SESSION_METRICS["personalIdentifyingInfo"] = "PII";
    USER_SESSION_METRICS["gradedAssignment"] = "Graded assignment";
    USER_SESSION_METRICS["coachUncomfortable"] = "Coach uncomfortable";
    USER_SESSION_METRICS["studentCrisis"] = "Student in distress";
    USER_SESSION_METRICS["coachReportedStudentDm"] = "Coach reported student DM";
    USER_SESSION_METRICS["studentReportedCoachDm"] = "Student reported coach DM";
})(USER_SESSION_METRICS = exports.USER_SESSION_METRICS || (exports.USER_SESSION_METRICS = {}));
// amount of volunteers to text notifications to per session
exports.TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP = 15;
exports.SESSION_REPORT_REASON = {
    STUDENT_RUDE: 'This student was extremely rude or inappropriate',
    STUDENT_SAFETY: 'I am worried for the immediate safety of this student',
    COACH_DM_TO_STUDENT_CONNECT_OFFLINE: 'Coach asked me to connect off of UPchieve',
    COACH_DM_TO_STUDENT_FELT_UNCOMFORTABLE: 'Coach made me feel uncomfortable or unsafe',
    COACH_DM_TO_STUDENT_INAPPROPRIATE_LANGUAGE: 'Coach used inappropriate language',
    COACH_DM_TO_STUDENT_TALKED_INAPPROPRIATE: 'Coach talked about inappropriate and offensive topics',
};
exports.SESSION_ACTIVITY_KEY = 'activity-prompt';
exports.CHATBOT_EMAIL = 'chatbot@upchieve.org';
exports.CHATBOT_CACHE_KEY = 'chatbot';
var TOOL_TYPES;
(function (TOOL_TYPES) {
    TOOL_TYPES["WHITEBOARD"] = "whiteboard";
    TOOL_TYPES["DOCUMENT_EDITOR"] = "documenteditor";
})(TOOL_TYPES = exports.TOOL_TYPES || (exports.TOOL_TYPES = {}));
