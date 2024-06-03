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
exports.isSchoolApproved = exports.checkZipCode = exports.verifyEligibility = exports.checkEligibility = exports.ExistingUserError = void 0;
const UserCtrl = __importStar(require("../controllers/UserCtrl"));
const queries_1 = require("../models/School/queries");
const queries_2 = require("../models/ZipCode/queries");
const queries_3 = require("../models/IneligibleStudent/queries");
const queries_4 = require("../models/User/queries");
const type_utils_1 = require("../utils/type-utils");
const constants_1 = require("../constants");
const ts_custom_error_1 = require("ts-custom-error");
const config_1 = __importDefault(require("../config"));
const asCheckEligibilityPayload = (0, type_utils_1.asFactory)({
    schoolUpchieveId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    zipCode: type_utils_1.asString,
    email: type_utils_1.asString,
    referredByCode: (0, type_utils_1.asOptional)(type_utils_1.asString),
    currentGrade: (0, type_utils_1.asOptional)((0, type_utils_1.asEnum)(constants_1.GRADES)),
    useNewSchoolsEligibility: (0, type_utils_1.asOptional)(type_utils_1.asBoolean),
});
class ExistingUserError extends ts_custom_error_1.CustomError {
}
exports.ExistingUserError = ExistingUserError;
async function checkEligibility(ip, payload) {
    const { schoolUpchieveId, zipCode: zipCodeInput, email, referredByCode, currentGrade, } = asCheckEligibilityPayload(payload);
    if (email) {
        const existingUser = await (0, queries_4.getUserIdByEmail)(email);
        if (existingUser)
            throw new ExistingUserError();
    }
    const isCollegeStudent = currentGrade === constants_1.GRADES.COLLEGE;
    if (email) {
        const existingIneligible = await (0, queries_3.getIneligibleStudentByEmail)(email);
        if (existingIneligible) {
            return { isEligible: false, isCollegeStudent };
        }
    }
    const school = schoolUpchieveId
        ? await (0, queries_1.getSchoolById)(schoolUpchieveId)
        : undefined;
    const zipCode = zipCodeInput
        ? await (0, queries_2.getZipCodeByZipCode)(zipCodeInput)
        : undefined;
    const isEligibleBySchool = isSchoolApproved(school);
    const isEligibleByZipCode = isZipCodeEligible(zipCode);
    const isStudentEligible = (isEligibleBySchool || isEligibleByZipCode) && !isCollegeStudent;
    if (!isStudentEligible) {
        const referredBy = await UserCtrl.checkReferral(referredByCode);
        if (email) {
            await (0, queries_3.insertIneligibleStudent)(email, school === null || school === void 0 ? void 0 : school.id, zipCodeInput, currentGrade, referredBy, ip);
        }
    }
    return {
        isEligible: isStudentEligible,
        isCollegeStudent,
    };
}
exports.checkEligibility = checkEligibility;
async function verifyEligibility(zipCode, schoolUpchieveId) {
    const school = schoolUpchieveId
        ? await (0, queries_1.getSchoolById)(schoolUpchieveId)
        : undefined;
    const zipCodeData = zipCode ? await (0, queries_2.getZipCodeByZipCode)(zipCode) : undefined;
    return isSchoolApproved(school) || isZipCodeEligible(zipCodeData);
}
exports.verifyEligibility = verifyEligibility;
async function checkZipCode(param) {
    const zipCode = (0, type_utils_1.asString)(param);
    const foundZip = await (0, queries_2.getZipCodeByZipCode)(zipCode);
    return !!foundZip;
}
exports.checkZipCode = checkZipCode;
function isZipCodeEligible(zipCode) {
    return !!zipCode && zipCode.isEligible;
}
function isSchoolApproved(school) {
    return (!!school &&
        (school.isAdminApproved ||
            school.isPartner ||
            isNewSchoolEligibilityApproved()));
    function isNewSchoolEligibilityApproved() {
        return (isTitle1Eligible() ||
            hasCEONationalSchoolLunch() ||
            hasFreeReducedLunchAboveThreshold(config_1.default.eligibleFRLThreshold));
    }
    function isTitle1Eligible() {
        return (school === null || school === void 0 ? void 0 : school.isSchoolWideTitle1) || (school === null || school === void 0 ? void 0 : school.isTitle1Eligible);
    }
    function hasCEONationalSchoolLunch() {
        return ((school === null || school === void 0 ? void 0 : school.nationalSchoolLunchProgram) ===
            'Yes under Community Eligibility Option (CEO)');
    }
    function hasFreeReducedLunchAboveThreshold(thresholdPercentage) {
        var _a, _b;
        if (!school || !school.totalStudents) {
            return false;
        }
        const freeReducedLunchStudents = Math.max((_a = school === null || school === void 0 ? void 0 : school.nslpDirectCertification) !== null && _a !== void 0 ? _a : 0, (_b = school === null || school === void 0 ? void 0 : school.frlEligible) !== null && _b !== void 0 ? _b : 0);
        return freeReducedLunchStudents / school.totalStudents > thresholdPercentage;
    }
}
exports.isSchoolApproved = isSchoolApproved;
