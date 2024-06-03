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
exports.backfillVolunteerPartnerOrgStartDates = exports.migrateExistingvolunteerPartnerOrgRelationships = exports.migrateExistingVolunteerPartnerOrgs = exports.getVolunteerPartnerOrgs = exports.getVolunteerPartnerOrgIdByKey = exports.getFullVolunteerPartnerOrgByKey = exports.getVolunteerPartnerOrgForRegistrationByKey = void 0;
const db_1 = require("../../db");
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
async function getVolunteerPartnerOrgForRegistrationByKey(key) {
    try {
        const result = await pgQueries.getVolunteerPartnerOrgForRegistrationByKey.run({ key }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0])))
            throw new Error(`no volunteer partner org found with key ${key}`);
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['domains']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerPartnerOrgForRegistrationByKey = getVolunteerPartnerOrgForRegistrationByKey;
async function getFullVolunteerPartnerOrgByKey(key) {
    try {
        const result = await pgQueries.getFullVolunteerPartnerOrgByKey.run({ key }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0])))
            throw new Error(`no volunteer partner org found with key ${key}`);
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['domains']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getFullVolunteerPartnerOrgByKey = getFullVolunteerPartnerOrgByKey;
async function getVolunteerPartnerOrgIdByKey(volunteerPartnerOrg, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getVolunteerPartnerOrgIdByKey.run({ volunteerPartnerOrg }, client);
        if (result.length) {
            return result[0].id;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerPartnerOrgIdByKey = getVolunteerPartnerOrgIdByKey;
async function getVolunteerPartnerOrgs() {
    try {
        const result = await pgQueries.getVolunteerPartnerOrgs.run(undefined, (0, db_1.getClient)());
        const orgs = result.map(org => {
            const temp = (0, pgUtils_1.makeSomeOptional)(org, ['domains']);
            return {
                ...temp,
                // TODO: remove reference to display name in frontend
                displayName: temp.name,
            };
        });
        return orgs;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerPartnerOrgs = getVolunteerPartnerOrgs;
async function migrateExistingVolunteerPartnerOrgs(client) {
    try {
        await pgQueries.migrateExistingVolunteerPartnerOrgs.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to mgirate existing instances for volunteer partner orgs: ${err}`);
    }
}
exports.migrateExistingVolunteerPartnerOrgs = migrateExistingVolunteerPartnerOrgs;
async function migrateExistingvolunteerPartnerOrgRelationships(client) {
    try {
        await pgQueries.migrateExistingvolunteerPartnerOrgRelationships.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to mgirate user-vpo relationships for volunteer partner orgs: ${err}`);
    }
}
exports.migrateExistingvolunteerPartnerOrgRelationships = migrateExistingvolunteerPartnerOrgRelationships;
async function backfillVolunteerPartnerOrgStartDates(vpoName, createdAt, endedAt, client) {
    try {
        await pgQueries.backfillVolunteerPartnerOrgStartDates.run({ vpoName, createdAt, endedAt }, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Failed to backfill volunteer partner org start date: ${err}`);
    }
}
exports.backfillVolunteerPartnerOrgStartDates = backfillVolunteerPartnerOrgStartDates;
