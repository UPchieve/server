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
exports.validateStudentUsageReportQuery = exports.validateStudentSessionReportQuery = exports.validateStudentReportQuery = exports.validateJoinedDateRanges = exports.validateSessionDateRanges = exports.asValidateStudentUsageReportQuery = exports.asValidateStudentSessionReportQuery = exports.validateVolunteerReportQuery = exports.asValidateVolunteerReportQuery = exports.processAnalyticsReportSummarySheet = exports.processAnalyticsReportDataSheet = exports.applyAnalyticsReportSummaryStyles = exports.applyAnalyticsReportDataStyles = exports.getAnalyticsReportSummary = exports.getAnalyticsReportRow = exports.telecomHourSummaryStats = exports.emptyHours = exports.generateTelecomReport = void 0;
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const UserActionRepo = __importStar(require("../models/UserAction/queries"));
const SessionRepo = __importStar(require("../models/Session/queries"));
const logger_1 = __importDefault(require("../logger"));
const VolunteerRepo = __importStar(require("../models/Volunteer/queries"));
const Errors_1 = require("../models/Errors");
const count_certs_1 = __importDefault(require("./count-certs"));
const round_up_to_nearest_interval_1 = __importDefault(require("./round-up-to-nearest-interval"));
const type_utils_1 = require("./type-utils");
const config_1 = __importDefault(require("../config"));
const AvailabilityService_1 = require("../services/AvailabilityService");
const VolunteerPartnerOrgRepo = __importStar(require("../models/VolunteerPartnerOrg/queries"));
const ReportService_1 = require("../services/ReportService");
function formatStamp(time) {
    return { day: time.format('MM-DD-YYYY'), hour: time.format('H') };
}
function addToAcc(acc, time, minutes) {
    const { day, hour } = formatStamp(time);
    if (day in acc) {
        const sub = acc[day];
        if (hour in sub) {
            sub[hour] += minutes;
        }
        else {
            sub[hour] = minutes;
        }
    }
    else {
        acc[day] = { hour: minutes };
    }
}
function readFromAcc(acc, time) {
    const { day, hour } = formatStamp(time);
    if (day in acc) {
        const sub = acc[day];
        if (hour in sub) {
            return sub[hour];
        }
    }
    return 0;
}
// Reduce accumulator to single day totals
// reduced_acc = { day: number }
function reduceAcc(acc) {
    const final = {};
    for (const day of Object.keys(acc)) {
        let total = 0;
        const sub = acc[day];
        for (const hour of Object.keys(sub)) {
            total += sub[hour];
        }
        if (total === 0)
            continue;
        final[day] = Number((total / 60).toFixed(2));
    }
    return final;
}
function telecomTutorTime(sessions, availabilityForDateRange, quizPassedActions) {
    const acc = {}; // accumulator { MM-DD-YYYY: {H: time volunteered in minutes } }
    const sessionAcc = {};
    const availabilityAcc = {};
    const certificationAcc = {};
    // TODO: double loop on sessions is inefficient
    // check if tutoring occured on a day
    for (const session of sessions) {
        const startedAt = (0, moment_1.default)(session.volunteerJoinedAt).tz('America/New_York');
        acc[startedAt.format('MM-DD-YYYY')] = {};
        // Count tutoring time in accumulator separately
        if (session.timeTutored !== 0) {
            addToAcc(sessionAcc, startedAt, 
            // convert ms -> min
            (0, round_up_to_nearest_interval_1.default)((session.timeTutored ? session.timeTutored : 0) / 60000, 15));
        }
    }
    // Add time spent on call per availability hour
    for (const availabilityHistory of availabilityForDateRange) {
        const availability = availabilityHistory.availability;
        const day = constants_1.DAYS[(0, moment_1.default)(availabilityHistory.recordedAt).day()];
        if (availability[day]) {
            for (const hourA of Object.keys(availability[day])) {
                if (availability[day][hourA]) {
                    const temp = (0, moment_1.default)(availabilityHistory.recordedAt);
                    const { day, hour } = formatStamp(temp.hour(constants_1.HOUR_TO_UTC_MAPPING[hourA]));
                    // If day is not aleady accounted for do not add since no tutoring happened
                    if (day in acc) {
                        acc[day][hour] = 60;
                        // Count into availability accumulator separately
                        if (day in availabilityAcc)
                            availabilityAcc[day][hour] = 60;
                        else
                            availabilityAcc[day] = { hour: 60 };
                    }
                }
            }
        }
    }
    // Add time spent in tutoring sessions
    for (const session of sessions) {
        if (session.timeTutored === 0)
            continue;
        const startedAt = (0, moment_1.default)(session.volunteerJoinedAt).tz('America/New_York');
        const endedAt = (0, moment_1.default)(session.endedAt).tz('America/New_York');
        let counter = (0, moment_1.default)(startedAt);
        let contribution = 0;
        let skipped = 0;
        while (counter < endedAt) {
            // Move counter up to the next hour per iteration
            // Add to the accumulator the number of minutes traversed
            // If we would have passed 'endedAt' traverse minutes until endedAt
            let offset = 60 - counter.minutes();
            const nextHour = (0, moment_1.default)(counter).add(offset, 'minutes');
            if (nextHour > endedAt) {
                offset = endedAt.minutes() - counter.minutes();
            }
            // Do not add contribution if hour block already set to 60 by availability
            if (readFromAcc(acc, counter) < 60)
                contribution += offset;
            // remove tutoring time from availability accumulator
            else
                skipped += offset;
            counter = nextHour;
        }
        // Add extra time to account for rounding duration up to nearest 15
        contribution = (0, round_up_to_nearest_interval_1.default)(contribution, 15);
        skipped = (0, round_up_to_nearest_interval_1.default)(skipped, 15);
        addToAcc(acc, startedAt, contribution);
        addToAcc(availabilityAcc, startedAt, -1 * skipped);
    }
    // Add time spent on certifications
    for (const quizPassed of quizPassedActions) {
        const createdAt = (0, moment_1.default)(quizPassed.createdAt).tz('America/New_York');
        // No need to check for tutoring/availability overlap according to spec
        addToAcc(acc, createdAt, 60);
        // Count quiz time in separate accumulator
        addToAcc(certificationAcc, createdAt, 60);
    }
    return {
        totalTime: reduceAcc(acc),
        sessionTime: reduceAcc(sessionAcc),
        availabilityTime: reduceAcc(availabilityAcc),
        certificationTime: reduceAcc(certificationAcc),
    };
}
const eventId = 4003; // telecom custom event id
async function getVolunteerData(volunteer, start, end) {
    const quizPassedActions = await UserActionRepo.getQuizzesPassedForDateRangeForTelecomReportByVolunteerId(volunteer.id, start, end);
    const sessions = await SessionRepo.getSessionsForVolunteerHourSummary(volunteer.id, start, end);
    const availabilityForDateRange = await (0, AvailabilityService_1.getElapsedAvailabilityForTelecomReport)(volunteer.id, start, end);
    return {
        sessions,
        availabilityForDateRange,
        quizPassedActions,
    };
}
async function telecomProcessVolunteer(volunteer, start, end) {
    const totalCerts = (0, count_certs_1.default)(volunteer.quizzes);
    if (totalCerts === 0)
        return [];
    const { sessions, availabilityForDateRange, quizPassedActions, } = await getVolunteerData(volunteer, start, end);
    // Accumulate hours into rows
    const rows = [];
    const volunteerFirstName = (0, lodash_1.capitalize)(volunteer.firstName);
    const volunterLastName = (0, lodash_1.capitalize)(volunteer.lastName);
    const name = volunteerFirstName + ' ' + volunterLastName;
    const email = volunteer.email;
    const { totalTime: accumulatedHours } = telecomTutorTime(sessions, availabilityForDateRange, quizPassedActions);
    for (const date of Object.keys(accumulatedHours)) {
        const hours = accumulatedHours[date];
        rows.push({
            name,
            email,
            eventId,
            date,
            hours,
        });
    }
    return rows;
}
async function generateTelecomReport(volunteers, start, end) {
    const volunteerPartnerReport = [];
    const errors = [];
    for (const volunteer of volunteers) {
        try {
            const volunteerRows = await telecomProcessVolunteer(volunteer, start, end);
            volunteerPartnerReport.push(...volunteerRows);
        }
        catch (error) {
            errors.push(`volunteer ${volunteer.id}: ${error}`);
        }
    }
    if (errors.length) {
        throw Error(`Failed to generate custom partner report with\n ${errors.join('\n')}`);
    }
    logger_1.default.info('Telecom report generated');
    return volunteerPartnerReport;
}
exports.generateTelecomReport = generateTelecomReport;
function sumHours(acc) {
    let total = 0;
    for (const day of Object.keys(acc)) {
        total += acc[day];
    }
    return total;
}
function emptyHours() {
    return {
        totalVolunteerHours: 0,
        totalCoachingHours: 0,
        totalElapsedAvailability: 0,
        totalQuizzesPassed: 0,
    };
}
exports.emptyHours = emptyHours;
// To be used by email/update job(s) for generating telecom volunteer hours
async function telecomHourSummaryStats(volunteer, start, end) {
    try {
        const totalCerts = (0, count_certs_1.default)(volunteer.quizzes);
        if (totalCerts === 0)
            return emptyHours();
        const { sessions, availabilityForDateRange, quizPassedActions, } = await getVolunteerData(volunteer, start, end);
        const { totalTime, sessionTime, availabilityTime, certificationTime, } = telecomTutorTime(sessions, availabilityForDateRange, quizPassedActions);
        const row = {
            totalVolunteerHours: sumHours(totalTime),
            totalCoachingHours: sumHours(sessionTime),
            totalElapsedAvailability: sumHours(availabilityTime),
            totalQuizzesPassed: sumHours(certificationTime),
        };
        return row;
    }
    catch (error) {
        throw new Error(`Failed to generate hour summary stats: ${error}`);
    }
}
exports.telecomHourSummaryStats = telecomHourSummaryStats;
function getOnboardingStatus({ isOnboarded, availabilityLastModifiedAt, totalQuizzesPassed, }) {
    if (isOnboarded)
        return constants_1.ONBOARDING_STATUS.ONBOARDED;
    if (availabilityLastModifiedAt || totalQuizzesPassed > 0)
        return constants_1.ONBOARDING_STATUS.IN_PROGRESS;
    return constants_1.ONBOARDING_STATUS.NOT_STARTED;
}
function getDateOnboarded({ createdAt, isOnboarded, dateOnboarded, }) {
    // Earliest record of having an ONBOARDED user action row
    const defaultLegacyVolunteerOnboardedDate = '2020-07-28 12:44:47.648+00';
    const isLegacyVolunteerOnboarded = new Date(createdAt) <= new Date(defaultLegacyVolunteerOnboardedDate) &&
        isOnboarded;
    if (dateOnboarded)
        return (0, moment_1.default)(dateOnboarded).format('MM/DD/YYYY HH:mm');
    else if (isLegacyVolunteerOnboarded)
        return (0, moment_1.default)(defaultLegacyVolunteerOnboardedDate).format('MM/DD/YYYY HH:mm');
    else
        return '';
}
function isDateWithin(date, startDate, endDate) {
    const formatDate = new Date(date).getTime();
    return formatDate >= startDate.getTime() && formatDate < endDate.getTime();
}
function getAnalyticsReportRow(volunteer) {
    const row = {};
    // Volunteer profile
    row.firstName = volunteer.firstName;
    row.lastName = volunteer.lastName;
    row.email = volunteer.email;
    row.state = volunteer.state ? volunteer.state : '';
    // Volunteer status
    row.onboardingStatus = getOnboardingStatus({
        isOnboarded: volunteer.isOnboarded,
        availabilityLastModifiedAt: volunteer.availabilityLastModifiedAt,
        totalQuizzesPassed: volunteer.totalQuizzesPassed,
    });
    row.dateAccountCreated = (0, moment_1.default)(volunteer.createdAt).format('MM/DD/YYYY HH:mm');
    // Total certifications received
    row.certificationsReceived = volunteer.totalQuizzesPassed;
    // Volunteer impact - cumulative
    row.totalTextsReceived = volunteer.totalNotifications;
    row.totalSessionsCompleted = volunteer.totalSessions;
    row.totalPartnerSessionsCompleted = volunteer.totalPartnerSessions;
    row.totalUniqueStudentsHelped = volunteer.totalUniqueStudentsHelped;
    row.totalUniquePartnerStudentsHelped =
        volunteer.totalUniquePartnerStudentsHelped;
    row.totalTutoringHours = volunteer.hourSummaryTotal.totalCoachingHours;
    row.totalPartnerStudentsTutoringHours = Number((volunteer.totalPartnerTimeTutored / 3600000).toFixed(2));
    row.totalTrainingHours = volunteer.hourSummaryTotal.totalQuizzesPassed;
    row.totalElapsedAvailabilityHours = Number((volunteer.hourSummaryTotal.totalElapsedAvailability * 0.1).toFixed(1));
    row.totalVolunteerHours = volunteer.hourSummaryTotal.totalVolunteerHours || 0;
    // Volunteer impact within date range
    row.dateRangeTextsReceived = volunteer.totalNotificationsWithinRange;
    row.dateRangeSessionsCompleted = volunteer.totalSessionsWithinRange;
    row.dateRangePartnerSessionsCompleted =
        volunteer.totalPartnerSessionsWithinRange;
    row.dateRangeUniqueStudentsHelped =
        volunteer.totalUniqueStudentsHelpedWithinRange;
    row.dateRangeUniquePartnerStudentsHelped =
        volunteer.totalUniquePartnerStudentsHelpedWithinRange;
    row.dateRangeTutoringHours = volunteer.hourSummaryDateRange.totalCoachingHours;
    row.dateRangePartnerStudentsTutoringHours = Number((volunteer.totalPartnerTimeTutoredWithinRange / 3600000).toFixed(2));
    row.dateRangeTrainingHours = volunteer.hourSummaryDateRange.totalQuizzesPassed;
    row.dateRangeElapsedAvailabilityHours = Number((volunteer.hourSummaryDateRange.totalElapsedAvailability * 0.1).toFixed(1));
    row.dateRangeVolunteerHours =
        volunteer.hourSummaryDateRange.totalVolunteerHours;
    row.dateOnboarded = getDateOnboarded({
        createdAt: volunteer.createdAt,
        isOnboarded: volunteer.isOnboarded,
        dateOnboarded: volunteer.dateOnboarded,
    });
    return row;
}
exports.getAnalyticsReportRow = getAnalyticsReportRow;
function dividend(numerator, denominator) {
    let quotient = numerator / denominator;
    if (isNaN(quotient))
        quotient = 0;
    return quotient;
}
async function getAnalyticsReportSummary(partnerOrg, report, startDate, endDate) {
    const defaultData = {
        total: 0,
        totalWithinDateRange: 0,
    };
    const summary = {
        signUps: { ...defaultData },
        volunteersOnboarded: { ...defaultData },
        onboardingRate: { ...defaultData },
        opportunities: { ...defaultData },
        sessionsCompleted: { ...defaultData },
        pickupRate: { ...defaultData },
        volunteerHours: { ...defaultData },
        uniqueStudentsHelped: { ...defaultData },
        uniquePartnerStudentsHelped: { ...defaultData },
    };
    for (const row of report) {
        summary.signUps.total++;
        if (isDateWithin(row.dateAccountCreated, startDate, endDate))
            summary.signUps.totalWithinDateRange++;
        if (row.onboardingStatus === constants_1.ONBOARDING_STATUS.ONBOARDED &&
            row.dateOnboarded) {
            summary.volunteersOnboarded.total++;
            if (isDateWithin(row.dateOnboarded, startDate, endDate))
                summary.volunteersOnboarded.totalWithinDateRange++;
        }
        summary.sessionsCompleted.total += row.totalSessionsCompleted;
        summary.sessionsCompleted.totalWithinDateRange +=
            row.dateRangeSessionsCompleted;
        summary.volunteerHours.total += row.totalVolunteerHours;
        summary.volunteerHours.totalWithinDateRange += row.dateRangeVolunteerHours;
        summary.opportunities.total += row.totalTextsReceived;
        summary.opportunities.totalWithinDateRange += row.dateRangeTextsReceived;
        // delete hack for date onboarded
        delete row.dateOnboarded;
    }
    summary.onboardingRate.total = Number((100 * dividend(summary.volunteersOnboarded.total, summary.signUps.total)).toFixed(2));
    summary.onboardingRate.totalWithinDateRange = Number((100 *
        dividend(summary.volunteersOnboarded.totalWithinDateRange, summary.signUps.totalWithinDateRange)).toFixed(2));
    summary.pickupRate.total = Number((100 *
        dividend(summary.sessionsCompleted.total, summary.opportunities.total)).toFixed(2));
    summary.pickupRate.totalWithinDateRange = Number((100 *
        dividend(summary.sessionsCompleted.totalWithinDateRange, summary.opportunities.totalWithinDateRange)).toFixed(2));
    const uniqueStudentSummary = await VolunteerRepo.getUniqueStudentsHelpedForAnalyticsReportSummary(partnerOrg, startDate, endDate);
    summary.uniqueStudentsHelped.total = uniqueStudentSummary
        ? uniqueStudentSummary.totalUniqueStudentsHelped
        : 0;
    summary.uniqueStudentsHelped.totalWithinDateRange = uniqueStudentSummary
        ? uniqueStudentSummary.totalUniqueStudentsHelpedWithinRange
        : 0;
    summary.uniquePartnerStudentsHelped.total = uniqueStudentSummary
        ? uniqueStudentSummary.totalUniquePartnerStudentsHelped
        : 0;
    summary.uniquePartnerStudentsHelped.totalWithinDateRange = uniqueStudentSummary
        ? uniqueStudentSummary.totalUniquePartnerStudentsHelpedWithinRange
        : 0;
    return summary;
}
exports.getAnalyticsReportSummary = getAnalyticsReportSummary;
const analyticsReportDataHeaderMapping = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    state: 'State of residence',
    onboardingStatus: 'Onboarding status',
    dateAccountCreated: 'Date of account creation',
    certificationsReceived: 'Certifications received',
    totalTextsReceived: 'Total texts received',
    totalSessionsCompleted: 'Total sessions completed',
    totalPartnerSessionsCompleted: 'Total sessions with partner students',
    totalUniqueStudentsHelped: 'Total unique students helped',
    totalUniquePartnerStudentsHelped: 'Total unique partner students helped',
    totalTutoringHours: 'Total tutoring hours',
    totalPartnerStudentsTutoringHours: 'Total tutoring hours with partner students',
    totalTrainingHours: 'Total training hours',
    totalElapsedAvailabilityHours: 'Total elapsed availability hours',
    totalVolunteerHours: 'Total hours',
    dateRangeTextsReceived: 'Texts received within date range',
    dateRangeSessionsCompleted: 'Sessions completed within date range',
    dateRangePartnerSessionsCompleted: 'Sessions completed with partner students within date range',
    dateRangeUniqueStudentsHelped: 'Unique students helped within date range',
    dateRangeUniquePartnerStudentsHelped: 'Unique partner students helped within date range',
    dateRangeTutoringHours: 'Tutoring hours within date range',
    dateRangePartnerStudentsTutoringHours: 'Tutoring hours with partner students within date range',
    dateRangeTrainingHours: 'Training hours within date range',
    dateRangeElapsedAvailabilityHours: 'Elapsed availability hours within date range',
    dateRangeVolunteerHours: 'Total hours within date range',
};
const analyticsReportSummaryHeaderMapping = {
    signUps: 'Volunteers signed up',
    volunteersOnboarded: 'Volunteers onboarded',
    onboardingRate: 'Onboarding rate',
    opportunities: 'Tutoring opportunities provided',
    sessionsCompleted: 'Sessions completed',
    pickupRate: 'Pick-up rate',
    volunteerHours: 'Volunteer hours completed',
    uniqueStudentsHelped: 'Unique students helped',
    uniquePartnerStudentsHelped: 'Unique partner students helped',
};
function applyAnalyticsReportDataStyles(worksheet) {
    /**
     * @note: When applying styles to a cell, column, or row, previous styles applied may be overridden,
     *        so there may need to be styling that is defined again to preserve the styles.
     *
     * @note: Using `.style` on a `getColumn()` or `getRow()` does not apply the set styles,
     *        we must access using the direct property like `.border` or `.fill`.
     *
     */
    const rowWithFormattedColumnHeaders = worksheet.getRow(2);
    rowWithFormattedColumnHeaders.height = 80;
    rowWithFormattedColumnHeaders.alignment = {
        wrapText: true,
    };
    rowWithFormattedColumnHeaders.border = {
        bottom: { style: 'thin' },
    };
    const overridenCellStyle = {
        border: {
            bottom: { style: 'thin' },
        },
        alignment: { wrapText: true },
    };
    // Update styling on cells that were overriden due to specific column styles being applied
    worksheet.getCell('G2').style = overridenCellStyle;
    worksheet.getCell('J2').style = overridenCellStyle;
    worksheet.getCell('N2').style = overridenCellStyle;
    worksheet.getCell('Q2').style = overridenCellStyle;
    worksheet.getCell('U2').style = overridenCellStyle;
}
exports.applyAnalyticsReportDataStyles = applyAnalyticsReportDataStyles;
function applyAnalyticsReportSummaryStyles(worksheet) {
    worksheet.getColumn('A').alignment = {
        wrapText: true,
    };
    const rightAlignText = {
        alignment: {
            horizontal: 'right',
        },
    };
    worksheet.getCell('B4').style = rightAlignText;
    worksheet.getCell('C4').style = rightAlignText;
    worksheet.getCell('B7').style = rightAlignText;
    worksheet.getCell('C7').style = rightAlignText;
}
exports.applyAnalyticsReportSummaryStyles = applyAnalyticsReportSummaryStyles;
function processAnalyticsReportDataSheet(data, worksheet, startDate, endDate, partnerOrg, partnerName) {
    const columnsWithHeaderKeys = [];
    const formattedColumnHeaders = [];
    const isCustomAnalyticsReport = config_1.default.corporatePartnerReports.customAnalyticsReportPartnerOrgs.includes(partnerOrg);
    for (const [key, value] of Object.entries(analyticsReportDataHeaderMapping)) {
        if (!isCustomAnalyticsReport &&
            (value ===
                analyticsReportDataHeaderMapping.totalUniquePartnerStudentsHelped ||
                value ===
                    analyticsReportDataHeaderMapping.dateRangeUniquePartnerStudentsHelped ||
                value ===
                    analyticsReportDataHeaderMapping.totalPartnerSessionsCompleted ||
                value ===
                    analyticsReportDataHeaderMapping.dateRangePartnerSessionsCompleted ||
                value ===
                    analyticsReportDataHeaderMapping.totalPartnerStudentsTutoringHours ||
                value ===
                    analyticsReportDataHeaderMapping.dateRangePartnerStudentsTutoringHours))
            continue;
        const col = {
            key,
            width: 15,
        };
        columnsWithHeaderKeys.push(col);
        formattedColumnHeaders.push(value);
    }
    worksheet.columns = columnsWithHeaderKeys;
    // Add the headers to the second row
    worksheet.getRow(2).values = formattedColumnHeaders;
    for (let i = 0; i < data.length; i += 1) {
        worksheet.addRow(data[i], 'i');
    }
    const sectionalHeaders = {
        volunteerInformation: 'Volunteer Information',
        totalImpact: 'Cumulative Impact',
        totalVolunteerHours: 'Cumulative Volunteer Hours',
        dateRangeImpact: `Impact from ${startDate} - ${endDate}`,
        dateRangeHours: `Hours between ${startDate} - ${endDate}`,
    };
    if (isCustomAnalyticsReport) {
        // Create sectional headers in the first row for att/verizon reports
        worksheet.getCell('A1').value = sectionalHeaders.volunteerInformation;
        worksheet.getCell('H1').value = sectionalHeaders.totalImpact;
        worksheet.getCell('M1').value = sectionalHeaders.totalVolunteerHours;
        worksheet.getCell('R1').value = sectionalHeaders.dateRangeImpact;
        worksheet.getCell('W1').value = sectionalHeaders.dateRangeHours;
        worksheet.getCell('J2').value = `Total sessions with ${partnerName} students`;
        worksheet.getCell('L2').value = `Total unique ${partnerName} students helped`;
        worksheet.getCell('N2').value = `Total tutoring hours with ${partnerName} students`;
        worksheet.getCell('T2').value = `Sessions completed with ${partnerName} students within date range`;
        worksheet.getCell('V2').value = `Unique ${partnerName} students impacted within date range`;
        worksheet.getCell('X2').value = `Tutoring hours with ${partnerName} students within date range`;
        worksheet.mergeCells('A1:G1');
        worksheet.mergeCells('H1:L1');
        worksheet.mergeCells('M1:Q1');
        worksheet.mergeCells('R1:V1');
        worksheet.mergeCells('W1:AA1');
    }
    else {
        // Create sectional headers in the first row for other partner eports
        worksheet.getCell('A1').value = sectionalHeaders.volunteerInformation;
        worksheet.getCell('H1').value = sectionalHeaders.totalImpact;
        worksheet.getCell('K1').value = sectionalHeaders.totalVolunteerHours;
        worksheet.getCell('O1').value = sectionalHeaders.dateRangeImpact;
        worksheet.getCell('R1').value = sectionalHeaders.dateRangeHours;
        worksheet.mergeCells('A1:G1');
        worksheet.mergeCells('H1:J1');
        worksheet.mergeCells('K1:N1');
        worksheet.mergeCells('O1:Q1');
        worksheet.mergeCells('R1:U1');
    }
    applyAnalyticsReportDataStyles(worksheet);
}
exports.processAnalyticsReportDataSheet = processAnalyticsReportDataSheet;
function processAnalyticsReportSummarySheet(summary, worksheet, startDate, endDate, partnerOrg, partnerName) {
    const summaryColumnMapping = {
        description: '',
        total: 'Cumulative',
        totalWithinDateRange: `${startDate} - ${endDate}`,
    };
    const summaryCols = [];
    for (const [columnKey, columnHeader] of Object.entries(summaryColumnMapping)) {
        const col = {
            header: columnHeader,
            key: columnKey,
            width: 25,
        };
        summaryCols.push(col);
    }
    worksheet.columns = summaryCols;
    for (const [key, data] of Object.entries(summary)) {
        let description = analyticsReportSummaryHeaderMapping[key];
        let total;
        let totalWithinDateRange;
        if (key === 'onboardingRate' || key === 'pickupRate') {
            total = `${data.total}%`;
            totalWithinDateRange = `${data.totalWithinDateRange}%`;
        }
        else {
            total = data.total;
            totalWithinDateRange = data.totalWithinDateRange;
        }
        // do not add unique partner students helped row to non-att/verizon reports
        if (!config_1.default.corporatePartnerReports.customAnalyticsReportPartnerOrgs.includes(partnerOrg) &&
            key === 'uniquePartnerStudentsHelped')
            continue;
        else if (key === 'uniquePartnerStudentsHelped')
            description = `Unique ${partnerName} students helped`;
        worksheet.addRow({ description, total, totalWithinDateRange }, 'i');
    }
    worksheet.properties.defaultRowHeight = 30;
    applyAnalyticsReportSummaryStyles(worksheet);
}
exports.processAnalyticsReportSummarySheet = processAnalyticsReportSummarySheet;
exports.asValidateVolunteerReportQuery = (0, type_utils_1.asFactory)({
    partnerOrg: type_utils_1.asString,
    startDate: type_utils_1.asString,
    endDate: type_utils_1.asString,
});
async function validateVolunteerReportQuery(data) {
    const { partnerOrg, startDate, endDate } = (0, exports.asValidateVolunteerReportQuery)(data);
    const startMoment = (0, moment_1.default)(startDate, 'MM-DD-YYYY', true);
    const endMoment = (0, moment_1.default)(endDate, 'MM-DD-YYYY', true);
    if (!startMoment.isValid())
        throw new Errors_1.InputError('Start date does not follow a MM-DD-YYYY format');
    if (!endMoment.isValid())
        throw new Errors_1.InputError('End date does not follow a MM-DD-YYYY format');
    if (startMoment.toDate() >= endMoment.toDate())
        throw new Errors_1.InputError('Invalid date range');
    const partnerOrgId = await VolunteerPartnerOrgRepo.getVolunteerPartnerOrgIdByKey(partnerOrg);
    if (!partnerOrg)
        throw new ReportService_1.ReportNoDataFoundError('No partner org provided');
    if (!partnerOrgId)
        throw new ReportService_1.ReportNoDataFoundError('No partner org found with given key');
    return { partnerOrg, partnerOrgId, startDate, endDate };
}
exports.validateVolunteerReportQuery = validateVolunteerReportQuery;
const studentReportValidators = {
    sessionRangeFrom: type_utils_1.asString,
    sessionRangeTo: type_utils_1.asString,
    highSchoolId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    studentPartnerOrg: (0, type_utils_1.asOptional)(type_utils_1.asString),
    studentPartnerSite: (0, type_utils_1.asOptional)(type_utils_1.asString),
    sponsorOrg: (0, type_utils_1.asOptional)(type_utils_1.asString),
};
exports.asValidateStudentSessionReportQuery = (0, type_utils_1.asFactory)({
    ...studentReportValidators,
});
exports.asValidateStudentUsageReportQuery = (0, type_utils_1.asFactory)({
    joinedBefore: type_utils_1.asString,
    joinedAfter: type_utils_1.asString,
    ...studentReportValidators,
});
function isValidReportDateFormat(dateString) {
    const isStrictMode = true;
    return (0, moment_1.default)(dateString, 'MM-DD-YYYY', isStrictMode).isValid();
}
function validateSessionDateRanges({ sessionRangeFrom, sessionRangeTo, }) {
    if (!isValidReportDateFormat(sessionRangeFrom))
        throw new Errors_1.InputError('"Session from" date does not follow a MM-DD-YYYY format');
    if (!isValidReportDateFormat(sessionRangeTo))
        throw new Errors_1.InputError('"Session to" date does not follow a MM-DD-YYYY format');
}
exports.validateSessionDateRanges = validateSessionDateRanges;
function validateJoinedDateRanges({ joinedAfter, joinedBefore, }) {
    if (!isValidReportDateFormat(joinedAfter))
        throw new Errors_1.InputError('"Joined after" date does not follow a MM-DD-YYYY format');
    if (!isValidReportDateFormat(joinedBefore))
        throw new Errors_1.InputError('"Joined before" date does not follow a MM-DD-YYYY format');
}
exports.validateJoinedDateRanges = validateJoinedDateRanges;
function validateStudentReportQuery(data) {
    validateSessionDateRanges(data);
}
exports.validateStudentReportQuery = validateStudentReportQuery;
function validateStudentSessionReportQuery(data) {
    const validatedData = (0, exports.asValidateStudentSessionReportQuery)(data);
    return validatedData;
}
exports.validateStudentSessionReportQuery = validateStudentSessionReportQuery;
function validateStudentUsageReportQuery(data) {
    const validatedData = (0, exports.asValidateStudentUsageReportQuery)(data);
    validateJoinedDateRanges(validatedData);
    return validatedData;
}
exports.validateStudentUsageReportQuery = validateStudentUsageReportQuery;
