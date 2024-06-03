"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
require("moment-timezone");
const logger_1 = require("../logger");
const Student_1 = require("../../models/Student");
const constants_1 = require("../../constants");
const MailService_1 = require("../../services/MailService");
const moment_1 = __importDefault(require("moment"));
const gradeLevelMapping = {
    6: constants_1.GRADES.SIXTH,
    7: constants_1.GRADES.SEVENTH,
    8: constants_1.GRADES.EIGHTH,
    9: constants_1.GRADES.NINTH,
    10: constants_1.GRADES.TENTH,
    11: constants_1.GRADES.ELEVENTH,
    12: constants_1.GRADES.TWELVETH,
};
function getNextGradeLevel(currentGrade) {
    const grade = parseInt(currentGrade);
    if (!grade)
        return;
    const nextGrade = grade + 1;
    if (nextGrade > 12)
        return constants_1.GRADES.COLLEGE;
    return gradeLevelMapping[nextGrade];
}
exports.default = async () => {
    const errors = [];
    const oldestDate = '2017-01-01T00:00:00.000+00:00';
    let monthsAgo = 0;
    let toDate = (0, moment_1.default)()
        .utc()
        .endOf('month')
        .format('YYYY-MM-DD HH:mm:ss');
    let totalUpdated = 0;
    while (toDate >= oldestDate) {
        const fromDate = (0, moment_1.default)()
            .utc()
            .subtract(monthsAgo, 'months')
            .startOf('month')
            .format('YYYY-MM-DD HH:mm:ss');
        toDate = (0, moment_1.default)()
            .utc()
            .subtract(monthsAgo, 'months')
            .endOf('month')
            .format('YYYY-MM-DD HH:mm:ss');
        const students = await (0, Student_1.getStudentsForGradeLevelUpdate)(fromDate, toDate);
        (0, logger_1.log)(`Executed ${_1.Jobs.UpdateGradeLevel} on ${fromDate} - ${toDate}`);
        for (const student of students) {
            try {
                const newGrade = getNextGradeLevel(student.gradeLevel);
                if (!newGrade)
                    continue;
                await (0, Student_1.updateStudentsGradeLevel)(student.userId, newGrade);
                await (0, MailService_1.createContact)(student.userId);
                totalUpdated++;
            }
            catch (error) {
                errors.push(`${student.userId}: Attempted to update grade: ${student.gradeLevel} with error: ${error}\n`);
                continue;
            }
        }
        monthsAgo++;
    }
    (0, logger_1.log)(`Successfully ${_1.Jobs.UpdateGradeLevel} for ${totalUpdated} students`);
    if (errors.length) {
        throw new Error(`Failed to ${_1.Jobs.UpdateGradeLevel} for students:\n${errors}`);
    }
};
