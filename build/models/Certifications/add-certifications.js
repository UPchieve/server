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
const Volunteer_1 = require("../Volunteer");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
const db_1 = require("../../db");
const constants_1 = require("../../constants");
const lodash_1 = __importDefault(require("lodash"));
function eqSet(as, bs) {
    if (as.size !== bs.size)
        return false;
    for (var a of as)
        if (!bs.has(a))
            return false;
    return true;
}
function unlockedSubjects(userCertifications) {
    const currentSubjects = new Set();
    for (const cert in userCertifications) {
        // Check that the required training was completed for every certification that a user has
        // Add all the other subjects that a certification unlocks to the Set
        if (userCertifications[cert].passed &&
            // TrainingCtrl.hasRequiredTraining(cert as keyof Certifications, userCertifications) &&
            constants_1.CERT_UNLOCKING[cert])
            constants_1.CERT_UNLOCKING[cert].forEach(subject => currentSubjects.add(subject));
    }
    // Check if the user has unlocked a new certification based on the current certifications they have
    for (const cert in constants_1.COMPUTED_CERTS) {
        const prerequisiteCerts = constants_1.COMPUTED_CERTS[cert];
        let meetsRequirements = true;
        for (let i = 0; i < prerequisiteCerts.length; i++) {
            const prereqCert = prerequisiteCerts[i];
            if (!currentSubjects.has(prereqCert)) {
                meetsRequirements = false;
                break;
            }
        }
        if (meetsRequirements)
            currentSubjects.add(cert);
    }
    return currentSubjects;
}
async function addCertificationsForPassedQuiz(userId, quizzes) {
    try {
        const result = await pgQueries.addCertificationsForPassedQuiz.run({ userId, quizzes }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v).name);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
async function getVolunteersWithCerts() {
    try {
        const result = await pgQueries.getVolunteersWithCerts.run(undefined, (0, db_1.getClient)());
        const rows = result.map(v => (0, pgUtils_1.makeRequired)(v));
        const rowsByUser = lodash_1.default.groupBy(rows, v => v.userId);
        const users = [];
        for (const [user, rows] of Object.entries(rowsByUser)) {
            const certs = {};
            for (const row of rows) {
                certs[row.name] = {
                    passed: row.passed,
                    tries: row.tries,
                    lastAttemptedAt: row.lastAttemptedAt,
                };
            }
            users.push({
                id: user,
                certifications: certs,
            });
        }
        return users;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
async function processVolunteer(volunteer) {
    const passedQuizzes = Object.entries(volunteer.certifications)
        .map(v => (v[1].passed ? v[0] : ''))
        .filter(v => v !== '');
    const appUnlockedSubjects = unlockedSubjects(volunteer.certifications);
    await addCertificationsForPassedQuiz(volunteer.id, passedQuizzes);
    const dbUnlockedSubjects = new Set(await (0, Volunteer_1.getSubjectsForVolunteer)(volunteer.id));
    const areEqual = eqSet(dbUnlockedSubjects, appUnlockedSubjects);
    if (!areEqual)
        throw new Error(`Volunteer ${volunteer.id} app subjects [${Array.from(appUnlockedSubjects)}] and db subjects [${Array.from(dbUnlockedSubjects)}]`);
}
async function main() {
    let code = 0;
    try {
        const volunteers = await getVolunteersWithCerts();
        const errors = [];
        console.log(`Attempting to update certifications for ${volunteers.length} volunteers`);
        for (const volunteer of volunteers) {
            try {
                await processVolunteer(volunteer);
            }
            catch (err) {
                errors.push(err.message);
            }
        }
        if (errors.length) {
            console.error(`${errors.length} volunteers have mis-matched subjects`);
            throw new Error(`${errors.join('\n')}`);
        }
    }
    catch (err) {
        console.error(err);
        code = 1;
    }
    finally {
        await (0, db_1.closeClient)();
        process.exit(code);
    }
}
main();
