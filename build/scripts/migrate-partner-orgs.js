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
const promises_1 = require("fs/promises");
const db_1 = require("../db");
const ApRepo = __importStar(require("../models/AssociatedPartner"));
const Errors_1 = require("../models/Errors");
const SoRepo = __importStar(require("../models/SponsorOrg"));
const SpoRepo = __importStar(require("../models/StudentPartnerOrg"));
const VpoRepo = __importStar(require("../models/VolunteerPartnerOrg"));
function parseJsonFile(file) {
    const raw = JSON.parse(file);
    const out = [];
    for (const obj of raw) {
        if (obj['Start'] === '' ||
            obj['Start'] === undefined ||
            obj['Name'] === '' ||
            obj['Name'] === undefined)
            continue;
        out.push({
            name: obj['Name'],
            start: obj['Start'],
            end: obj['End'] === '' ? undefined : obj['End'],
        });
    }
    return out;
}
async function migrateHistoricalPartnershipsData() {
    const client = await (0, db_1.getClient)().connect();
    try {
        await client.query('BEGIN');
        const schools = parseJsonFile(await (0, promises_1.readFile)('./server/scripts/schools.json'));
        const vpos = parseJsonFile(await (0, promises_1.readFile)('./server/scripts/vpos.json'));
        const spos = parseJsonFile(await (0, promises_1.readFile)('./server/scripts/spos.json'));
        // STUDENT PARTNER ORGS
        // First turn schools into canonical student partner orgs
        for (const school of schools) {
            await SpoRepo.migratePartnerSchoolsToPartnerOrgs(school.name, school.start, client);
        }
        // Next create spo-upchieve instances
        await SpoRepo.migrateExistingStudentPartnerOrgs(client);
        // Backfill SPO start dates
        for (const org of schools.concat(spos)) {
            await SpoRepo.backfillStudentPartnerOrgStartDates(org.name, org.start, org.end, client);
        }
        // Finally create user-spo instances
        await SpoRepo.migrateExistingStudentPartnerOrgRelationships(client);
        await SpoRepo.migrateExistingPartnerSchoolRelationships(client);
        // VOLUNTEER PARTNER ORGS
        // First create vpo-upchieve instances
        await VpoRepo.migrateExistingVolunteerPartnerOrgs(client);
        // Backfill VPO start dates
        for (const org of vpos) {
            await VpoRepo.backfillVolunteerPartnerOrgStartDates(org.name, org.start, org.end, client);
        }
        // Finally create user-vpo insances
        await VpoRepo.migrateExistingvolunteerPartnerOrgRelationships(client);
        // SPONSOR ORGS
        // First create so-upchieve instances
        await SoRepo.migrateExistingSponsorOrgs(client);
        // Next create spo-so instances
        await SoRepo.migrateExistingPartnerOrgSponsorOrgRelationships(client);
        // Finally create school-so instances
        await SoRepo.migrateExistingSchoolsSponsorOrgRelationships(client);
        // ASSOCIATED PARTNERS
        await ApRepo.migrateStudentPartnerOrgAssociatedPartners(client);
        await ApRepo.migrateSponsorOrgAssociatedPartners(client);
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoTransactionError(err);
    }
    finally {
        client.release();
    }
}
exports.default = migrateHistoricalPartnershipsData;
migrateHistoricalPartnershipsData();
