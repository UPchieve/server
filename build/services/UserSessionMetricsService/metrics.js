"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.METRIC_PROCESSORS = void 0;
const constants_1 = require("../../constants");
const QueueService_1 = __importDefault(require("../QueueService"));
const jobs_1 = require("../../worker/jobs");
const types_1 = require("./types");
const moment_1 = __importDefault(require("moment"));
class AbsentStudent extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.absentStudent;
        this.requiresFeedback = false;
        this.computeUpdateValue = (uvd) => {
            const VOLUNTEER_WAITING_PERIOD_MIN = 10;
            if (uvd.session.volunteerJoinedAt) {
                const volunteerMaxWait = (0, moment_1.default)(uvd.session.volunteerJoinedAt).add(VOLUNTEER_WAITING_PERIOD_MIN, 'minutes');
                // if volunteer waits for less than 10 minutes, do not flag student bc student did not get a chance to respond within wait period
                if ((0, moment_1.default)(uvd.session.endedAt).isSameOrBefore(volunteerMaxWait))
                    return 0;
                for (const msg of uvd.messages) {
                    if (msg.user === uvd.session.studentId &&
                        // if student sends message after volunteer joined, then don't flag student
                        (0, moment_1.default)(msg.createdAt).isAfter(uvd.session.volunteerJoinedAt))
                        return 0;
                }
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 4
            ? [this.key]
            : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = (pd) => {
            const actions = [];
            if (!pd.value)
                return actions;
            // Send a warning email to the student about ghosting volunteers the first time the he or she is absent
            if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
                actions.push(QueueService_1.default.add(jobs_1.Jobs.EmailStudentAbsentWarning, {
                    sessionSubtopic: pd.session.subjectDisplayName,
                    sessionDate: pd.session.createdAt,
                    studentId: pd.session.studentId,
                    volunteerId: pd.session.volunteerId,
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                }));
            // Send an apology email to the volunteer the first time he or she encounters an absent student
            if (pd.volunteerUSM &&
                this.computeFinalValue(pd.volunteerUSM, pd.value) === 1)
                actions.push(QueueService_1.default.add(jobs_1.Jobs.EmailVolunteerAbsentStudentApology, {
                    sessionSubtopic: pd.session.subjectDisplayName,
                    sessionDate: pd.session.createdAt,
                    studentId: pd.session.studentId,
                    volunteerId: pd.session.volunteerId,
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                }));
            return actions;
        };
    }
}
class AbsentVolunteer extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.absentVolunteer;
        this.requiresFeedback = false;
        this.computeUpdateValue = (uvd) => {
            const STUDENT_WAITING_PERIOD_MIN = 5;
            if (uvd.session.volunteerJoinedAt) {
                const studentMaxWait = (0, moment_1.default)(uvd.session.volunteerJoinedAt).add(STUDENT_WAITING_PERIOD_MIN, 'minutes');
                //if student waits for less than 5 minutes, then not flag volunteer
                if ((0, moment_1.default)(uvd.session.endedAt).isSameOrBefore(studentMaxWait))
                    return 0;
                for (const msg of uvd.messages) {
                    if (
                    // if volunteer sends message, then don't flag volunteer
                    msg.user === uvd.session.volunteerId)
                        return 0;
                }
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value &&
            pd.volunteerUSM &&
            this.computeFinalValue(pd.volunteerUSM, pd.value) >= 2
            ? [this.key]
            : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = (pd) => {
            const actions = [];
            if (!pd.value)
                return actions;
            // Send a warning email to the volunteer about ghosting students the first time he or she is absent
            if (pd.volunteerUSM &&
                this.computeFinalValue(pd.volunteerUSM, pd.value) === 1)
                actions.push(QueueService_1.default.add(jobs_1.Jobs.EmailVolunteerAbsentWarning, {
                    sessionSubtopic: pd.session.subjectDisplayName,
                    sessionDate: pd.session.createdAt,
                    studentId: pd.session.studentId,
                    volunteerId: pd.session.volunteerId,
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                }));
            // Send an apology email to the student the first time he or she encounters an absent volunteer
            if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
                actions.push(QueueService_1.default.add(jobs_1.Jobs.EmailStudentAbsentVolunteerApology, {
                    sessionSubtopic: pd.session.subjectDisplayName,
                    sessionDate: pd.session.createdAt,
                    studentId: pd.session.studentId,
                    volunteerId: pd.session.volunteerId,
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                }));
            return actions;
        };
    }
}
class LowCoachRatingFromStudent extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.lowCoachRatingFromStudent;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a, _b;
            const coachRatingFromStudent = (_b = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.questionText === 'Overall, how supportive was your coach today?')) === null || _b === void 0 ? void 0 : _b.score;
            if (coachRatingFromStudent && coachRatingFromStudent <= 2) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class LowSessionRatingFromStudent extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.lowSessionRatingFromStudent;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a, _b;
            const sessionRatingFromSTudent = (_b = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.questionText.endsWith('Did UPchieve help you achieve your goal?'))) === null || _b === void 0 ? void 0 : _b.score;
            if (sessionRatingFromSTudent && sessionRatingFromSTudent <= 2) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class LowSessionRatingFromCoach extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.lowSessionRatingFromCoach;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a, _b;
            const sessionRatingFromCoach = (_b = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.questionText.endsWith('Were you able to help them achieve their goal?'))) === null || _b === void 0 ? void 0 : _b.score;
            if (sessionRatingFromCoach && sessionRatingFromCoach <= 2) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class Reported extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.reported;
        this.requiresFeedback = false;
        this.computeUpdateValue = (uvd) => uvd.session.reported ? 1 : 0;
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class RudeOrInappropriate extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.rudeOrInappropriate;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const meanOrInappropriate = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.response === 'Student was mean or inappropriate');
            if (meanOrInappropriate) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 2
            ? [this.key]
            : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class OnlyLookingForAnswers extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.onlyLookingForAnswers;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const onlyLookingForAnswers = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.response === 'Student was pressuring me to do their work for them');
            if (onlyLookingForAnswers) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 2
            ? [this.key]
            : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = (pd) => {
            if (pd.value && this.computeFinalValue(pd.studentUSM, pd.value) === 1)
                return [
                    QueueService_1.default.add(jobs_1.Jobs.EmailStudentOnlyLookingForAnswers, {
                        sessionSubtopic: pd.session.subjectDisplayName,
                        sessionDate: pd.session.createdAt,
                        studentId: pd.session.studentId,
                        volunteerId: pd.session.volunteerId,
                    }, {
                        removeOnComplete: true,
                        removeOnFail: true,
                    }),
                ];
            else
                return types_1.NO_ACTIONS;
        };
    }
}
class CommentFromStudent extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.commentFromStudent;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const studentComment = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.questionText === 'Your thoughts' && resp.userRole === 'student');
            if (studentComment) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = () => types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class CommentFromVolunteer extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.commentFromVolunteer;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const volunteerComment = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.questionText === 'Your thoughts' && resp.userRole === 'volunteer');
            if (volunteerComment) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = () => types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class HasBeenUnmatched extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.hasBeenUnmatched;
        this.requiresFeedback = false;
        this.computeUpdateValue = (uvd) => !uvd.session.volunteerId ? 1 : 0;
        this.computeReviewReason = () => types_1.NO_FLAGS;
        this.computeFlag = () => types_1.NO_FLAGS;
        this.triggerActions = (pd) => {
            const actions = [];
            if (!pd.value)
                return actions;
            // Send an apology email to the student the first time their session is unmatched
            if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
                actions.push(QueueService_1.default.add(jobs_1.Jobs.EmailStudentUnmatchedApology, {
                    sessionSubtopic: pd.session.subjectDisplayName,
                    sessionDate: pd.session.createdAt,
                    studentId: pd.session.studentId,
                    volunteerId: pd.session.volunteerId,
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                }));
            return actions;
        };
    }
}
class HasHadTechnicalIssues extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.hasHadTechnicalIssues;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const techIssues = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.response === 'Tech issue');
            if (techIssues) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = () => types_1.NO_FLAGS;
        this.computeFlag = () => types_1.NO_FLAGS;
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class PersonalIdentifyingInfo extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.personalIdentifyingInfo;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const personalInfo = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.response ===
                'Student shared their email, last name, or other personally identifiable information');
            if (personalInfo) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class GradedAssignment extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.gradedAssignment;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const gradedAssignment = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.response === 'Student was working on a quiz or exam');
            if (gradedAssignment) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class CoachUncomfortable extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.gradedAssignment;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const coachUncomfortable = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.response === 'Student made me feel uncomfortable');
            if (coachUncomfortable) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = () => types_1.NO_ACTIONS;
    }
}
class StudentCrisis extends types_1.CounterMetricProcessor {
    constructor() {
        super(...arguments);
        this.key = constants_1.USER_SESSION_METRICS.studentCrisis;
        this.requiresFeedback = true;
        this.computeUpdateValue = (uvd) => {
            var _a;
            const studentInCrisis = (_a = uvd.surveyResponses) === null || _a === void 0 ? void 0 : _a.find(resp => resp.response ===
                'Student is in severe emotional distress and/or unsafe');
            if (studentInCrisis) {
                return 1;
            }
            return 0;
        };
        this.computeReviewReason = (pd) => pd.value ? [this.key] : types_1.NO_FLAGS;
        this.computeFlag = (pd) => (pd.value ? [this.key] : types_1.NO_FLAGS);
        this.triggerActions = (pd) => {
            const actions = [];
            if (!pd.value)
                return actions;
            // If session was not reported, follow report workflow for emotiona distress
            if (!pd.session.reported) {
                actions.push(QueueService_1.default.add(jobs_1.Jobs.EmailSessionReported, {
                    studentId: pd.session.studentId,
                    reportReason: constants_1.SESSION_REPORT_REASON.STUDENT_SAFETY,
                    isBanReason: false,
                    sessionId: pd.session.id,
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                }));
            }
            return actions;
        };
    }
}
// export each metric as a singleton instance
exports.METRIC_PROCESSORS = {
    HasBeenUnmatched: new HasBeenUnmatched(),
    AbsentStudent: new AbsentStudent(),
    AbsentVolunteer: new AbsentVolunteer(),
    Reported: new Reported(),
    LowCoachRatingFromStudent: new LowCoachRatingFromStudent(),
    LowSessionRatingFromStudent: new LowSessionRatingFromStudent(),
    LowSessionRatingFromCoach: new LowSessionRatingFromCoach(),
    RudeOrInappropriate: new RudeOrInappropriate(),
    OnlyLookingForAnswers: new OnlyLookingForAnswers(),
    CommentFromStudent: new CommentFromStudent(),
    CommentFromVolunteer: new CommentFromVolunteer(),
    HasHadTechnicalIssues: new HasHadTechnicalIssues(),
    StudentCrisis: new StudentCrisis(),
    PersonalIdentifyingInfo: new PersonalIdentifyingInfo(),
    GradedAssignment: new GradedAssignment(),
    CoachUncomfortable: new CoachUncomfortable(),
};
