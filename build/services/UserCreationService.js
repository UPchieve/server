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
exports.createPartnerStudent = exports.registerStudent = exports.verifyStudentData = exports.rosterPartnerStudents = void 0;
const db_1 = require("../db");
const auth_utils_1 = require("../utils/auth-utils");
const MailService_1 = require("./MailService");
const UserRepo = __importStar(require("../models/User"));
const StudentRepo = __importStar(require("../models/Student"));
const StudentPartnerOrgRepo = __importStar(require("../models/StudentPartnerOrg"));
const UserSessionMetrics_1 = require("../models/UserSessionMetrics");
const UserProductFlags_1 = require("../models/UserProductFlags");
const UserAction_1 = require("../models/UserAction");
const SignUpSourceRepo = __importStar(require("../models/SignUpSource"));
const user_1 = require("../constants/user");
const constants_1 = require("../constants");
const EventsService_1 = require("./EventsService");
const StudentPartnerOrg_1 = require("../models/StudentPartnerOrg");
const FederatedCredential_1 = require("../models/FederatedCredential");
const AuthService_1 = require("./AuthService");
const EligibilityService_1 = require("./EligibilityService");
const ParentGuardian_1 = require("../models/ParentGuardian");
const Errors_1 = require("../models/Errors");
async function rosterPartnerStudents(students, schoolId, partnerKey, partnerSite) {
    var _a;
    const newUsers = [];
    const updatedUsers = [];
    const failedUsers = [];
    const signUpSource = await SignUpSourceRepo.getSignUpSourceByName('Roster', (0, db_1.getClient)());
    for (const student of students) {
        try {
            await (0, db_1.runInTransaction)(async (tc) => {
                (0, auth_utils_1.checkNames)(student.firstName, student.lastName);
                (0, auth_utils_1.checkEmail)(student.email);
                if (student.proxyEmail)
                    (0, auth_utils_1.checkEmail)(student.proxyEmail);
                if (student.password) {
                    student.password = await (0, auth_utils_1.hashPassword)(student.password);
                }
                const passwordResetToken = !student.password
                    ? (0, auth_utils_1.createResetToken)()
                    : undefined;
                const userData = {
                    email: student.email,
                    emailVerified: true,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    password: student.password,
                    passwordResetToken,
                    proxyEmail: student.proxyEmail,
                    signupSourceId: signUpSource === null || signUpSource === void 0 ? void 0 : signUpSource.id,
                    verified: true,
                };
                const user = await upsertUser(userData, undefined, constants_1.USER_ROLES.STUDENT, tc);
                const studentData = {
                    userId: user.id,
                    gradeLevel: parseInt(student.gradeLevel).toFixed(0) + 'th',
                    partnerSite,
                    schoolId,
                    studentPartnerOrg: partnerKey,
                };
                await upsertStudent(studentData, tc);
                if (user.isCreated) {
                    newUsers.push({ passwordResetToken, ...user });
                }
                else {
                    updatedUsers.push(user);
                }
            });
        }
        catch {
            failedUsers.push({
                email: student.email,
                firstName: student.firstName,
            });
        }
    }
    for (const user of newUsers) {
        if (user.passwordResetToken) {
            await (0, MailService_1.sendRosterStudentSetPasswordEmail)((_a = user.proxyEmail) !== null && _a !== void 0 ? _a : user.email, user.firstName, user.passwordResetToken);
        }
    }
    return { failed: failedUsers, updated: updatedUsers, created: newUsers };
}
exports.rosterPartnerStudents = rosterPartnerStudents;
async function verifyStudentData(data) {
    (0, auth_utils_1.checkEmail)(data.email);
    (0, auth_utils_1.checkNames)(data.firstName, data.lastName);
    await (0, AuthService_1.checkUser)(data.email);
    if (usePassword(data)) {
        (0, auth_utils_1.checkPassword)(data.password);
    }
    if (!data.studentPartnerOrg) {
        await (0, EligibilityService_1.verifyEligibility)(data.zipCode, data.schoolId);
    }
    if (data.ip) {
        await (0, AuthService_1.checkIpAddress)(data.ip);
    }
    if (!usePassword(data) && !useResetToken(data) && !useFedCred(data)) {
        throw new Errors_1.InputError('No authentication method provided.');
    }
}
exports.verifyStudentData = verifyStudentData;
async function registerStudent(data) {
    await verifyStudentData(data);
    const newStudent = await (0, db_1.runInTransaction)(async (tc) => {
        const passwordResetToken = useResetToken(data)
            ? (0, auth_utils_1.createResetToken)()
            : undefined;
        const userData = {
            email: data.email,
            emailVerified: useFedCred(data),
            firstName: data.firstName,
            lastName: data.lastName,
            password: usePassword(data)
                ? await (0, auth_utils_1.hashPassword)(data.password)
                : undefined,
            passwordResetToken,
            referredBy: await (0, auth_utils_1.getReferredBy)(data.referredByCode),
            verified: useFedCred(data),
        };
        const user = await createUser(userData, data.ip, constants_1.USER_ROLES.STUDENT, tc);
        const studentData = {
            college: data.college,
            userId: user.id,
            gradeLevel: data.gradeLevel,
            partnerSite: data.studentPartnerSite,
            schoolId: data.schoolId,
            studentPartnerOrg: data.studentPartnerOrg,
            zipCode: data.zipCode,
        };
        await upsertStudent(studentData, tc);
        if (useFedCred(data)) {
            await (0, FederatedCredential_1.insertFederatedCredential)(data.profileId, data.issuer, user.id, tc);
        }
        if (useParentGuardianEmail(data) && passwordResetToken) {
            const parentGuardian = await (0, ParentGuardian_1.createParentGuardian)(data.parentGuardianEmail, tc);
            await (0, ParentGuardian_1.linkParentGuardianToStudent)(parentGuardian.id, user.id, tc);
            await (0, MailService_1.sendReset)(data.email, passwordResetToken);
        }
        return user;
    });
    EventsService_1.emitter.emit(constants_1.USER_EVENTS.USER_CREATED, newStudent.id);
    EventsService_1.emitter.emit(constants_1.STUDENT_EVENTS.STUDENT_CREATED, newStudent.id);
    return {
        ...newStudent,
        isAdmin: false,
        isVolunteer: false,
    };
}
exports.registerStudent = registerStudent;
async function createPartnerStudent(data) {
    let user;
    await (0, db_1.runInTransaction)(async (tc) => {
        if (!data.studentPartnerOrg) {
            throw new Error('Student Partner Org key unexpectedly null.');
        }
        const hasFederatedCredential = !!data.profileId && !!data.issuer;
        const userData = {
            email: data.email,
            emailVerified: hasFederatedCredential,
            firstName: data.firstName,
            lastName: data.lastName,
            verified: hasFederatedCredential,
        };
        user = await createUser(userData, undefined, constants_1.USER_ROLES.STUDENT, tc);
        const spo = await (0, StudentPartnerOrg_1.getStudentPartnerOrgByKey)(tc, data.studentPartnerOrg);
        const studentData = {
            userId: user.id,
            studentPartnerOrg: data.studentPartnerOrg,
            schoolId: spo === null || spo === void 0 ? void 0 : spo.schoolId,
        };
        await upsertStudent(studentData, tc);
        if (hasFederatedCredential) {
            await (0, FederatedCredential_1.insertFederatedCredential)(data.profileId, data.issuer, user.id, tc);
        }
    });
    return user;
}
exports.createPartnerStudent = createPartnerStudent;
async function createUser(userData, ip, role, tc) {
    const user = await UserRepo.createUser(userData, tc);
    await createUserMetadata(user.id, ip, role, tc);
    return user;
}
async function upsertUser(userData, ip, role, tc) {
    const user = await UserRepo.upsertUser(userData, tc);
    if (user.isCreated) {
        await createUserMetadata(user.id, ip, role, tc);
    }
    return user;
}
async function createUserMetadata(userId, ip, role, tc) {
    // TODO: Should any of these be moved to the listener?
    await Promise.all([
        UserRepo.insertUserRoleByUserId(userId, role, tc),
        (0, UserSessionMetrics_1.createUSMByUserId)(userId, tc),
        (0, UserProductFlags_1.createUPFByUserId)(userId, tc),
        (0, UserAction_1.createAccountAction)({
            action: user_1.ACCOUNT_USER_ACTIONS.CREATED,
            userId: userId,
            ipAddress: ip,
        }, tc),
    ]);
}
async function upsertStudent(studentData, tc) {
    const activeInstances = await StudentRepo.getActivePartnersForStudent(studentData.userId, tc);
    let spoOrgToAdd = studentData.studentPartnerOrg
        ? await StudentPartnerOrgRepo.getStudentPartnerOrgByKey(tc, studentData.studentPartnerOrg)
        : null;
    let spoSchoolToAdd = 
    // Don't add a school student partner org from the school id if
    // the non-school student partner org to add is that already school.
    studentData.schoolId && (spoOrgToAdd === null || spoOrgToAdd === void 0 ? void 0 : spoOrgToAdd.schoolId) !== studentData.schoolId
        ? await StudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId(tc, studentData.schoolId)
        : null;
    for (const a of activeInstances !== null && activeInstances !== void 0 ? activeInstances : []) {
        if (spoOrgToAdd && spoOrgToAdd.partnerId === a.id) {
            // The non-school student partner org we want to add for the student
            // already has an active instance.
            spoOrgToAdd = null;
        }
        else if (spoSchoolToAdd && spoSchoolToAdd.partnerId === a.id) {
            // The school student partner org we want to add for the student
            // already has an active instance.
            spoSchoolToAdd = null;
        }
        else {
            // This active instance doesn't match any of the ones we want to add
            // for that student. We can deactivate it.
            await StudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance(tc, studentData.userId, a.id);
        }
    }
    if (spoOrgToAdd) {
        await addUserStudentPartnerOrgInstance(spoOrgToAdd);
    }
    if (spoSchoolToAdd) {
        await addUserStudentPartnerOrgInstance(spoSchoolToAdd);
    }
    if ((spoOrgToAdd === null || spoOrgToAdd === void 0 ? void 0 : spoOrgToAdd.schoolId) && !studentData.schoolId) {
        studentData.schoolId = spoOrgToAdd.schoolId;
    }
    await StudentRepo.upsertStudentProfile(studentData, tc);
    async function addUserStudentPartnerOrgInstance(spo) {
        await StudentPartnerOrgRepo.createUserStudentPartnerOrgInstance({
            userId: studentData.userId,
            studentPartnerOrgId: spo.partnerId,
            studentPartnerOrgSiteId: spo.siteId,
        }, tc);
    }
}
function useFedCred(object) {
    return 'profileId' in object && 'issuer' in object;
}
function usePassword(object) {
    return 'password' in object && object.password;
}
function useResetToken(object) {
    return 'parentGuardianEmail' in object && object.parentGuardianEmail;
}
function useParentGuardianEmail(object) {
    return 'parentGuardianEmail' in object && object.parentGuardianEmail;
}
