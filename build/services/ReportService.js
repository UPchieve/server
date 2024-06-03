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
exports.deleteReport = exports.getAnalyticsReport = exports.writeAnalyticsReport = exports.generatePartnerAnalyticsReport = exports.getTelecomReport = exports.usageReport = exports.sessionReport = exports.ReportNoDataFoundError = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const exceljs_1 = __importDefault(require("exceljs"));
const uuid_1 = require("uuid");
const ts_custom_error_1 = require("ts-custom-error");
const logger_1 = __importDefault(require("../logger"));
const config_1 = __importDefault(require("../config"));
const reportUtils_1 = require("../utils/reportUtils");
const Errors_1 = require("../models/Errors");
const VolunteerService = __importStar(require("./VolunteerService"));
const type_utils_1 = require("../utils/type-utils");
const StudentRepo = __importStar(require("../models/Student/queries"));
const VolunteerRepo = __importStar(require("../models/Volunteer/queries"));
const VolunteerPartnerOrgRepo = __importStar(require("../models/VolunteerPartnerOrg/queries"));
const AssociatedPartner_1 = require("../models/AssociatedPartner");
class ReportNoDataFoundError extends ts_custom_error_1.CustomError {
}
exports.ReportNoDataFoundError = ReportNoDataFoundError;
const fsPromises = fs_1.default.promises;
const getReportFilePath = (fileName) => `${config_1.default.fileWorkRootPath}/${(0, uuid_1.v4)()}/${fileName}.xlsx`;
const formatDate = (date) => {
    if (!date)
        return '--';
    return (0, moment_1.default)(date)
        .tz('America/New_York')
        .format('l h:mm a');
};
function dateStringToDateEST(dateString) {
    const currentUSEasternTime = moment_1.default.tz('America/New_York');
    const minutesOffset = currentUSEasternTime.utcOffset();
    // Add the EST/EDT offset to the UTC time
    const hoursOffset = Math.abs(minutesOffset / 60);
    const isStrictMode = true;
    const dateEST = (0, moment_1.default)(dateString, 'MM-DD-YYYY', isStrictMode)
        .utc()
        .startOf('day')
        .add(hoursOffset, 'hour')
        .toDate();
    return dateEST;
}
const sessionReport = async (data) => {
    const { sessionRangeFrom, sessionRangeTo, highSchoolId, studentPartnerOrg, studentPartnerSite, sponsorOrg, } = (0, reportUtils_1.validateStudentSessionReportQuery)(data);
    if (!highSchoolId && !studentPartnerOrg && !studentPartnerSite && !sponsorOrg)
        return [];
    const report = await StudentRepo.getSessionReport({
        highSchoolId,
        studentPartnerOrg,
        studentPartnerSite,
        sponsorOrg,
        start: dateStringToDateEST(sessionRangeFrom),
        end: dateStringToDateEST(sessionRangeTo),
    });
    if (report && report.length) {
        const formattedSessions = report.map(row => {
            return {
                Topic: row.topic,
                Subtopic: row.subject,
                'Created at': formatDate(row.createdAt),
                Messages: String(row.totalMessages),
                'First name': row.firstName,
                'Last name': row.lastName,
                Email: row.email,
                'Partner site': row.partnerSite ? row.partnerSite : '-',
                'Sponsor org': row.sponsorOrg ? row.sponsorOrg : '-',
                Volunteer: row.volunteerJoined,
                'Volunteer join date': row.volunteerJoinedAt
                    ? formatDate(row.volunteerJoinedAt)
                    : '',
                'Ended at': formatDate(row.endedAt),
                'Wait time': row.waitTimeMins ? `${row.waitTimeMins}mins` : '',
                'Session rating': row.sessionRating ? String(row.sessionRating) : '',
            };
        });
        return formattedSessions;
    }
    return [];
};
exports.sessionReport = sessionReport;
const usageReport = async (data) => {
    const { joinedBefore, joinedAfter, sessionRangeFrom, sessionRangeTo, highSchoolId, studentPartnerOrg, studentPartnerSite, sponsorOrg, } = (0, reportUtils_1.validateStudentUsageReportQuery)(data);
    if (!highSchoolId && !studentPartnerOrg && !studentPartnerSite && !sponsorOrg)
        return [];
    const report = await StudentRepo.getUsageReport({
        highSchoolId,
        studentPartnerOrg,
        studentPartnerSite,
        sponsorOrg,
        joinedStart: dateStringToDateEST(joinedAfter),
        joinedEnd: dateStringToDateEST(joinedBefore),
        sessionStart: dateStringToDateEST(sessionRangeFrom),
        sessionEnd: dateStringToDateEST(sessionRangeTo),
    });
    if (report && report.length) {
        const studentUsage = Promise.all(report.map(async (student) => {
            const dataFormat = {
                'First name': student.firstName,
                'Last name': student.lastName,
                Email: student.email,
                'Join date': formatDate(student.joinDate),
                'Total sessions': student.totalSessions,
                'Total minutes': student.totalSessionLengthMins,
                'Sessions over date range': student.rangeTotalSessions,
                'Minutes over date range': student.rangeSessionLengthMins,
                'High school name': student.school ? student.school : '',
                'Partner site': student.partnerSite ? student.partnerSite : '-',
                'HS/College': student.school ? 'High school' : 'College',
                'Sponsor Org': student.sponsorOrg ? student.sponsorOrg : undefined,
                'Partner Org': student.studentPartnerOrg
                    ? student.studentPartnerOrg
                    : '',
            };
            return dataFormat;
        }));
        return studentUsage;
    }
    return [];
};
exports.usageReport = usageReport;
const asTelecomReportPayload = (0, type_utils_1.asFactory)({
    partnerOrg: type_utils_1.asString,
    startDate: type_utils_1.asString,
    endDate: type_utils_1.asString,
});
async function getTelecomReport(data) {
    // Only generate the telecom report for a specific partner
    const { partnerOrg, startDate, endDate } = asTelecomReportPayload(data);
    if (!partnerOrg ||
        !config_1.default.customVolunteerPartnerOrgs.some(org => org === partnerOrg))
        return [];
    try {
        const volunteers = await VolunteerRepo.getVolunteersForTelecomReport(partnerOrg);
        return await (0, reportUtils_1.generateTelecomReport)(volunteers, new Date(startDate), new Date(endDate));
    }
    catch (error) {
        logger_1.default.error(error);
        throw new Error(error.message);
    }
}
exports.getTelecomReport = getTelecomReport;
/**
 * Processes a batch of volunteers for the analytics report and mutates 'report' with the results.
 * This function is written for memory efficiency. As such, the batch should be confined to the scope of this function/
 * not returned.
 *
 * @param report - A collection of rows for the report. This is mutated by this function.
 * @returns the cursor of the next page, or null if on the last page
 */
async function processBatch(partnerOrg, start, end, associatedPartners, batchSize, cursor, report) {
    var _a, _b;
    const batch = await VolunteerRepo.getVolunteersForAnalyticsReport(partnerOrg, start, end, associatedPartners, batchSize + 1, // get an extra row for the cursor
    cursor);
    const nextCursor = batch.length < batchSize + 1 ? null : (_b = (_a = batch.pop()) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : null;
    // Fetch individual volunteer data
    for (const volunteer of batch) {
        const hourSummaryTotal = await VolunteerService.getHourSummaryStats(volunteer.userId, new Date(volunteer.createdAt), (0, moment_1.default)()
            .utc()
            .toDate());
        const hourSummaryDateRange = await VolunteerService.getHourSummaryStats(volunteer.userId, start, end);
        const volunteerWithAnalytics = {
            ...volunteer,
            hourSummaryTotal,
            hourSummaryDateRange,
        };
        const row = (0, reportUtils_1.getAnalyticsReportRow)(volunteerWithAnalytics);
        report.push(row);
    }
    return nextCursor;
}
async function generatePartnerAnalyticsReport(partnerOrg, partnerOrgId, startDate, endDate) {
    const logData = {
        volunteerPartnerOrgId: partnerOrgId,
    };
    const start = (0, moment_1.default)(startDate, 'MM-DD-YYYY').toDate();
    const end = (0, moment_1.default)(endDate, 'MM-DD-YYYY').toDate();
    const report = [];
    const batchSize = config_1.default.corporatePartnerReports.batchSize;
    logger_1.default.info(logData, `Partner analytics report: Using batchSize=${batchSize}`);
    const associatedPartners = await (0, AssociatedPartner_1.getAssociatedPartnersAndSchools)(partnerOrg);
    let batchNum;
    let nextCursor = null;
    do {
        batchNum = report.length / batchSize + 1;
        logger_1.default.info(logData, `Partner analytics report: Attempting to fetch volunteer batch #${batchNum}`);
        nextCursor = await processBatch(partnerOrg, start, end, associatedPartners, batchSize, nextCursor, report);
        logger_1.default.info(logData, `Partner analytics report: Completed batch #${batchNum}`);
    } while (nextCursor);
    logger_1.default.info(logData, 'Generated all volunteer rows for analytics report');
    let summary = {};
    if (report.length > 0) {
        summary = await (0, reportUtils_1.getAnalyticsReportSummary)(partnerOrg, report, start, end);
        logger_1.default.info(logData, 'Finished generating partner analytics report summary');
    }
    return { summary, report };
}
exports.generatePartnerAnalyticsReport = generatePartnerAnalyticsReport;
async function writeAnalyticsReport(data, startDate, endDate, partnerOrg) {
    const reportFilePath = getReportFilePath("analytics-report" /* REPORT_FILE_NAMES.ANALYTICS_REPORT */);
    await fsPromises.mkdir(path_1.default.parse(reportFilePath).dir, { recursive: true });
    const workbook = new exceljs_1.default.stream.xlsx.WorkbookWriter({
        filename: reportFilePath,
        useStyles: true, // include this option to apply styling to streams
    });
    const sheetOptions = {
        pageSetup: {
            orientation: 'landscape',
            showGridLines: true,
            showRowColHeaders: true,
        },
    };
    const summarySheet = workbook.addWorksheet('Summary', sheetOptions);
    const dataSheet = workbook.addWorksheet('Data', sheetOptions);
    const formattedStartDate = (0, moment_1.default)(startDate, 'MM-DD-YYYY').format('MM/DD/YY');
    const formattedEndDate = (0, moment_1.default)(endDate, 'MM-DD-YYYY').format('MM/DD/YY');
    const partner = await VolunteerPartnerOrgRepo.getFullVolunteerPartnerOrgByKey(partnerOrg);
    const partnerName = partner.name;
    (0, reportUtils_1.processAnalyticsReportSummarySheet)(data.summary, summarySheet, formattedStartDate, formattedEndDate, partnerOrg, partnerName);
    (0, reportUtils_1.processAnalyticsReportDataSheet)(data.report, dataSheet, formattedStartDate, formattedEndDate, partnerOrg, partnerName);
    summarySheet.commit();
    dataSheet.commit();
    await workbook.commit();
    return reportFilePath;
}
exports.writeAnalyticsReport = writeAnalyticsReport;
async function getAnalyticsReport(data) {
    try {
        const { partnerOrg, partnerOrgId, startDate, endDate, } = await (0, reportUtils_1.validateVolunteerReportQuery)(data);
        const logData = {
            volunteerPartnerOrgId: partnerOrgId,
        };
        logger_1.default.info(logData, 'Beginning partner analytics report generation');
        const analyticsReport = await generatePartnerAnalyticsReport(partnerOrg, partnerOrgId, startDate, endDate);
        if (analyticsReport.report.length === 0)
            throw new ReportNoDataFoundError(`No analytics report data for partner with id=${partnerOrgId}`);
        logger_1.default.info(logData, `Generated partner analytics report with length=${analyticsReport.report.length}`);
        const reportFilePath = await writeAnalyticsReport(analyticsReport, startDate, endDate, partnerOrg);
        logger_1.default.info(logData, 'Finished writing partner analytics report');
        return reportFilePath;
    }
    catch (error) {
        logger_1.default.error(error);
        if (error instanceof Errors_1.InputError)
            throw error;
        throw new Error('Something went wrong while generating the analytics report');
    }
}
exports.getAnalyticsReport = getAnalyticsReport;
async function deleteReport(reportFilePath) {
    try {
        await fsPromises.rm(path_1.default.parse(reportFilePath).dir, { recursive: true });
    }
    catch (error) {
        logger_1.default.error(error);
        throw new Error(error.message);
    }
}
exports.deleteReport = deleteReport;
