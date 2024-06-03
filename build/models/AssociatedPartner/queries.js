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
exports.migrateSponsorOrgAssociatedPartners = exports.migrateStudentPartnerOrgAssociatedPartners = exports.getAssociatedPartnersAndSchools = exports.getAssociatedPartnerByVolunteerPartnerKey = exports.getAssociatedPartnerBySponsorOrg = exports.getAssociatedPartnerByPartnerOrg = exports.getAssociatedPartnerByKey = exports.getAssociatedPartners = void 0;
const pgQueries = __importStar(require("./pg.queries"));
const db_1 = require("../../db");
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
const SponsorOrgRepo = __importStar(require("../SponsorOrg/queries"));
async function getAssociatedPartners() {
    try {
        const result = await pgQueries.getAssociatedPartners.run(undefined, (0, db_1.getClient)());
        const orgs = result.map(org => (0, pgUtils_1.makeSomeOptional)(org, [
            'studentPartnerOrg',
            'studentPartnerOrgId',
            'studentOrgDisplay',
            'studentSponsorOrgId',
            'studentSponsorOrg',
        ]));
        return orgs;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAssociatedPartners = getAssociatedPartners;
async function getAssociatedPartnerByKey(key) {
    try {
        const result = await pgQueries.getAssociatedPartnerByKey.run({ key }, (0, db_1.getClient)());
        if (!result.length)
            throw new Error(`no associated partner found with key ${key}`);
        return (0, pgUtils_1.makeSomeOptional)(result[0], [
            'studentPartnerOrg',
            'studentPartnerOrgId',
            'studentOrgDisplay',
            'studentSponsorOrgId',
            'studentSponsorOrg',
        ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAssociatedPartnerByKey = getAssociatedPartnerByKey;
async function getAssociatedPartnerByPartnerOrg(key) {
    try {
        const result = await pgQueries.getAssociatedPartnerByPartnerOrgKey.run({ key }, (0, db_1.getClient)());
        if (!result.length)
            throw new Error(`no associated partner found with key ${key}`);
        return (0, pgUtils_1.makeSomeOptional)(result[0], [
            'studentPartnerOrg',
            'studentPartnerOrgId',
            'studentOrgDisplay',
            'studentSponsorOrgId',
            'studentSponsorOrg',
        ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAssociatedPartnerByPartnerOrg = getAssociatedPartnerByPartnerOrg;
async function getAssociatedPartnerBySponsorOrg(key) {
    try {
        const result = await pgQueries.getAssociatedPartnerBySponsorOrgKey.run({ key }, (0, db_1.getClient)());
        if (!result.length)
            throw new Error(`no associated partner found with key ${key}`);
        return (0, pgUtils_1.makeSomeOptional)(result[0], [
            'studentPartnerOrg',
            'studentPartnerOrgId',
            'studentOrgDisplay',
            'studentSponsorOrgId',
            'studentSponsorOrg',
        ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAssociatedPartnerBySponsorOrg = getAssociatedPartnerBySponsorOrg;
async function getAssociatedPartnerByVolunteerPartnerKey(key) {
    try {
        const result = await pgQueries.getAssociatedPartnerByVolunteerPartnerKey.run({ key }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeSomeOptional)(result[0], [
                'studentPartnerOrg',
                'studentPartnerOrgId',
                'studentOrgDisplay',
                'studentSponsorOrgId',
                'studentSponsorOrg',
            ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAssociatedPartnerByVolunteerPartnerKey = getAssociatedPartnerByVolunteerPartnerKey;
async function getAssociatedPartnersAndSchools(partnerOrg) {
    const associatedPartner = await getAssociatedPartnerByVolunteerPartnerKey(partnerOrg);
    const associatedStudentPartnerOrgs = [];
    const associatedPartnerSchools = [];
    if (associatedPartner === null || associatedPartner === void 0 ? void 0 : associatedPartner.studentPartnerOrgId)
        associatedStudentPartnerOrgs.push(associatedPartner.studentPartnerOrgId);
    else if (associatedPartner === null || associatedPartner === void 0 ? void 0 : associatedPartner.studentSponsorOrg) {
        const sponsorOrg = await SponsorOrgRepo.getSponsorOrgsByKey(associatedPartner.studentSponsorOrg);
        if (Array.isArray(sponsorOrg.schoolIds) && sponsorOrg.schoolIds.length)
            associatedPartnerSchools.push(...sponsorOrg.schoolIds);
        if (Array.isArray(sponsorOrg.studentPartnerOrgIds) &&
            sponsorOrg.studentPartnerOrgIds.length)
            associatedStudentPartnerOrgs.push(...sponsorOrg.studentPartnerOrgIds);
    }
    return { associatedStudentPartnerOrgs, associatedPartnerSchools };
}
exports.getAssociatedPartnersAndSchools = getAssociatedPartnersAndSchools;
async function migrateStudentPartnerOrgAssociatedPartners(client) {
    try {
        await pgQueries.migrateStudentPartnerOrgAssociatedPartners.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to migrate student partner orgs for associated partners: ${err}`);
    }
}
exports.migrateStudentPartnerOrgAssociatedPartners = migrateStudentPartnerOrgAssociatedPartners;
async function migrateSponsorOrgAssociatedPartners(client) {
    try {
        await pgQueries.migrateSponsorOrgAssociatedPartners.run(undefined, client || (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(`Failed to migrate sponsor orgs for associated partners: ${err}`);
    }
}
exports.migrateSponsorOrgAssociatedPartners = migrateSponsorOrgAssociatedPartners;
