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
exports.getPartnerSchools = exports.titlecaseSchoolNames = exports.adminUpdateSchool = exports.updateIsPartner = exports.updateApproval = exports.getSchools = exports.getSchool = exports.search = void 0;
const SchoolRepo = __importStar(require("../models/School"));
const type_utils_1 = require("../utils/type-utils");
const db_1 = require("../db");
// helper to escape regex special characters
function escapeRegex(str) {
    return str.replace(/[.*|\\+?{}()[^$]/g, c => '\\' + c);
}
// search for schools by name
async function search(query) {
    const results = await SchoolRepo.schoolSearch(query);
    return results
        .sort((s1, s2) => {
        if (s1.name && s2.name) {
            return s1.name.localeCompare(s2.name);
        }
        return 0;
    })
        .map(school => {
        return {
            id: school.id,
            upchieveId: school.id,
            name: school.name,
            districtName: school.district,
            city: school.city,
            state: school.state,
        };
    });
}
exports.search = search;
async function getSchool(schoolId) {
    try {
        const school = await SchoolRepo.getSchoolById(schoolId);
        if (!school)
            throw new Error(`no school found with id ${schoolId}`);
        return school;
    }
    catch (error) {
        throw new Error(error.message);
    }
}
exports.getSchool = getSchool;
const asGetSchoolsPayload = (0, type_utils_1.asFactory)({
    name: (0, type_utils_1.asOptional)(type_utils_1.asString),
    state: (0, type_utils_1.asOptional)(type_utils_1.asString),
    city: (0, type_utils_1.asOptional)(type_utils_1.asString),
    page: (0, type_utils_1.asOptional)(type_utils_1.asNumber),
});
// TODO: clean up return type
async function getSchools(data) {
    const { name, state, city, page } = asGetSchoolsPayload(data);
    const pageNum = page || 1;
    const PER_PAGE = 15;
    const skip = (pageNum - 1) * PER_PAGE;
    try {
        const schools = await SchoolRepo.getSchools({
            name,
            state,
            city,
            page,
        }, PER_PAGE, skip);
        const isLastPage = schools.length < PER_PAGE;
        return {
            schools: schools.map(s => {
                return { ...s, _id: s.id };
            }),
            isLastPage,
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
}
exports.getSchools = getSchools;
function updateApproval(schoolId, isApproved) {
    return SchoolRepo.updateApproval(schoolId, isApproved);
}
exports.updateApproval = updateApproval;
function updateIsPartner(schoolId, isPartner) {
    return SchoolRepo.updateIsPartner(schoolId, isPartner);
}
exports.updateIsPartner = updateIsPartner;
const asAdminUpdate = (0, type_utils_1.asFactory)({
    schoolId: type_utils_1.asString,
    name: type_utils_1.asString,
    city: type_utils_1.asString,
    state: type_utils_1.asString,
    zip: type_utils_1.asString,
    isApproved: type_utils_1.asBoolean,
});
async function adminUpdateSchool(data) {
    const { schoolId, name, city, state, zip, isApproved } = asAdminUpdate(data);
    const schoolData = {
        schoolId,
        name,
        city,
        state,
        zip,
        isApproved,
    };
    return SchoolRepo.adminUpdateSchool(schoolData);
}
exports.adminUpdateSchool = adminUpdateSchool;
async function titlecaseSchoolNames() {
    return Promise.all([
        SchoolRepo.titlecaseSchoolNames(),
        SchoolRepo.titlecaseMetadataSchoolNames(),
    ]);
}
exports.titlecaseSchoolNames = titlecaseSchoolNames;
async function getPartnerSchools() {
    return SchoolRepo.getPartnerSchools((0, db_1.getClient)());
}
exports.getPartnerSchools = getPartnerSchools;
