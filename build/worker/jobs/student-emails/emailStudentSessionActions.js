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
const moment_1 = __importDefault(require("moment"));
const logger_1 = require("../../logger");
const MailService = __importStar(require("../../../services/MailService"));
const queries_1 = require("../../../models/Student/queries");
const queries_2 = require("../../../models/Volunteer/queries");
const index_1 = require("../index");
const format_multi_word_subject_1 = __importDefault(require("../../../utils/format-multi-word-subject"));
const type_utils_1 = require("../../../utils/type-utils");
const asStudentActionsData = (0, type_utils_1.asFactory)({
    studentId: type_utils_1.asString,
    volunteerId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    sessionSubtopic: type_utils_1.asString,
    sessionDate: type_utils_1.asString,
});
exports.default = async (job) => {
    const { data, name: currentJob } = job;
    const { studentId, volunteerId, sessionSubtopic, sessionDate, } = asStudentActionsData(data);
    const student = await (0, queries_1.getStudentContactInfoById)(studentId);
    let volunteer;
    if (volunteerId)
        volunteer = await (0, queries_2.getVolunteerContactInfoById)(volunteerId);
    if (student) {
        try {
            const { firstName: studentFirstName, email } = student;
            if (currentJob === index_1.Jobs.EmailStudentAbsentWarning)
                await MailService.sendStudentAbsentWarning(email, studentFirstName);
            if (currentJob === index_1.Jobs.EmailStudentAbsentVolunteerApology && volunteer)
                await MailService.sendStudentAbsentVolunteerApology(studentFirstName, email, volunteer === null || volunteer === void 0 ? void 0 : volunteer.firstName, (0, format_multi_word_subject_1.default)(sessionSubtopic), (0, moment_1.default)(sessionDate).format('MMMM Do'));
            if (currentJob === index_1.Jobs.EmailStudentUnmatchedApology)
                await MailService.sendStudentUnmatchedApology(studentFirstName, email, (0, format_multi_word_subject_1.default)(sessionSubtopic), (0, moment_1.default)(sessionDate).format('MMMM Do'));
            if (currentJob === index_1.Jobs.EmailStudentOnlyLookingForAnswers)
                await MailService.sendOnlyLookingForAnswersWarning(studentFirstName, email);
            (0, logger_1.log)(`Emailed ${currentJob} to student ${studentId}`);
        }
        catch (error) {
            throw new Error(`Failed to email ${currentJob} to student ${studentId}: ${error}`);
        }
    }
};
