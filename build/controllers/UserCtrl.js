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
exports.isCertified = exports.createVolunteer = exports.createStudentWithFederatedCredential = exports.createStudentWithPassword = exports.checkReferral = void 0;
const node_1 = require("@sentry/node");
const USMRepo = __importStar(require("../models/UserSessionMetrics"));
const UPFRepo = __importStar(require("../models/UserProductFlags"));
const UserRepo = __importStar(require("../models/User"));
const StudentRepo = __importStar(require("../models/Student"));
const VolunteerRepo = __importStar(require("../models/Volunteer"));
const UserActionRepo = __importStar(require("../models/UserAction"));
const FederatedCredentialRepo = __importStar(require("../models/FederatedCredential"));
const MailService_1 = require("../services/MailService");
const auth_utils_1 = require("../utils/auth-utils");
const EventsService_1 = require("../services/EventsService");
const constants_1 = require("../constants");
async function checkReferral(referredByCode) {
    if (referredByCode) {
        try {
            const user = await UserRepo.getUserContactInfoByReferralCode(referredByCode);
            if (user)
                return user.id;
        }
        catch (error) {
            (0, node_1.captureException)(error);
        }
    }
}
exports.checkReferral = checkReferral;
async function createStudentWithPassword(studentData, ip) {
    studentData.password = await (0, auth_utils_1.hashPassword)(studentData.password);
    return createStudent(studentData, ip);
}
exports.createStudentWithPassword = createStudentWithPassword;
async function createStudentWithFederatedCredential(studentData, profileId, issuer, ip) {
    const student = await createStudent(studentData, ip);
    await FederatedCredentialRepo.insertFederatedCredential(profileId, issuer, student.id);
    return student;
}
exports.createStudentWithFederatedCredential = createStudentWithFederatedCredential;
// TODO: duck type validation - studentData payload
async function createStudent(studentData, ip) {
    const student = await StudentRepo.createStudent(studentData);
    // Create a USM object for this new user
    try {
        await USMRepo.createUSMByUserId(student.id);
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    // Create a UPF object for this new user
    try {
        await UPFRepo.createUPFByUserId(student.id);
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    try {
        await UserActionRepo.createAccountAction({
            action: constants_1.ACCOUNT_USER_ACTIONS.CREATED,
            userId: student.id,
            ipAddress: ip,
        });
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    try {
        await (0, MailService_1.createContact)(student.id);
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    EventsService_1.emitter.emit(constants_1.STUDENT_EVENTS.STUDENT_CREATED, student.id);
    return student;
}
// TODO: duck type validation - volunteerData payload
async function createVolunteer(volunteerData, ip) {
    volunteerData.password = await (0, auth_utils_1.hashPassword)(volunteerData.password);
    // Replaced by VolunteerRepo.createVolunteer
    const volunteer = await VolunteerRepo.createVolunteer(volunteerData);
    // Create a USM object for this new user
    try {
        await USMRepo.createUSMByUserId(volunteer.id);
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    // Create a UPF object for this new user
    try {
        await UPFRepo.createUPFByUserId(volunteer.id);
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    try {
        await UserActionRepo.createAccountAction({
            action: constants_1.ACCOUNT_USER_ACTIONS.CREATED,
            userId: volunteer.id,
            ipAddress: ip,
        });
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    try {
        // needs id, firstname, lastname, email, isvolunteer, banned, testuser, admin, deactivated, createdat
        await (0, MailService_1.createContact)(volunteer.id);
    }
    catch (err) {
        (0, node_1.captureException)(err);
    }
    // needs to return id and partner org for frontend
    return volunteer;
}
exports.createVolunteer = createVolunteer;
// TODO: I think we can nuke this pending reportutils finalization
function isCertified(certifications) {
    let isCertified = false;
    for (const subject in certifications) {
        if (Object.prototype.hasOwnProperty.call(certifications, subject) &&
            certifications[subject].passed) {
            isCertified = true;
            break;
        }
    }
    return isCertified;
}
exports.isCertified = isCertified;
