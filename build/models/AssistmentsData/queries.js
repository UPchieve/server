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
exports.createAssistmentsDataBySessionId = exports.updateAssistmentsDataSentById = exports.getAssistmentsDataBySession = void 0;
const Errors_1 = require("../Errors");
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
// When we big bang to pg this file will replace the existing ./queries
async function getAssistmentsDataBySession(sessionId) {
    try {
        const result = await pgQueries.getAssistmentsDataBySession.run({ sessionId }, (0, db_1.getClient)());
        if (result.length) {
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['sentAt']);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAssistmentsDataBySession = getAssistmentsDataBySession;
async function updateAssistmentsDataSentById(assistmentsDataId) {
    try {
        const result = await pgQueries.updateAssistmentsDataSentById.run({ assistmentsDataId }, (0, db_1.getClient)());
        if (result.length && result[0].id)
            return;
        throw new Errors_1.RepoUpdateError('Update query did not return id');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateAssistmentsDataSentById = updateAssistmentsDataSentById;
async function createAssistmentsDataBySessionId(problemId, assignmentId, studentId, sessionId) {
    try {
        const result = await pgQueries.createAssistmentsDataBySessionId.run({
            id: (0, pgUtils_1.getDbUlid)(),
            problemId,
            assignmentId,
            studentId,
            sessionId,
        }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['sentAt']);
        throw new Errors_1.RepoCreateError('Insert did not return new row');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createAssistmentsDataBySessionId = createAssistmentsDataBySessionId;
