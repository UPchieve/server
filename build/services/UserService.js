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
exports.deletePhoneFromAccount = exports.updateUserProfile = exports.getUsers = exports.adminUpdateUser = exports.flagForDeletion = exports.deleteReference = exports.notifyReferenceApology = exports.notifyReference = exports.saveReferenceForm = exports.addReference = exports.addPhotoId = exports.parseUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const Errors_1 = require("../models/Errors");
const IpAddress_1 = require("../models/IpAddress");
const Student_1 = require("../models/Student");
const User_1 = require("../models/User");
const Volunteer_1 = require("../models/Volunteer");
const reference_utils_1 = require("../utils/reference-utils");
const type_utils_1 = require("../utils/type-utils");
const AnalyticsService = __importStar(require("./AnalyticsService"));
const MailService = __importStar(require("./MailService"));
const logger_1 = __importDefault(require("../logger"));
const UserAction_1 = require("../models/UserAction");
const legacy_user_1 = require("../models/User/legacy-user");
async function parseUser(baseUser) {
    const user = await (0, legacy_user_1.getLegacyUserObject)(baseUser.id);
    // Approved volunteer
    if (user.isVolunteer && user.isApproved) {
        user.hoursTutored = Number(user.hoursTutored);
        return (0, lodash_1.omit)(user, ['references', 'photoIdS3Key', 'photoIdStatus']);
    }
    // Student or unapproved volunteer
    return user;
}
exports.parseUser = parseUser;
async function addPhotoId(userId, ip) {
    const photoIdS3Key = crypto_1.default.randomBytes(32).toString('hex');
    await (0, UserAction_1.createAccountAction)({
        userId,
        ipAddress: ip,
        action: constants_1.ACCOUNT_USER_ACTIONS.ADDED_PHOTO_ID,
    });
    await (0, Volunteer_1.updateVolunteerPhotoIdById)(userId, photoIdS3Key, constants_1.PHOTO_ID_STATUS.SUBMITTED);
    return photoIdS3Key;
}
exports.addPhotoId = addPhotoId;
const asAddReferencePayload = (0, type_utils_1.asFactory)({
    userId: type_utils_1.asString,
    userEmail: type_utils_1.asString,
    referenceFirstName: type_utils_1.asString,
    referenceLastName: type_utils_1.asString,
    referenceEmail: type_utils_1.asString,
    ip: type_utils_1.asString,
});
async function addReference(data) {
    const { userId, userEmail, referenceFirstName, referenceLastName, referenceEmail, ip, } = asAddReferencePayload(data);
    const referenceData = {
        firstName: referenceFirstName,
        lastName: referenceLastName,
        email: referenceEmail.toLowerCase(),
    };
    if (userEmail === referenceData.email) {
        throw new Errors_1.NotAllowedError('Your reference cannot have the same email address as you.');
    }
    const isExistingReference = await (0, Volunteer_1.checkReferenceExistsBeforeAdding)(userId, referenceEmail);
    if (isExistingReference &&
        isExistingReference.email.toLowerCase() === referenceEmail.toLowerCase() &&
        !isExistingReference.actions.includes(constants_1.ACCOUNT_USER_ACTIONS.REJECTED_REFERENCE)) {
        await (0, Volunteer_1.updateVolunteerReferenceStatus)(isExistingReference.id, constants_1.REFERENCE_STATUS.UNSENT);
        await (0, UserAction_1.createAccountAction)({
            userId,
            ipAddress: ip,
            action: constants_1.ACCOUNT_USER_ACTIONS.ADDED_REFERENCE,
            referenceEmail,
        });
        return;
    }
    else if (isExistingReference &&
        isExistingReference.actions.includes(constants_1.ACCOUNT_USER_ACTIONS.REJECTED_REFERENCE)) {
        throw new Errors_1.NotAllowedError('You cannot re-add a rejected reference.');
    }
    await (0, Volunteer_1.addVolunteerReferenceById)(userId, referenceData);
    await (0, UserAction_1.createAccountAction)({
        userId,
        ipAddress: ip,
        action: constants_1.ACCOUNT_USER_ACTIONS.ADDED_REFERENCE,
        referenceEmail,
    });
}
exports.addReference = addReference;
async function saveReferenceForm(userId, referenceId, referenceEmail, referenceFormData, ip) {
    const { affiliation, relationshipLength, patient, positiveRoleModel, agreeableAndApproachable, communicatesEffectively, trustworthyWithChildren, rejectionReason, additionalInfo, } = (0, reference_utils_1.asReferenceFormData)(referenceFormData);
    await (0, UserAction_1.createAccountAction)({
        userId,
        ipAddress: ip,
        action: constants_1.ACCOUNT_USER_ACTIONS.SUBMITTED_REFERENCE_FORM,
        referenceEmail,
    });
    await (0, Volunteer_1.updateVolunteerReferenceSubmission)(referenceId, {
        affiliation,
        relationshipLength,
        patient,
        positiveRoleModel,
        agreeableAndApproachable,
        communicatesEffectively,
        trustworthyWithChildren,
        rejectionReason,
        additionalInfo,
    });
}
exports.saveReferenceForm = saveReferenceForm;
async function notifyReference(reference, volunteer) {
    // TODO: error handling - these need to be 'atomic'
    await MailService.sendReferenceForm(reference, volunteer);
    await (0, Volunteer_1.updateVolunteerReferenceSentById)(reference.id);
}
exports.notifyReference = notifyReference;
// TODO: remove once job is executed
async function notifyReferenceApology(reference, volunteer) {
    await MailService.sendReferenceFormApology(reference, volunteer);
    await (0, Volunteer_1.updateVolunteerReferenceSentById)(reference.id);
}
exports.notifyReferenceApology = notifyReferenceApology;
async function deleteReference(userId, referenceEmail, ip) {
    await (0, UserAction_1.createAccountAction)({
        userId,
        ipAddress: ip,
        action: constants_1.ACCOUNT_USER_ACTIONS.DELETED_REFERENCE,
        referenceEmail,
    });
    AnalyticsService.captureEvent(userId, constants_1.EVENTS.REFERENCE_DELETED, {
        event: constants_1.EVENTS.REFERENCE_DELETED,
        referenceEmail,
    });
    await (0, Volunteer_1.deleteVolunteerReferenceByEmail)(userId, referenceEmail);
}
exports.deleteReference = deleteReference;
const asAdminUpdate = (0, type_utils_1.asFactory)({
    userId: type_utils_1.asString,
    firstName: (0, type_utils_1.asOptional)(type_utils_1.asString),
    lastName: (0, type_utils_1.asOptional)(type_utils_1.asString),
    email: type_utils_1.asString,
    partnerOrg: (0, type_utils_1.asOptional)(type_utils_1.asString),
    partnerSite: (0, type_utils_1.asOptional)(type_utils_1.asString),
    isVerified: type_utils_1.asBoolean,
    isBanned: type_utils_1.asBoolean,
    isDeactivated: type_utils_1.asBoolean,
    isApproved: (0, type_utils_1.asOptional)(type_utils_1.asBoolean),
    inGatesStudy: (0, type_utils_1.asOptional)(type_utils_1.asBoolean),
    partnerSchool: (0, type_utils_1.asOptional)(type_utils_1.asString),
});
async function flagForDeletion(user) {
    try {
        // if a user is requesting deletion, we should remove them from automatic emails
        const contact = await MailService.searchContact(user.email);
        if (contact)
            await MailService.deleteContact(contact.id);
    }
    catch (err) {
        logger_1.default.error(`Error searching for or deleting contact in user deletion process: ${err}`);
    }
    await (0, User_1.deleteUser)(user.id, `${user.email}deactivated`);
}
exports.flagForDeletion = flagForDeletion;
async function adminUpdateUser(data) {
    const { userId, firstName, lastName, email, partnerOrg, partnerSite, isVerified, isBanned, isDeactivated, isApproved, inGatesStudy, partnerSchool, } = asAdminUpdate(data);
    // replaced by UserRepo.getUserForAdminUpdate
    const userBeforeUpdate = await (0, User_1.getUserContactInfoById)(userId);
    if (!userBeforeUpdate) {
        throw new Errors_1.UserNotFoundError('id', userId);
    }
    const { isVolunteer } = userBeforeUpdate;
    const isUpdatedEmail = userBeforeUpdate.email !== email;
    // Remove the contact associated with the previous email from SendGrid
    if (isUpdatedEmail) {
        const contact = await MailService.searchContact(userBeforeUpdate.email);
        if (contact)
            MailService.deleteContact(contact.id);
    }
    // if unbanning student, also unban their IP addresses
    if (!isVolunteer && userBeforeUpdate.banned && !isBanned)
        await (0, IpAddress_1.updateIpStatusByUserId)(userBeforeUpdate.id, constants_1.IP_ADDRESS_STATUS.OK);
    if (!userBeforeUpdate.banned && isBanned)
        // TODO: queue email
        await MailService.sendBannedUserAlert(userId, 'admin');
    const update = {
        firstName,
        lastName,
        email,
        isVerified,
        isBanned,
        isDeactivated,
        isApproved,
        volunteerPartnerOrg: isVolunteer && partnerOrg ? partnerOrg : undefined,
        studentPartnerOrg: !isVolunteer && partnerOrg ? partnerOrg : undefined,
        partnerSite: !isVolunteer && partnerSite ? partnerSite : undefined,
        inGatesStudy: !isVolunteer && inGatesStudy ? inGatesStudy : undefined,
        banReason: isBanned ? 'admin' : undefined,
        partnerSchool: !isVolunteer && partnerSchool ? partnerSchool : undefined,
    };
    if (!isVolunteer) {
        // tracking organic/partner students for posthog if there is a change in partner status
        if (userBeforeUpdate.studentPartnerOrg !== partnerOrg) {
            AnalyticsService.identify(userId, {
                partner: partnerOrg,
            });
        }
    }
    if (isDeactivated && !userBeforeUpdate.deactivated)
        await (0, UserAction_1.createAccountAction)({
            userId,
            action: constants_1.ACCOUNT_USER_ACTIONS.DEACTIVATED,
        });
    if (isVolunteer) {
        await (0, Volunteer_1.updateVolunteerForAdmin)(userId, update);
    }
    else {
        await (0, Student_1.adminUpdateStudent)(userId, update);
    }
    await MailService.createContact(userId);
}
exports.adminUpdateUser = adminUpdateUser;
const asUserQuery = (0, type_utils_1.asFactory)({
    userId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    firstName: (0, type_utils_1.asOptional)(type_utils_1.asString),
    lastName: (0, type_utils_1.asOptional)(type_utils_1.asString),
    email: (0, type_utils_1.asOptional)(type_utils_1.asString),
    partnerOrg: (0, type_utils_1.asOptional)(type_utils_1.asString),
    highSchool: (0, type_utils_1.asOptional)(type_utils_1.asString),
    page: (0, type_utils_1.asOptional)(type_utils_1.asNumber),
});
// getUsersForAdmin with a typed interface for these query params
async function getUsers(data) {
    const { userId, firstName, lastName, email, partnerOrg, highSchool, page, } = asUserQuery(data);
    const pageNum = page || 1;
    const PER_PAGE = 15;
    const skip = (pageNum - 1) * PER_PAGE;
    try {
        const users = await (0, User_1.getUsersForAdminSearch)({
            userId,
            firstName,
            lastName,
            email,
            partnerOrg,
            highSchool,
        }, PER_PAGE, skip);
        const isLastPage = users.length < PER_PAGE;
        return { users, isLastPage };
    }
    catch (error) {
        throw new Error(error.message);
    }
}
exports.getUsers = getUsers;
async function updateUserProfile(userId, opts) {
    await (0, User_1.updateUserProfileById)(userId, opts);
}
exports.updateUserProfile = updateUserProfile;
async function deletePhoneFromAccount(userId) {
    const user = await (0, User_1.getUserContactInfoById)(userId);
    if (!user) {
        logger_1.default.error({ userId }, 'deletePhoneFromAccount failed to find user');
        throw new Error(Errors_1.DEFAULT_ERROR_MESSAGE);
    }
    if (user.isVolunteer) {
        throw new Errors_1.InputError('Phone information is required for UPchieve volunteers');
    }
    await (0, User_1.deleteUserPhoneInfo)(userId);
}
exports.deletePhoneFromAccount = deletePhoneFromAccount;
