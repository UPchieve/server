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
exports.executeUSMUpdatesByUserId = exports.getUSMByUserId = exports.createUSMByUserId = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
async function createUSMByUserId(userId, tc) {
    try {
        const result = await pgQueries.createUsmByUserId.run({
            userId,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
        throw new Errors_1.RepoCreateError('Insert did not return new row');
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createUSMByUserId = createUSMByUserId;
async function getUSMByUserId(userId, tc) {
    try {
        const result = await pgQueries.getUsmByUserId.run({
            userId,
        }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUSMByUserId = getUSMByUserId;
// NOTE: when queries are merged conflicting scalar values will be overwritten
// ex: a = { a: { aa: 1, bb: 2 } }, b = { a: { aa: 3, cc: 4 } }
// merge(a,b) => a = { a: { aa: 3, bb: 2, cc: 4 } }
async function executeUSMUpdatesByUserId(userId, queries) {
    // NOTE: `queries` has an example shape similar to below after `merge()`
    // {
    //   hasBeenUnmatched': 109,
    //   absentStudent': 22,
    //   absentVolunteer': 27
    //   ...
    // }
    const update = {};
    for (const q of queries) {
        (0, lodash_1.merge)(update, q);
    }
    try {
        const result = await pgQueries.executeUsmUpdatesByUserId.run({
            userId,
            absentStudent: update['absentStudent'],
            absentVolunteer: update['absentVolunteer'],
            lowSessionRatingFromCoach: update['lowSessionRatingFromCoach'],
            lowSessionRatingFromStudent: update['lowSessionRatingFromStudent'],
            lowCoachRatingFromStudent: update['lowCoachRatingFromStudent'],
            reported: update['reported'],
            onlyLookingForAnswers: update['onlyLookingForAnswers'],
            rudeOrInappropriate: update['rudeOrInappropriate'],
            commentFromStudent: update['commentFromStudent'],
            commentFromVolunteer: update['commentFromVolunteer'],
            hasBeenUnmatched: update['hasBeenUnmatched'],
            hasHadTechnicalIssues: update['hasHadTechnicalIssues'],
            personalIdentifyingInfo: update['personalIdentifyingInfo'],
            gradedAssignment: update['gradedAssignment'],
            coachUncomfortable: update['coachUncomfortable'],
            studentCrisis: update['studentCrisis'],
        }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query did not return id');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to execute merged update ${update} for user ${userId}: ${err.message}`);
    }
}
exports.executeUSMUpdatesByUserId = executeUSMUpdatesByUserId;
