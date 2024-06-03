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
exports.migrateExistingSchoolsSponsorOrgRelationships = exports.migrateExistingPartnerOrgSponsorOrgRelationships = exports.migrateExistingSponsorOrgs = exports.getSponsorOrgsByKey = exports.getSponsorOrgs = void 0;
const pgQueries = __importStar(require("./pg.queries"));
const db_1 = require("../../db");
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
async function getSponsorOrgs() {
    try {
        const result = await pgQueries.getSponsorOrgs.run(undefined, (0, db_1.getClient)());
        const orgs = result.map(org => (0, pgUtils_1.makeSomeOptional)(org, [
            'schoolIds',
            'studentPartnerOrgKeys',
            'studentPartnerOrgIds',
        ]));
        return orgs;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSponsorOrgs = getSponsorOrgs;
async function getSponsorOrgsByKey(sponsorOrg) {
    try {
        const result = await pgQueries.getSponsorOrgsByKey.run({ sponsorOrg }, (0, db_1.getClient)());
        return (0, pgUtils_1.makeSomeOptional)(result[0], [
            'schoolIds',
            'studentPartnerOrgKeys',
            'studentPartnerOrgIds',
        ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSponsorOrgsByKey = getSponsorOrgsByKey;
async function migrateExistingSponsorOrgs(client) {
    try {
        await pgQueries.migrateExistingSponsorOrgs.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to migrate existing sponsor orgs to instances: ${err}`);
    }
}
exports.migrateExistingSponsorOrgs = migrateExistingSponsorOrgs;
async function migrateExistingPartnerOrgSponsorOrgRelationships(client) {
    try {
        await pgQueries.migrateExistingPartnerOrgSponsorOrgRelationships.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to migrate partner orgs for sponsor orgs: ${err}`);
    }
}
exports.migrateExistingPartnerOrgSponsorOrgRelationships = migrateExistingPartnerOrgSponsorOrgRelationships;
async function migrateExistingSchoolsSponsorOrgRelationships(client) {
    try {
        await pgQueries.migrateExistingSchoolsSponsorOrgRelationships.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to migrate schools for sponsor orgs: ${err}`);
    }
}
exports.migrateExistingSchoolsSponsorOrgRelationships = migrateExistingSchoolsSponsorOrgRelationships;
