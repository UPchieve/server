"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTriggerMetricActions = exports.processVolunteerUpdateQuery = exports.processStudentUpdateQuery = exports.processReportReviewReasons = exports.processFeedbackReviewReasons = exports.processSessionReviewReasons = exports.processReportFlags = exports.processFeedbackFlags = exports.processSessionFlags = exports.metricProcessorFactory = exports.prepareMetrics = exports.getValuesToPrepareMetrics = exports.prepareReportProcessors = exports.prepareFeedbackProcessors = exports.prepareSessionProcessors = void 0;
const Session_1 = require("../../models/Session");
const UserSessionMetrics_1 = require("../../models/UserSessionMetrics");
const constants_1 = require("../../constants");
const EventsService_1 = require("../EventsService");
const logger_1 = __importDefault(require("../../logger"));
const safe_async_1 = require("../../utils/safe-async");
const metrics_1 = require("./metrics");
const type_utils_1 = require("../../utils/type-utils");
const Survey_1 = require("../../models/Survey");
const SESSION_METRICS_PROCESSORS = [];
const FEEDBACK_METRICS_PROCESSORS = [];
const REPORT_METRICS_PROCESSORS = [];
for (const metric of Object.values(metrics_1.METRIC_PROCESSORS)) {
    if (metric.requiresFeedback)
        FEEDBACK_METRICS_PROCESSORS.push(metric);
    // Reported metric is run separately from others since isReported is not guaranteed to be accurate at session end
    else if (metric.key === 'Reported')
        REPORT_METRICS_PROCESSORS.push(metric);
    else
        SESSION_METRICS_PROCESSORS.push(metric);
}
// registered as listener on session-ended
async function prepareSessionProcessors(sessionId) {
    const { session, studentUSM, volunteerUSM, surveyResponses, } = await getValuesToPrepareMetrics(sessionId);
    const payload = await prepareMetrics(SESSION_METRICS_PROCESSORS, session, studentUSM, volunteerUSM, surveyResponses);
    EventsService_1.emitter.emit(constants_1.USM_EVENTS.SESSION_PROCESSORS_READY, payload);
}
exports.prepareSessionProcessors = prepareSessionProcessors;
// registered as listener on feedback-saved
async function prepareFeedbackProcessors(sessionId) {
    const { session, studentUSM, volunteerUSM, surveyResponses, } = await getValuesToPrepareMetrics(sessionId);
    const payload = await prepareMetrics(FEEDBACK_METRICS_PROCESSORS, session, studentUSM, volunteerUSM, surveyResponses);
    EventsService_1.emitter.emit(constants_1.USM_EVENTS.FEEDBACK_PROCESSORS_READY, payload);
}
exports.prepareFeedbackProcessors = prepareFeedbackProcessors;
// registered as listener on session-reported
async function prepareReportProcessors(sessionId) {
    const { session, studentUSM, volunteerUSM, surveyResponses, } = await getValuesToPrepareMetrics((0, type_utils_1.asString)(sessionId));
    const payload = await prepareMetrics(REPORT_METRICS_PROCESSORS, session, studentUSM, volunteerUSM, surveyResponses);
    EventsService_1.emitter.emit(constants_1.USM_EVENTS.REPORT_PROCESSORS_READY, payload);
}
exports.prepareReportProcessors = prepareReportProcessors;
async function getValuesToPrepareMetrics(sessionId) {
    const session = await (0, Session_1.getSessionById)(sessionId);
    const surveyResponses = await (0, Survey_1.getPostsessionSurveyResponsesForSessionMetrics)(sessionId);
    const uvd = { session };
    const studentUSM = await (0, UserSessionMetrics_1.getUSMByUserId)(uvd.session.studentId);
    if (!studentUSM)
        throw new Error(`Could not find USM for student ${uvd.session.studentId}`);
    let volunteerUSM;
    if (uvd.session.volunteerId) {
        volunteerUSM = await (0, UserSessionMetrics_1.getUSMByUserId)(uvd.session.volunteerId);
        if (!volunteerUSM)
            throw new Error(`Could not find USM for volunteer ${uvd.session.volunteerId}`);
    }
    return {
        session,
        studentUSM,
        volunteerUSM,
        surveyResponses,
    };
}
exports.getValuesToPrepareMetrics = getValuesToPrepareMetrics;
async function prepareMetrics(metrics, session, studentUSM, volunteerUSM, surveyResponses) {
    const messages = await (0, Session_1.getMessagesForFrontend)(session.id);
    const uvd = { session, messages, surveyResponses };
    const outputs = {};
    for (const metric of metrics) {
        try {
            outputs[metric.constructor.name] = metric.computeUpdateValue(uvd);
        }
        catch (err) {
            logger_1.default.error(`Metrics processor ${metric.constructor.name} failed to compute update value`);
        }
    }
    return {
        session: uvd.session,
        studentUSM,
        volunteerUSM,
        outputs,
    };
}
exports.prepareMetrics = prepareMetrics;
/**
 * Provides a standard interface for iterating over a set of MetricProcessor
 * Executes a given MetricProcessor method for all metrics and accumulates results
 * Flatten results by providing a reducer and execute any side-effects asynchronously
 *
 * Register functions created by factory on a '{foo}-processors-ready' event
 *
 * @param {string} opName name of method on MetricProcessor subtype
 * @param {function} reduce transform opName output into desired shape for side-effect processing
 * @param {function} fn execute side effects based on output of reduce and the current session/usm
 * @returns {function} metric processor event handler function
 */
function metricProcessorFactory(processors, opName, reduce, fn) {
    return async (payload) => {
        const { session, studentUSM, volunteerUSM, outputs } = payload;
        const acc = [];
        const errors = [];
        for (const key in outputs) {
            const processor = processors[key];
            if (processor &&
                processor.hasOwnProperty(opName) &&
                typeof processor[opName] === 'function') {
                const processorData = {
                    session,
                    studentUSM,
                    volunteerUSM,
                    value: outputs[key],
                };
                try {
                    acc.push(await processor[opName](processorData));
                }
                catch (err) {
                    if (err instanceof Error)
                        errors.push(`${key}.${opName}(): ${err.message}`);
                }
            }
            else
                errors.push(`${key}.${opName} method does not exist`);
        }
        const result = reduce(acc);
        const { error } = await (0, safe_async_1.safeAsync)(fn(result, session));
        if (error)
            errors.push(error.message);
        if (errors.length)
            throw new Error(`errors processing ${opName}:\n${errors.join('\n')}`);
    };
}
exports.metricProcessorFactory = metricProcessorFactory;
// registered as listener on session-processors-ready
exports.processSessionFlags = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeFlag', (acc) => acc.flat(), async (flags, session) => {
    try {
        await (0, Session_1.updateSessionFlagsById)(session.id, flags);
        EventsService_1.emitter.emit(constants_1.SESSION_EVENTS.SESSION_FLAGS_SET, session.id);
    }
    catch (err) {
        throw new Error(`failed to set flags for session ${session.id} - ${err}`);
    }
});
// registered as listener on feedback-processors-ready
exports.processFeedbackFlags = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeFlag', (acc) => acc.flat(), async (flags, session) => {
    try {
        await (0, Session_1.updateSessionFlagsById)(session.id, flags);
        EventsService_1.emitter.emit(constants_1.SESSION_EVENTS.FEEDBACK_FLAGS_SET, session.id);
    }
    catch (err) {
        throw new Error(`failed to set flags for session ${session.id} - ${err}`);
    }
});
// registered as listener on report-processors-ready
exports.processReportFlags = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeFlag', (acc) => acc.flat(), async (flags, session) => {
    try {
        await (0, Session_1.updateSessionFlagsById)(session.id, flags);
        EventsService_1.emitter.emit(constants_1.SESSION_EVENTS.REPORT_FLAGS_SET, session.id);
    }
    catch (err) {
        throw new Error(`failed to set flags for session ${session.id} - ${err}`);
    }
});
// registered as listener on session-processors-ready
exports.processSessionReviewReasons = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeReviewReason', (acc) => acc.flat(), async (reasons, session) => {
    try {
        if (reasons.length) {
            await (0, Session_1.updateSessionReviewReasonsById)(session.id, reasons);
            EventsService_1.emitter.emit(constants_1.SESSION_EVENTS.SESSION_REVIEW_REASONS_SET, session.id.toString());
        }
    }
    catch (err) {
        throw new Error(`failed to set review reason for session ${session.id} - ${err}`);
    }
});
// registered as listener on feedback-processors-ready
exports.processFeedbackReviewReasons = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeReviewReason', (acc) => acc.flat(), async (reasons, session) => {
    try {
        if (reasons.length) {
            await (0, Session_1.updateSessionReviewReasonsById)(session.id, reasons);
            EventsService_1.emitter.emit(constants_1.SESSION_EVENTS.FEEDBACK_REVIEW_REASONS_SET, session.id.toString());
        }
    }
    catch (err) {
        throw new Error(`failed to set review reason for session ${session.id} - ${err}`);
    }
});
// registered as listener on report-processors-ready
exports.processReportReviewReasons = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeReviewReason', (acc) => acc.flat(), async (reasons, session) => {
    try {
        if (reasons.length) {
            await (0, Session_1.updateSessionReviewReasonsById)(session.id, reasons);
            EventsService_1.emitter.emit(constants_1.SESSION_EVENTS.REPORT_REVIEW_REASONS_SET, session.id.toString());
        }
    }
    catch (err) {
        throw new Error(`failed to set review reason for session ${session.id} - ${err}`);
    }
});
// registered as listener on {ANY}-processors-ready
exports.processStudentUpdateQuery = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeStudentUpdateQuery', (acc) => acc, async (updates, session) => {
    try {
        await (0, UserSessionMetrics_1.executeUSMUpdatesByUserId)(session.studentId, updates);
    }
    catch (err) {
        throw new Error(`failed to update USM for user ${session.studentId} - ${err}`);
    }
});
// registered as listener on {ANY}-processors-ready
exports.processVolunteerUpdateQuery = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'computeVolunteerUpdateQuery', (acc) => acc, async (updates, session) => {
    try {
        if (session.volunteerId)
            await (0, UserSessionMetrics_1.executeUSMUpdatesByUserId)(session.volunteerId, updates);
    }
    catch (err) {
        throw new Error(`failed to update USM for user ${session.volunteerId} - ${err}`);
    }
});
// registered as listener on {ANY}-processors-ready
exports.processTriggerMetricActions = metricProcessorFactory(metrics_1.METRIC_PROCESSORS, 'triggerActions', (acc) => acc.flat(), async (actions, session) => {
    const results = await Promise.allSettled(actions);
    results.forEach(result => {
        if (result.status === 'rejected')
            logger_1.default.error(`failed to trigger side effect action for session: ${session.id} - error: ${result.reason}`);
    });
});
