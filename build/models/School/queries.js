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
exports.getPartnerSchools = exports.upsertSchools = exports.titlecaseMetadataSchoolNames = exports.titlecaseSchoolNames = exports.schoolSearch = exports.adminUpdateSchool = exports.updateIsPartner = exports.updateApproval = exports.getSchools = exports.getSchoolById = void 0;
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
const db_1 = require("../../db");
const geoQueries = __importStar(require("../Geography/pg.queries"));
const StudentPartnerOrg_1 = require("../StudentPartnerOrg");
const upsert_schools_1 = require("../../scripts/upsert-schools");
const type_utils_1 = require("../../utils/type-utils");
const string_utils_1 = require("../../utils/string-utils");
const logger_1 = __importDefault(require("../../logger"));
const EligibilityService_1 = require("../../services/EligibilityService");
async function getSchoolById(schoolId) {
    try {
        const result = await pgQueries.getSchoolById.run({ schoolId }, (0, db_1.getClient)());
        if (result.length) {
            return (0, pgUtils_1.makeSomeRequired)(result[0], [
                'id',
                'name',
                'city',
                'state',
                'isAdminApproved',
                'isPartner',
            ]);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSchoolById = getSchoolById;
async function getSchools(data, limit, offset) {
    try {
        const { name, state, city } = data;
        const result = await pgQueries.getSchools.run({
            name: name || null,
            state: state || null,
            city: city || null,
            limit: limit,
            offset: offset,
        }, (0, db_1.getClient)());
        return result
            .map(v => (0, pgUtils_1.makeSomeRequired)(v, [
            'id',
            'name',
            'city',
            'state',
            'isAdminApproved',
            'isPartner',
        ]))
            .map((s) => {
            s.isApproved = (0, EligibilityService_1.isSchoolApproved)(s);
            return s;
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSchools = getSchools;
async function updateApproval(schoolId, isApproved) {
    try {
        const result = await pgQueries.updateApproval.run({ schoolId, isApproved }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateApproval = updateApproval;
async function updateIsPartner(schoolId, isPartner) {
    const transactionClient = await (0, db_1.getClient)().connect();
    try {
        await transactionClient.query('BEGIN');
        const result = await pgQueries.updateIsPartner.run({ schoolId, isPartner }, (0, db_1.getClient)());
        const school = await getSchoolById(schoolId);
        if (school) {
            if (isPartner)
                await (0, StudentPartnerOrg_1.createSchoolStudentPartnerOrg)(school.name, transactionClient);
            else
                await (0, StudentPartnerOrg_1.deactivateStudentPartnerOrg)(school.name, transactionClient);
        }
        await transactionClient.query('COMMIT');
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        await transactionClient.query('ROLLBACK');
        throw new Errors_1.RepoUpdateError(err);
    }
    finally {
        transactionClient.release();
    }
}
exports.updateIsPartner = updateIsPartner;
async function adminUpdateSchool(data) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const { schoolId, name, city, state, zip, isApproved } = data;
        await client.query('BEGIN');
        await pgQueries.adminUpdateSchoolMetaData.run({ schoolId, zip }, client);
        // we need to find the city's id, or if it doesn't exist, create it
        let cityId;
        if (city) {
            const result = await geoQueries.upsertCity.run({ name: city, state }, client);
            cityId = (0, pgUtils_1.makeRequired)(result[0]).id;
        }
        await pgQueries.adminUpdateSchool.run({ schoolId, name, cityId, isApproved }, client);
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoUpdateError(err);
    }
    finally {
        client.release();
    }
}
exports.adminUpdateSchool = adminUpdateSchool;
async function schoolSearch(query) {
    try {
        const results = await pgQueries.schoolSearch.run({ query }, (0, db_1.getClient)());
        return results.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['district']));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.schoolSearch = schoolSearch;
async function titlecaseSchoolNames() {
    try {
        await pgQueries.titlecaseSchoolNames.run(undefined, (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.titlecaseSchoolNames = titlecaseSchoolNames;
async function titlecaseMetadataSchoolNames() {
    try {
        await pgQueries.titlecaseMetadataSchoolNames.run(undefined, (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.titlecaseMetadataSchoolNames = titlecaseMetadataSchoolNames;
async function upsertSchools(schoolYear, schoolRecords) {
    const transactionClient = await (0, db_1.getClient)().connect();
    try {
        await transactionClient.query('BEGIN');
        for (const school of schoolRecords) {
            const formattedSchool = getFormattedSchoolForInsert(school);
            if (!formattedSchool.lcity ||
                !formattedSchool.sch_name ||
                !formattedSchool.ncessch) {
                logger_1.default.info(`Unable to upsert school: SchoolNcesMetadataRecord missing necessary value city (${formattedSchool.lcity}),  sch_name (${formattedSchool.sch_name}),  or ncessch (${formattedSchool.ncessch}).`);
                continue;
            }
            const existingSchools = await pgQueries.getSchoolByNcesId.run({ ncessch: school.ncessch }, transactionClient);
            if (existingSchools.length) {
                const existingSchoolId = existingSchools[0].id;
                await pgQueries.updateSchoolMetadata.run({
                    school_id: existingSchoolId,
                    ...formattedSchool,
                }, transactionClient);
            }
            else {
                const city = await geoQueries.upsertCity.run({ name: formattedSchool.lcity, state: formattedSchool.st }, transactionClient);
                const school = await pgQueries.createSchool.run({
                    id: (0, pgUtils_1.getDbUlid)(),
                    name: formattedSchool.sch_name,
                    city_id: city[0].id,
                }, transactionClient);
                await pgQueries.createSchoolMetadata.run({
                    school_id: school[0].id,
                    ...formattedSchool,
                }, transactionClient);
            }
        }
        await transactionClient.query('COMMIT');
    }
    catch (err) {
        await transactionClient.query('ROLLBACK');
        if (err instanceof Errors_1.RepoCreateError)
            throw err;
        throw new Errors_1.RepoTransactionError(err);
    }
    finally {
        transactionClient.release();
    }
    function getFormattedSchoolForInsert(school) {
        return {
            ncessch: school.ncessch,
            school_year: schoolYear,
            st: school.st,
            sch_name: (0, string_utils_1.toTitleCase)(school.sch_name),
            lea_name: (0, string_utils_1.toTitleCase)(school.lea_name),
            lcity: (0, string_utils_1.toTitleCase)(school.lcity),
            lzip: school.lzip,
            mcity: (0, string_utils_1.toTitleCase)(school.mcity),
            mstate: school.mstate,
            mzip: school.mzip,
            phone: school.phone,
            website: school.website,
            sy_status_text: (0, string_utils_1.toTitleCase)(getValueText(school.sy_status)),
            updated_status_text: getValueText(school.updated_status),
            effective_date: school.effective_date,
            sch_type_text: getValueText(school.sch_type),
            nogrades: getValueText(school.nogrades),
            g_pk_offered: getValueText(school.g_pk_offered),
            g_kg_offered: getValueText(school.g_kg_offered),
            g_1_offered: getValueText(school.g_1_offered),
            g_2_offered: getValueText(school.g_2_offered),
            g_3_offered: getValueText(school.g_3_offered),
            g_4_offered: getValueText(school.g_4_offered),
            g_5_offered: getValueText(school.g_5_offered),
            g_6_offered: getValueText(school.g_6_offered),
            g_7_offered: getValueText(school.g_7_offered),
            g_8_offered: getValueText(school.g_8_offered),
            g_9_offered: getValueText(school.g_9_offered),
            g_10_offered: getValueText(school.g_10_offered),
            g_11_offered: getValueText(school.g_11_offered),
            g_12_offered: getValueText(school.g_12_offered),
            g_13_offered: getValueText(school.g_13_offered),
            g_ug_offered: getValueText(school.g_ug_offered),
            g_ae_offered: getValueText(school.g_ae_offered),
            gslo: getGradeCode(school.gslo),
            gshi: getGradeCode(school.gshi),
            level: school.level,
            is_school_wide_title1: school.is_school_wide_title1 === upsert_schools_1.SCHOOL_RECORD_TRUE_VALUE,
            is_title1_eligible: school.is_title1_eligible === upsert_schools_1.SCHOOL_RECORD_TRUE_VALUE,
            national_school_lunch_program: school.national_school_lunch_program,
            total_students: school.total_students
                ? (0, type_utils_1.asNumber)(school.total_students)
                : undefined,
            nslp_direct_certification: school.nslp_direct_certification
                ? (0, type_utils_1.asNumber)(school.nslp_direct_certification)
                : undefined,
            frl_eligible: school.frl_eligible
                ? (0, type_utils_1.asNumber)(school.frl_eligible)
                : undefined,
        };
    }
    function getValueText(s) {
        return s === null || s === void 0 ? void 0 : s.split('-')[1];
    }
    function getGradeCode(s) {
        if (!s)
            return;
        switch (s.toLowerCase()) {
            case 'kindergarten':
                return 'KG';
            case 'prekindergarten':
                return 'PK';
            default:
                return s.split('th')[0];
        }
    }
}
exports.upsertSchools = upsertSchools;
async function getPartnerSchools(tc) {
    try {
        const schools = await pgQueries.getPartnerSchools.run(undefined, tc);
        return schools.map(s => (0, pgUtils_1.makeSomeOptional)(s, ['partnerKey', 'partnerSites']));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPartnerSchools = getPartnerSchools;
