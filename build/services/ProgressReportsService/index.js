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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadProgressReportOverviewSubjects = exports.readProgressReportsByIds = exports.getLatestProgressReportSummaryBySubject = exports.getProgressReportSummariesBySubject = exports.getProgressReportSummaries = exports.getProgressReportsForSubjectPaginated = exports.getProgressReportForReport = exports.getProgressReportForUserSession = exports.getProgressReportDataAndDetails = exports.getProgressReportSummaryAndConcepts = exports.getProgressReportConcepts = exports.getProgressReportSummary = exports.queueGenerateProgressReportForUser = exports.generateProgressReport = exports.generateProgressReportForUser = exports.getSessionsToAnalyzeForProgressReport = exports.saveProgressReport = void 0;
const logger_1 = __importStar(require("../../logger"));
const db_1 = require("../../db");
const ProgressReports_1 = require("../../models/ProgressReports");
const Session_1 = require("../../models/Session");
const AnalyticsService_1 = require("../AnalyticsService");
const constants_1 = require("../../constants");
const moment_1 = __importDefault(require("moment"));
const BotsService_1 = require("../BotsService");
const QueueService_1 = __importDefault(require("../QueueService"));
const jobs_1 = require("../../worker/jobs");
__exportStar(require("./types"), exports);
const Errors_1 = require("../Errors");
const FeatureFlagService_1 = require("../FeatureFlagService");
function formatTranscriptMessage(message, userType) {
    return `${(0, moment_1.default)(message.createdAt).format('hh:mm:ss')} ${userType}: ${message.contents}\n`;
}
function formatTranscriptAndEditor(session) {
    let transcript = '';
    for (const message of session.messages) {
        const userType = message.user === session.studentId ? 'Student' : 'Tutor';
        transcript += formatTranscriptMessage(message, userType);
    }
    return `
    Session:
    ${transcript}

    Editor:
    ${session.quillDoc}
    `;
}
function formatSessionsForBotPrompt(sessions) {
    return sessions.map(formatTranscriptAndEditor).join('\n');
}
async function saveProgressReport(userId, sessionIds, data) {
    let reportId = '';
    try {
        if (!data.summary || !Object.keys(data.summary).length)
            throw new Error(`No progress report summary created for user ${userId} on session ${sessionIds.join(',')}`);
        if (!data.concepts || !data.concepts.length)
            throw new Error(`No progress report concepts created for user ${userId} on session ${sessionIds.join(',')}`);
        reportId = await (0, ProgressReports_1.insertProgressReport)(userId, 'pending');
        await (0, db_1.runInTransaction)(async (tc) => {
            const reportType = sessionIds.length > 1 ? 'group' : 'single';
            for (const sessionId of sessionIds) {
                await (0, ProgressReports_1.insertProgressReportSession)(reportId, sessionId, reportType, tc);
            }
            const reportSummaryId = await (0, ProgressReports_1.insertProgressReportSummary)(reportId, data.summary, tc);
            for (const detail of data.summary.details) {
                await (0, ProgressReports_1.insertProgressReportSummaryDetail)(reportSummaryId, detail, tc);
            }
            for (const concept of data.concepts) {
                const reportConceptId = await (0, ProgressReports_1.insertProgressReportConcept)(reportId, concept, tc);
                for (const detail of concept.details) {
                    await (0, ProgressReports_1.insertProgressReportConceptDetail)(reportConceptId, detail, tc);
                }
            }
            await (0, ProgressReports_1.updateProgressReportStatus)(reportId, 'complete');
        });
        return reportId;
    }
    catch (error) {
        (0, logger_1.logError)(error);
        if (reportId)
            await (0, ProgressReports_1.updateProgressReportStatus)(reportId, 'error');
        throw error;
    }
}
exports.saveProgressReport = saveProgressReport;
async function getSessionsToAnalyzeForProgressReport(userId, filter) {
    const sessions = await (0, Session_1.getUserSessionsByUserId)(userId, filter);
    const sessionsWithMessages = [];
    for (const session of sessions) {
        try {
            if (!session.volunteerId)
                continue;
            const messages = await (0, Session_1.getMessagesForFrontend)(session.id);
            sessionsWithMessages.push({ ...session, messages });
        }
        catch (error) {
            (0, logger_1.logError)(error);
        }
    }
    return sessionsWithMessages;
}
exports.getSessionsToAnalyzeForProgressReport = getSessionsToAnalyzeForProgressReport;
async function generateProgressReportForUser(userId, filter) {
    const sessions = await getSessionsToAnalyzeForProgressReport(userId, filter);
    const botPrompt = formatSessionsForBotPrompt(sessions);
    const botReport = await generateProgressReport(userId, botPrompt);
    (0, AnalyticsService_1.captureEvent)(userId, constants_1.EVENTS.PROGRESS_REPORT_ANALYSIS_COMPLETED, {
        response: botReport,
        debug: botReport,
    });
    const sessionIds = sessions.map(s => s.id);
    const reportId = await saveProgressReport(userId, sessionIds, botReport);
    if (!reportId)
        throw new Error(`Failed to save a progress report for sessions ${sessionIds.join(',')} for user ${userId}`);
    const report = await getProgressReportForReport(reportId);
    return report;
}
exports.generateProgressReportForUser = generateProgressReportForUser;
async function generateProgressReport(userId, botPrompt) {
    const completion = await BotsService_1.openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `Analyze transcripts from a series of high school reading tutoring sessions involving the same student. 
          Predict the topics for the student's next quiz and assess their likely performance. 
          Highlight the areas where the student is expected to excel, 
          based on the dialogue and editor content provided in each session. 
          The format of the transcripts is:

          Session:
          [hh:mm:ss] Tutor: {message}
          [hh:mm:ss] Student: {message}
          
          Editor:
          {editorContent}
          
          The editor content is a JSON representation of a Quill Editor document in Quill's Delta format. 
          The Delta format is a series of operations applied to the document. 
          Both the student and the tutor can commit operations. You will not know the author of an operation, 
          although you can assume that students insert the early original content into the document; 
          tutors may make edits intended to represent annotations, corrections, examples, and other kinds of feedback; 
          and students may make additional edits to respond to the tutor's feedback. 
          
          Respond in a JSON format in the shape of ProgressReportResponse from the TypeScript types below

          // Types of assessment for a report, currently 'strength' and 'practiceArea', but designed to include more types in the future
          type ProgressFocusAreas = 'strength' | 'practiceArea'

          // Types of details for an assessment for a report, currently 'recommendation' and 'reason', scalable for additional types like 'prediction', etc.
          type ProgressInfoTypes = 'recommendation' | 'reason'

          type ProgressReportDetail = {
            // Content elaborating on the focusArea and infoType for a concept, specific to the student's performance or needs. The response should be
            // as if you're talking directly to the student
            content: string
            // Determines if the associated concept is categorized as a 'strength' or 'practiceArea', with flexibility for future assessment types
            focusArea: ProgressFocusAreas
            // Specifies the nature of the assessment detail, such as a 'recommendation' for improvement or a 'reason' explaining the assessment
            // If a 'practiceArea' is given, provide a recommendation for improvement
            infoType: ProgressInfoTypes
          }

          type ProgressReportSummary = {
            // Consolidated summary reflecting the overarching findings or conclusions from the assessment of all concepts. The response should be
            // as if you're talking directly to the student
            summary: string
            // Aggregated grade representing the overall performance level in the subject, on a scale of 65-100
            overallGrade: number
            // Compiled list of detailed assessments, each correlating to specific aspects of the concepts assessed
            details: ProgressReportDetail[]
          }

          type ProgressReportConcept = {
            // Identifier for the specific concept under assessment
            name: string
            // Concise description of the concept, providing context or background relevant to the assessment
            description: string
            // Numerical grade assigned to the concept, indicative of the student's performance or understanding, on a scale of 65-100
            grade: number
            // Collection of detailed assessments for the concept, encompassing various types and aspects of assessment
            details: ProgressReportDetail[]
          }

          type ProgressReportResponse = {
            // The summary section encapsulating an overall assessment and grade for the subject; an empty object indicates a summary couldn't be produced
            summary: ProgressReportSummary
            // Array of concepts (topics), each with detailed assessments; an empty array indicates no concepts to analyze
            concepts: ProgressReportConcept[]
          }

          The comments denoted by "//" provide guidance on what should be filled into each property.`,
            },
            {
                role: 'user',
                content: botPrompt,
            },
        ],
    });
    const response = completion.choices[0].message.content;
    logger_1.default.info(`User: ${userId} received ProgressReport completion ${completion} with response ${response}`);
    return response ? JSON.parse(response) : { summary: {}, concepts: [] };
}
exports.generateProgressReport = generateProgressReport;
async function queueGenerateProgressReportForUser(sessionId) {
    const session = await (0, Session_1.getSessionById)(sessionId);
    const isProgressReportsActive = await (0, FeatureFlagService_1.getProgressReportsFeatureFlag)(session.studentId);
    if (session.subject !== 'reading' || !isProgressReportsActive)
        return;
    await QueueService_1.default.add(jobs_1.Jobs.GenerateProgressReport, { sessionId }, { removeOnComplete: true, removeOnFail: true });
}
exports.queueGenerateProgressReportForUser = queueGenerateProgressReportForUser;
function transformProgressReportSummaryRows(rows) {
    const summaries = {};
    for (const row of rows) {
        if (!summaries[row.id]) {
            summaries[row.id] = {
                id: row.id,
                summary: row.summary,
                overallGrade: row.overallGrade,
                details: [],
                createdAt: row.createdAt,
                reportId: row.reportId,
                reportReadAt: row.reportReadAt,
                sessionCreatedAt: row.sessionCreatedAt,
            };
        }
        const detail = {
            id: row.detailId,
            content: row.content,
            focusArea: row.focusArea,
            infoType: row.infoType,
        };
        summaries[row.id].details.push(detail);
    }
    return Object.values(summaries);
}
function transformProgressReportConceptRows(rows) {
    const concepts = {};
    for (const row of rows) {
        if (!concepts[row.id]) {
            concepts[row.id] = {
                id: row.id,
                name: row.name,
                description: row.description,
                grade: row.grade,
                details: [],
                createdAt: row.createdAt,
                reportId: row.reportId,
                reportReadAt: row.reportReadAt,
            };
        }
        const detail = {
            id: row.detailId,
            content: row.content,
            focusArea: row.focusArea,
            infoType: row.infoType,
        };
        concepts[row.id].details.push(detail);
    }
    return Object.values(concepts);
}
async function getProgressReportSummary(reportId, tc) {
    const summaryRows = await (0, ProgressReports_1.getProgressReportSummariesForMany)([reportId], tc);
    const summaries = transformProgressReportSummaryRows(summaryRows);
    if (!summaries.length)
        throw new Error(`No summary found for report ${reportId}`);
    return summaries[0];
}
exports.getProgressReportSummary = getProgressReportSummary;
async function getProgressReportConcepts(reportId, tc) {
    const conceptRows = await (0, ProgressReports_1.getProgressReportConceptsByReportId)(reportId, tc);
    const concepts = transformProgressReportConceptRows(conceptRows);
    if (!concepts.length)
        throw new Error(`No concepts found for report ${reportId}`);
    return concepts;
}
exports.getProgressReportConcepts = getProgressReportConcepts;
async function getProgressReportSummaryAndConcepts(reportId, tc) {
    const summary = await getProgressReportSummary(reportId, tc);
    const concepts = await getProgressReportConcepts(reportId, tc);
    return { summary, concepts };
}
exports.getProgressReportSummaryAndConcepts = getProgressReportSummaryAndConcepts;
async function getProgressReportDataAndDetails(getReportData, tc) {
    const reportData = await getReportData();
    if (!(reportData === null || reportData === void 0 ? void 0 : reportData.id)) {
        throw new Errors_1.ProgressReportNotFoundError('No report found');
    }
    const summaryAndConcepts = await getProgressReportSummaryAndConcepts(reportData.id, tc);
    return { ...reportData, ...summaryAndConcepts };
}
exports.getProgressReportDataAndDetails = getProgressReportDataAndDetails;
async function getProgressReportForUserSession(userId, sessionId) {
    return await (0, db_1.runInTransaction)(async (tc) => {
        return getProgressReportDataAndDetails(() => (0, ProgressReports_1.getProgressReportInfoBySessionId)(userId, sessionId, 'single', tc), tc);
    });
}
exports.getProgressReportForUserSession = getProgressReportForUserSession;
async function getProgressReportForReport(reportId) {
    return await (0, db_1.runInTransaction)(async (tc) => {
        return getProgressReportDataAndDetails(() => (0, ProgressReports_1.getProgressReportByReportId)(reportId, tc), tc);
    });
}
exports.getProgressReportForReport = getProgressReportForReport;
// TODO: Use cursor pagination
async function getProgressReportsForSubjectPaginated(userId, subject, page) {
    const limit = 5;
    const offset = (page - 1) * limit;
    const data = {
        subject,
        analysisType: 'single',
        limit,
        offset,
    };
    const sessions = await (0, ProgressReports_1.getProgressReportSessionsForSubjectByPagination)(userId, data);
    const isLastPage = sessions.length < limit;
    return { sessions, page, isLastPage };
}
exports.getProgressReportsForSubjectPaginated = getProgressReportsForSubjectPaginated;
async function getProgressReportSummaries(reportIds, tc) {
    const summaryRows = await (0, ProgressReports_1.getProgressReportSummariesForMany)(reportIds, tc);
    const summaries = transformProgressReportSummaryRows(summaryRows);
    return summaries;
}
exports.getProgressReportSummaries = getProgressReportSummaries;
async function getProgressReportSummariesBySubject(userId, subject) {
    const data = await (0, db_1.runInTransaction)(async (tc) => {
        const reportIds = await (0, ProgressReports_1.getAllProgressReportIdsByUserIdAndSubject)(userId, subject, 'group', tc);
        const summaries = await getProgressReportSummaries(reportIds, tc);
        return summaries;
    });
    return data;
}
exports.getProgressReportSummariesBySubject = getProgressReportSummariesBySubject;
async function getLatestProgressReportSummaryBySubject(userId, subject) {
    return await (0, db_1.runInTransaction)(async (tc) => {
        return getProgressReportDataAndDetails(() => (0, ProgressReports_1.getLatestProgressReportIdBySubject)(userId, subject, 'group', tc), tc);
    });
}
exports.getLatestProgressReportSummaryBySubject = getLatestProgressReportSummaryBySubject;
async function readProgressReportsByIds(reportIds) {
    await (0, ProgressReports_1.updateProgressReportsReadAtByReportIds)(reportIds);
}
exports.readProgressReportsByIds = readProgressReportsByIds;
async function getUnreadProgressReportOverviewSubjects(userId) {
    return await (0, ProgressReports_1.getUnreadProgressReportOverviewSubjectsByUserId)(userId);
}
exports.getUnreadProgressReportOverviewSubjects = getUnreadProgressReportOverviewSubjects;
