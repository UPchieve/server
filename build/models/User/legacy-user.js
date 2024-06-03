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
exports.getLegacyUserObject = void 0;
const pgUtils_1 = require("../pgUtils");
const Volunteer_1 = require("../Volunteer");
const Errors_1 = require("../Errors");
const pgQueries = __importStar(require("./pg.queries"));
const db_1 = require("../../db");
const lodash_1 = __importDefault(require("lodash"));
const Availability_1 = require("../Availability");
const queries_1 = require("../Volunteer/queries");
const Session_1 = require("../Session");
async function getLegacyUserObject(userId) {
    var _a;
    const client = await (0, db_1.getClient)().connect();
    try {
        const baseResult = await pgQueries.getLegacyUser.run({ userId }, client);
        if (!baseResult.length)
            throw new Errors_1.RepoReadError('Did not find Legacy User object');
        const baseUser = (0, pgUtils_1.makeSomeRequired)(baseResult[0], [
            'id',
            'firstName',
            'firstname',
            'createdAt',
            'email',
            'verified',
            'isAdmin',
            'isVolunteer',
            'isTestUser',
            'isBanned',
            'isDeactivated',
            'referralCode',
            'type',
        ]);
        // manually parse out incoming bigint to number
        baseUser.hoursTutored =
            baseUser.hoursTutored || Number(baseUser.hoursTutored);
        // The frontend still expects ALL possible certification objects on the legacy user
        // So we get all quizzes and map their name to a fresh QuizInfo object
        const legacyCertificationsResult = await pgQueries.getLegacyCertifications.run(undefined, client);
        const legacyCertifications = legacyCertificationsResult.reduce((agg, v) => {
            const name = (0, pgUtils_1.makeRequired)(v).name;
            return {
                ...agg,
                [name]: {
                    tries: 0,
                    passed: false,
                    lastAttemptedAt: undefined,
                },
            };
        }, {});
        const sessionStats = await (0, Session_1.getUserSessionStats)(userId);
        const volunteerUser = {};
        if (baseUser.isVolunteer) {
            if (!baseUser.subjects)
                baseUser.subjects = [];
            if (!baseUser.activeSubjects)
                baseUser.activeSubjects = [];
            if (!baseUser.mutedSubjectAlerts)
                baseUser.mutedSubjectAlerts = [];
            volunteerUser.availability = await (0, Availability_1.getAvailabilityForVolunteer)(userId, client);
            const references = await (0, queries_1.getReferencesByVolunteer)(userId, client);
            volunteerUser.references = references.map(ref => ({
                ...ref,
                _id: ref.id,
                status: ref.status.toUpperCase(),
            }));
            baseUser.photoIdStatus = (_a = baseUser.photoIdStatus) === null || _a === void 0 ? void 0 : _a.toUpperCase();
            const trainingCourses = await (0, Volunteer_1.getVolunteerTrainingCourses)(userId, client);
            if (!trainingCourses['upchieve101']) {
                trainingCourses['upchieve101'] = {
                    userId: baseUser.id,
                    trainingCourse: 'upchieve101',
                    complete: false,
                    isComplete: false,
                    completedMaterials: [],
                    progress: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
            // TODO: ask if we want to allow users to take quizzes in subjects they already unlocked
            volunteerUser.trainingCourses = trainingCourses;
            volunteerUser.certifications = {
                // legacyCertifications is a map of all of the quizzes defined via the `quizzes` table
                ...legacyCertifications,
                ...(await (0, queries_1.getQuizzesForVolunteers)([userId], client))[userId],
                ...(await (0, Volunteer_1.getCertificationsForVolunteer)([userId], client))[userId],
            };
            const totalActiveCerts = Object.keys((await (0, Volunteer_1.getActiveQuizzesForVolunteers)([userId], client))[userId]).length;
            volunteerUser.totalActiveCertifications = totalActiveCerts;
        }
        const final = lodash_1.default.merge({ _id: baseUser.id }, baseUser, volunteerUser, {
            sessionStats,
        });
        return final;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.getLegacyUserObject = getLegacyUserObject;
