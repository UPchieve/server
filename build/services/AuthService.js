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
exports.getFederatedCredential = exports.deleteAllUserSessions = exports.confirmReset = exports.sendReset = exports.lookupSponsorOrgs = exports.lookupVolunteerPartners = exports.lookupStudentPartners = exports.lookupPartnerStudentCode = exports.lookupPartnerStudent = exports.lookupPartnerVolunteer = exports.registerPartnerVolunteer = exports.registerVolunteer = exports.registerPartnerStudent = exports.registerOpenStudent = exports.checkUser = exports.checkCredential = exports.checkIpAddress = void 0;
const validator_1 = __importDefault(require("validator"));
const queries_1 = require("../models/User/queries");
const FederatedCredentialRepo = __importStar(require("../models/FederatedCredential"));
const queries_2 = require("../models/School/queries");
const UserCtrl = __importStar(require("../controllers/UserCtrl"));
const VolunteerPartnerOrg_1 = require("../models/VolunteerPartnerOrg");
const StudentPartnerOrg_1 = require("../models/StudentPartnerOrg");
const SponsorOrg_1 = require("../models/SponsorOrg");
const auth_utils_1 = require("../utils/auth-utils");
const type_utils_1 = require("../utils/type-utils");
const Errors_1 = require("../models/Errors");
const logger_1 = __importDefault(require("../logger"));
const VolunteerService = __importStar(require("./VolunteerService"));
const IpAddressService_1 = require("./IpAddressService");
const MailService = __importStar(require("./MailService"));
const AuthRepo = __importStar(require("../models/Auth"));
const config_1 = __importDefault(require("../config"));
const EligibilityService_1 = require("./EligibilityService");
async function checkIpAddress(ip) {
    const { country_code: countryCode } = await (0, IpAddressService_1.getIpWhoIs)(ip);
    if (countryCode && countryCode !== 'US') {
        throw new Errors_1.NotAllowedError('Cannot register from an international IP address');
    }
}
exports.checkIpAddress = checkIpAddress;
// Handlers
/**
 * In all the handlers below we do not wrap external service calls
 * in try/catch statements and let errors bubble up.
 * i.e. We only handle errors known by the Auth service
 * Other services should throw their own custom error types that'll get
 * caught by the generic error handler in the router
 */
// TODO: effective logging
// Registration handlers
// Handles /register/checkcred route
async function checkCredential(data) {
    const { email, password } = (0, auth_utils_1.asCredentialData)(data);
    if (!email || !password)
        throw new Errors_1.InputError('Must supply an email and password for registration');
    if (!validator_1.default.isEmail(email))
        throw new auth_utils_1.RegistrationError('Must supply a valid email address');
    (0, auth_utils_1.checkPassword)(password);
    await checkUser(email);
    return true;
}
exports.checkCredential = checkCredential;
async function checkUser(email) {
    const user = await (0, queries_1.getUserIdByEmail)(email);
    if (user) {
        throw new Errors_1.LookupError('The email address you entered is already in use');
    }
}
exports.checkUser = checkUser;
// Handles /register/student/open route
async function registerOpenStudent(data) {
    const { ip, email, password, highSchoolId: highSchoolUpchieveId, zipCode, terms, referredByCode, firstName, lastName, currentGrade, signupSourceId, otherSignupSource, } = (0, auth_utils_1.asOpenStudentRegData)(data);
    await Promise.all([
        checkCredential({ email, password }),
        checkIpAddress(ip),
        (0, auth_utils_1.checkNames)(firstName, lastName),
        (0, auth_utils_1.checkEmail)(email),
    ]);
    if (!terms) {
        throw new auth_utils_1.RegistrationError('Must accept the user agreement');
    }
    if (!(await (0, EligibilityService_1.verifyEligibility)(zipCode, highSchoolUpchieveId))) {
        throw new auth_utils_1.RegistrationError('Not eligible.');
    }
    const referredBy = await (0, auth_utils_1.getReferredBy)(referredByCode);
    const studentData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        zipCode,
        approvedHighschool: highSchoolUpchieveId,
        referredBy,
        password,
        currentGrade,
        signupSourceId,
        otherSignupSource,
    };
    const student = await UserCtrl.createStudentWithPassword(studentData, ip);
    return student;
}
exports.registerOpenStudent = registerOpenStudent;
// Handles /register/student/partner route
async function registerPartnerStudent(data) {
    const { ip, email, password, studentPartnerOrg, partnerUserId, highSchoolId: highSchoolUpchieveId, zipCode, terms, referredByCode, firstName, lastName, college, partnerSite, currentGrade, signupSourceId, otherSignupSource, } = (0, auth_utils_1.asPartnerStudentRegData)(data);
    await Promise.all([
        checkCredential({ email, password }),
        (0, auth_utils_1.checkNames)(firstName, lastName),
        (0, auth_utils_1.checkEmail)(email),
    ]);
    if (!terms) {
        throw new auth_utils_1.RegistrationError('Must accept the user agreement');
    }
    let studentPartnerManifest;
    try {
        studentPartnerManifest = await (0, StudentPartnerOrg_1.getStudentPartnerOrgForRegistrationByKey)(studentPartnerOrg);
    }
    catch (err) {
        throw new auth_utils_1.RegistrationError('Invalid student partner organization');
    }
    let school;
    if (highSchoolUpchieveId) {
        school = await (0, queries_2.getSchoolById)(highSchoolUpchieveId);
    }
    else if (studentPartnerManifest.schoolSignupRequired && !college) {
        throw new auth_utils_1.RegistrationError('Student partner organization requires school, but none provided');
    }
    let referredBy;
    if (referredByCode)
        referredBy = await (0, auth_utils_1.getReferredBy)(referredByCode);
    const studentData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        zipCode,
        studentPartnerOrg,
        partnerUserId,
        partnerSite,
        approvedHighschool: school === null || school === void 0 ? void 0 : school.id,
        college,
        isVolunteer: false,
        verified: false,
        referredBy,
        password,
        currentGrade,
        signupSourceId: studentPartnerOrg === config_1.default.customManualStudentPartnerOrg
            ? signupSourceId
            : undefined,
        otherSignupSource: studentPartnerOrg === config_1.default.customManualStudentPartnerOrg
            ? otherSignupSource
            : undefined,
    };
    const student = await UserCtrl.createStudentWithPassword(studentData, ip);
    return student;
}
exports.registerPartnerStudent = registerPartnerStudent;
// Handles /register/volunteer/open route
async function registerVolunteer(data) {
    const { ip, email, password, phone, terms, referredByCode, firstName, lastName, timezone, signupSourceId, otherSignupSource, } = (0, auth_utils_1.asVolunteerRegData)(data);
    await Promise.all([
        checkCredential({ email, password }),
        (0, auth_utils_1.checkNames)(firstName, lastName),
        (0, auth_utils_1.checkPhone)(phone),
        (0, auth_utils_1.checkEmail)(email),
    ]);
    if (!terms) {
        throw new auth_utils_1.RegistrationError('Must accept the user agreement');
    }
    let referredBy;
    if (referredByCode)
        referredBy = await (0, auth_utils_1.getReferredBy)(referredByCode);
    const volunteerData = {
        email,
        phone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        referredBy,
        password,
        timezone,
        volunteerPartnerOrg: undefined,
        signupSourceId,
        otherSignupSource,
    };
    const volunteer = await UserCtrl.createVolunteer(volunteerData, ip);
    VolunteerService.queueOnboardingReminderOneEmail(volunteer.id);
    return volunteer;
}
exports.registerVolunteer = registerVolunteer;
// Handles /register/volunteer/partner route
async function registerPartnerVolunteer(data) {
    const { ip, email, password, volunteerPartnerOrg, phone, terms, referredByCode, firstName, lastName, timezone, } = (0, auth_utils_1.asPartnerVolunteerRegData)(data);
    await Promise.all([
        checkCredential({ email, password }),
        (0, auth_utils_1.checkNames)(firstName, lastName),
        (0, auth_utils_1.checkPhone)(phone),
        (0, auth_utils_1.checkEmail)(email),
    ]);
    if (!terms) {
        throw new auth_utils_1.RegistrationError('Must accept the user agreement');
    }
    let referredBy;
    if (referredByCode)
        referredBy = await (0, auth_utils_1.getReferredBy)(referredByCode);
    // Volunteer partner org check
    let volunteerPartnerManifest;
    try {
        volunteerPartnerManifest = await (0, VolunteerPartnerOrg_1.getVolunteerPartnerOrgForRegistrationByKey)(volunteerPartnerOrg);
    }
    catch (err) {
        throw new auth_utils_1.RegistrationError('Invalid volunteer partner organization');
    }
    const volunteerPartnerDomains = volunteerPartnerManifest.domains;
    // Confirm email has one of volunteer partner's required domains
    if (volunteerPartnerDomains && volunteerPartnerDomains.length) {
        const userEmailDomain = email.split('@')[1];
        if (volunteerPartnerDomains.indexOf(userEmailDomain) === -1)
            throw new auth_utils_1.RegistrationError('Invalid email domain for volunteer partner organization');
    }
    const volunteerData = {
        email,
        volunteerPartnerOrg,
        phone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        verified: false,
        referredBy,
        password,
        timezone,
    };
    const volunteer = await UserCtrl.createVolunteer(volunteerData, ip);
    VolunteerService.queueOnboardingReminderOneEmail(volunteer.id);
    return volunteer;
}
exports.registerPartnerVolunteer = registerPartnerVolunteer;
// Partner lookup handlers
// Handles /partner/volunteer route
async function lookupPartnerVolunteer(data) {
    const volunteerPartnerKey = (0, type_utils_1.asString)(data);
    // If missing master manifest error will bubble up
    let partnerOrg;
    try {
        partnerOrg = await (0, VolunteerPartnerOrg_1.getFullVolunteerPartnerOrgByKey)(volunteerPartnerKey);
    }
    catch (err) {
        throw new Errors_1.LookupError(`No manifest found for volunteerPartnerId "${volunteerPartnerKey}"`);
    }
    return partnerOrg;
}
exports.lookupPartnerVolunteer = lookupPartnerVolunteer;
// Handles /partner/student route
async function lookupPartnerStudent(data) {
    const studentPartnerKey = (0, type_utils_1.asString)(data);
    // If missing master manifest error will bubble up
    let partnerOrg;
    try {
        partnerOrg = await (0, StudentPartnerOrg_1.getFullStudentPartnerOrgByKey)(studentPartnerKey);
    }
    catch (err) {
        throw new Errors_1.LookupError(`No manifest found for studentPartnerId "${studentPartnerKey}"`);
    }
    return partnerOrg;
}
exports.lookupPartnerStudent = lookupPartnerStudent;
// Handles /partner/student/code route
async function lookupPartnerStudentCode(data) {
    const partnerSignupCode = (0, type_utils_1.asString)(data);
    const studentPartnerKey = (0, StudentPartnerOrg_1.getStudentPartnerOrgKeyByCode)(partnerSignupCode.toUpperCase());
    if (!studentPartnerKey)
        throw new Errors_1.LookupError(`no partner key found for partnerSignupCode "${partnerSignupCode}"`);
    return studentPartnerKey;
}
exports.lookupPartnerStudentCode = lookupPartnerStudentCode;
// Handles /partner/student-partners route (admin only)
async function lookupStudentPartners() {
    const partnerOrgs = await (0, StudentPartnerOrg_1.getStudentPartnerOrgs)();
    return partnerOrgs;
}
exports.lookupStudentPartners = lookupStudentPartners;
// Handles /partner/volunteer-partners route (admin only)
async function lookupVolunteerPartners() {
    const partnerOrgs = await (0, VolunteerPartnerOrg_1.getVolunteerPartnerOrgs)();
    return partnerOrgs;
}
exports.lookupVolunteerPartners = lookupVolunteerPartners;
// Handles /partner/sponsor-orgs route (admin only)
async function lookupSponsorOrgs() {
    const sponsorOrgs = await (0, SponsorOrg_1.getSponsorOrgs)();
    return sponsorOrgs;
}
exports.lookupSponsorOrgs = lookupSponsorOrgs;
// Password reset handlers
// Handles /reset/send route
async function sendReset(email) {
    var _a;
    const userEmail = (0, type_utils_1.asString)(email);
    const user = await (0, queries_1.getUserForPassport)(userEmail);
    if (!user)
        throw new Errors_1.LookupError(`No account with ${userEmail} found`);
    const token = (0, auth_utils_1.createResetToken)();
    await (0, queries_1.updateUserResetTokenById)(user.id, token);
    const toEmail = (_a = user.proxyEmail) !== null && _a !== void 0 ? _a : user.email;
    await MailService.sendReset(toEmail, token);
}
exports.sendReset = sendReset;
async function confirmReset(data) {
    const { email, password, newpassword: reenteredPassword, token, } = (0, auth_utils_1.asResetConfirmData)(data);
    // make sure token is a valid 16-byte hex string
    if (!token.match(/^[a-f0-9]{32}$/)) {
        // early exit
        throw new auth_utils_1.ResetError('Invalid password reset token');
    }
    if (password !== reenteredPassword)
        throw new auth_utils_1.ResetError('The passwords you entered do not match');
    const user = await (0, queries_1.getUserContactInfoByResetToken)(token);
    if (!user)
        throw new Errors_1.LookupError('No account found with provided password reset token');
    // case match strings
    if (user.email.toLowerCase() !== email.toLowerCase())
        throw new auth_utils_1.ResetError('Email did not match the password reset token');
    (0, auth_utils_1.checkPassword)(password);
    await (0, queries_1.updateUserPasswordById)(user.id, await (0, auth_utils_1.hashPassword)(password));
}
exports.confirmReset = confirmReset;
async function deleteAllUserSessions(userId) {
    try {
        await AuthRepo.deleteAuthSessionsByUserId(userId);
    }
    catch (err) {
        logger_1.default.error(`Unable to invalidate all user sessions on password reset: ${err}`);
    }
}
exports.deleteAllUserSessions = deleteAllUserSessions;
async function getFederatedCredential(id, issuer) {
    try {
        return FederatedCredentialRepo.getFederatedCredential(id, issuer);
    }
    catch (err) {
        logger_1.default.error(`Failed to get federated credential.`);
    }
}
exports.getFederatedCredential = getFederatedCredential;
