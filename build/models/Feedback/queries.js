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
exports.getFeedbackBySessionIdUserType = exports.getFeedbackBySessionId = void 0;
const db_1 = require("../../db");
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
const fix_number_int_1 = require("../../utils/fix-number-int");
function buildFeedback(rows) {
    if (rows.length > 2) {
        throw new Error('Found more than 2 feedbacks for a session');
    }
    const newRows = rows.map(v => (0, pgUtils_1.makeSomeOptional)(v, [
        'legacyFeedbacks',
        'studentCounselingFeedback',
        'studentTutoringFeedback',
        'volunteerFeedback',
        'responseData',
        'type',
        'subTopic',
    ]));
    const feedback = {
        id: newRows[0].id,
        sessionId: newRows[0].sessionId,
        type: newRows[0].type,
        subTopic: newRows[0].subTopic,
    };
    for (const row of newRows) {
        feedback.responseData = (0, fix_number_int_1.fixNumberInt)(row.responseData);
        if (row.userRole === 'student') {
            feedback.studentId = row.userId;
            feedback.studentCounselingFeedback = (0, fix_number_int_1.fixNumberInt)(row.studentCounselingFeedback);
            feedback.studentTutoringFeedback = (0, fix_number_int_1.fixNumberInt)(row.studentTutoringFeedback);
        }
        else if (row.userRole === 'volunteer') {
            feedback.volunteerId = row.userId;
            feedback.volunteerFeedback = (0, fix_number_int_1.fixNumberInt)(row.volunteerFeedback);
        }
        else
            throw new Error('Found feedback with unknown user role');
    }
    return feedback;
}
// need this for session review, which still displays legacy feedback
async function getFeedbackBySessionId(sessionId) {
    try {
        const result = await pgQueries.getFeedbackBySessionId.run({ sessionId }, (0, db_1.getClient)());
        if (!result.length)
            return;
        return buildFeedback(result);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getFeedbackBySessionId = getFeedbackBySessionId;
async function getFeedbackBySessionIdUserType(sessionId, userRole) {
    try {
        const result = await pgQueries.getFeedbackBySessionIdUserType.run({ sessionId, userRole }, (0, db_1.getClient)());
        if (!result.length)
            return;
        const temp = (0, pgUtils_1.makeSomeOptional)(result[0], [
            'legacyFeedbacks',
            'studentCounselingFeedback',
            'studentTutoringFeedback',
            'volunteerFeedback',
            'responseData',
        ]);
        return {
            userId: temp.id,
            createdAt: temp.createdAt,
            updatedAt: temp.updatedAt,
            ...buildFeedback([temp]),
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getFeedbackBySessionIdUserType = getFeedbackBySessionIdUserType;
