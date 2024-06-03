"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StudentService_1 = require("../services/StudentService");
const type_utils_1 = require("../utils/type-utils");
const logger_1 = require("../worker/logger");
async function BackfillStudentPosthog(job) {
    const studentId = (0, type_utils_1.asUlid)(job.data.studentId);
    await (0, StudentService_1.processStudentTrackingPostHog)(studentId);
    (0, logger_1.log)(`Successfully updated posthog association for student ${studentId}`);
}
exports.default = BackfillStudentPosthog;
