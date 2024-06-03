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
exports.deactivateUserStudentPartnerOrgInstance = exports.deactivateStudentPartnerOrg = exports.createSchoolStudentPartnerOrg = exports.migrateExistingPartnerSchoolRelationships = exports.backfillStudentPartnerOrgStartDates = exports.migratePartnerSchoolsToPartnerOrgs = exports.migrateExistingStudentPartnerOrgRelationships = exports.migrateExistingStudentPartnerOrgs = exports.createUserStudentPartnerOrgInstance = exports.getStudentPartnerOrgKeyByCode = exports.getStudentPartnerOrgs = exports.getFullStudentPartnerOrgByKey = exports.getStudentPartnerOrgBySchoolId = exports.getStudentPartnerOrgByKey = exports.getStudentPartnerOrgForRegistrationByKey = void 0;
const db_1 = require("../../db");
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
async function getStudentPartnerOrgForRegistrationByKey(key) {
    try {
        const result = await pgQueries.getStudentPartnerOrgForRegistrationByKey.run({ key }, (0, db_1.getClient)());
        if (!result.length)
            throw new Error(`no student partner org found with key ${key}`);
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['sites']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentPartnerOrgForRegistrationByKey = getStudentPartnerOrgForRegistrationByKey;
async function getStudentPartnerOrgByKey(tc, partnerKey, partnerSite) {
    try {
        const result = await pgQueries.getStudentPartnerOrgByKey.run({
            partnerKey,
            partnerSite,
        }, tc);
        if (result.length) {
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['siteId', 'siteName', 'schoolId']);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentPartnerOrgByKey = getStudentPartnerOrgByKey;
async function getStudentPartnerOrgBySchoolId(tc, schoolId) {
    try {
        const result = await pgQueries.getStudentPartnerOrgBySchoolId.run({
            schoolId,
        }, tc);
        if (result.length) {
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['siteId', 'siteName', 'schoolId']);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentPartnerOrgBySchoolId = getStudentPartnerOrgBySchoolId;
async function getFullStudentPartnerOrgByKey(key) {
    try {
        const result = await pgQueries.getFullStudentPartnerOrgByKey.run({ key }, (0, db_1.getClient)());
        if (!result.length)
            throw new Error(`no student partner org found with key ${key}`);
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['sites']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getFullStudentPartnerOrgByKey = getFullStudentPartnerOrgByKey;
async function getStudentPartnerOrgs() {
    try {
        const result = await pgQueries.getStudentPartnerOrgs.run(undefined, (0, db_1.getClient)());
        const orgs = result.map(org => {
            const temp = (0, pgUtils_1.makeSomeOptional)(org, ['sites']);
            return {
                ...temp,
                displayName: temp.name,
            };
        });
        return orgs;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentPartnerOrgs = getStudentPartnerOrgs;
async function getStudentPartnerOrgKeyByCode(signupCode) {
    try {
        const result = await pgQueries.getStudentPartnerOrgKeyByCode.run({ signupCode }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0])))
            throw new Error(`no student partner org found with signup code ${signupCode}`);
        return (0, pgUtils_1.makeRequired)(result[0]).key;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentPartnerOrgKeyByCode = getStudentPartnerOrgKeyByCode;
async function createUserStudentPartnerOrgInstance(uspoData, tc) {
    try {
        await pgQueries.createUserStudentPartnerOrgInstance.run({
            userId: uspoData.userId,
            spoId: uspoData.studentPartnerOrgId,
            sposId: uspoData.studentPartnerOrgSiteId,
        }, tc);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createUserStudentPartnerOrgInstance = createUserStudentPartnerOrgInstance;
async function migrateExistingStudentPartnerOrgs(client) {
    try {
        await pgQueries.migrateExistingStudentPartnerOrgs.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to migrate existing instances for student partner orgs: ${err}`);
    }
}
exports.migrateExistingStudentPartnerOrgs = migrateExistingStudentPartnerOrgs;
async function migrateExistingStudentPartnerOrgRelationships(client) {
    try {
        await pgQueries.migrateExistingStudentPartnerOrgRelationships.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to migrate existing user relationships for student partner orgs: ${err}`);
    }
}
exports.migrateExistingStudentPartnerOrgRelationships = migrateExistingStudentPartnerOrgRelationships;
// TODO: waiting on programs to get list mapping partnerSchool->partnership start date
// Will need custom mapping of school names to student_partner_orgs_upchieve_instance.created_at
// MUST BE RUN FIRST
async function migratePartnerSchoolsToPartnerOrgs(schoolName, createdAt, client) {
    try {
        await pgQueries.migratePartnerSchoolsToPartnerOrgs.run({ schoolName, createdAt }, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to migrate schools to student partner orgs: ${err}`);
    }
}
exports.migratePartnerSchoolsToPartnerOrgs = migratePartnerSchoolsToPartnerOrgs;
async function backfillStudentPartnerOrgStartDates(spoName, createdAt, endedAt, client) {
    try {
        await pgQueries.backfillStudentPartnerOrgStartDates.run({ spoName, createdAt, endedAt }, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to backfill student partner org start date: ${err}`);
    }
}
exports.backfillStudentPartnerOrgStartDates = backfillStudentPartnerOrgStartDates;
// must be run after migrating schools to partner orgs
async function migrateExistingPartnerSchoolRelationships(client) {
    try {
        await pgQueries.migrateExistingPartnerSchoolRelationships.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to migrate user-school relationship for student partner orgs: ${err}`);
    }
}
exports.migrateExistingPartnerSchoolRelationships = migrateExistingPartnerSchoolRelationships;
async function createSchoolStudentPartnerOrg(schoolName, client) {
    try {
        await pgQueries.createSchoolStudentPartnerOrg.run({ schoolName }, client || (0, db_1.getClient)());
        await pgQueries.createStudentPartnerOrgInstance.run({ spoName: schoolName }, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to create school partner ${schoolName} and partner instance: ${err}`);
    }
}
exports.createSchoolStudentPartnerOrg = createSchoolStudentPartnerOrg;
async function deactivateStudentPartnerOrg(spoName, client) {
    try {
        await pgQueries.deactivateStudentPartnerOrg.run({ spoName }, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to deactivate student partner org ${spoName}: ${err}`);
    }
}
exports.deactivateStudentPartnerOrg = deactivateStudentPartnerOrg;
async function deactivateUserStudentPartnerOrgInstance(tc, userId, studentPartnerOrgId) {
    try {
        await pgQueries.deactivateUserStudentPartnerOrgInstance.run({
            userId,
            spoId: studentPartnerOrgId,
        }, tc);
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to deactivate instance of user ${userId} with student partner org ${studentPartnerOrgId}: ${err}`);
    }
}
exports.deactivateUserStudentPartnerOrgInstance = deactivateUserStudentPartnerOrgInstance;
