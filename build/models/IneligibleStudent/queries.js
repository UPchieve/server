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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIneligibleStudent = exports.insertIneligibleStudent = exports.getIneligibleStudentsPaginated = exports.getIneligibleStudentByEmail = void 0;
const Errors_1 = require("../Errors");
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
async function getIneligibleStudentByEmail(email) {
    try {
        const result = await pgQueries.getIneligibleStudentByEmail.run({ email: email.toLowerCase() }, (0, db_1.getClient)());
        if (!result.length)
            return;
        return (0, pgUtils_1.makeSomeOptional)(result[0], [
            'zipCode',
            'ipAddress',
            'school',
            'currentGrade',
        ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getIneligibleStudentByEmail = getIneligibleStudentByEmail;
async function getIneligibleStudentsPaginated(limit, offset) {
    try {
        const result = await pgQueries.getIneligibleStudentsPaginated.run({ limit, offset }, (0, db_1.getClient)());
        return result.map(v => {
            const ret = (0, pgUtils_1.makeSomeRequired)(v, ['createdAt', 'email', 'updatedAt']);
            ret.email = ret.email.toLowerCase();
            return ret;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getIneligibleStudentsPaginated = getIneligibleStudentsPaginated;
async function insertIneligibleStudent(email, schoolId, postalCode, gradeLevel, referredBy, ip) {
    try {
        const result = await pgQueries.insertIneligibleStudent.run({
            id: (0, pgUtils_1.getDbUlid)(),
            email: email.toLowerCase(),
            schoolId,
            postalCode,
            gradeLevel,
            referredBy,
            ip,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Error('Insert did not return new row');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.insertIneligibleStudent = insertIneligibleStudent;
async function deleteIneligibleStudent(email) {
    try {
        await pgQueries.deleteIneligibleStudent.run({
            email,
        }, (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoDeleteError(err);
    }
}
exports.deleteIneligibleStudent = deleteIneligibleStudent;
