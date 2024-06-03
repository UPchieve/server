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
exports.getReportedUser = exports.getUserVerificationInfoById = exports.deleteUserPhoneInfo = exports.updateUserProfileById = exports.updateUserPhoneNumberByUserId = exports.insertUserRoleByUserId = exports.getTotalSessionsByUserId = exports.getUserToCreateSendGridContact = exports.getUserForAdminDetail = exports.getPastSessionsForAdminDetail = exports.getUsersForAdminSearch = exports.banUserById = exports.updateUserLastActivityById = exports.updateUserVerifiedInfoById = exports.insertUserIpById = exports.updateUserPasswordById = exports.updateUserResetTokenById = exports.countUsersReferredByOtherId = exports.getUserContactInfoByResetToken = exports.getUserForPassport = exports.getUserReferralLink = exports.getUserContactInfoByReferralCode = exports.getUserContactInfoById = exports.deleteUser = exports.getUserIdByEmail = exports.getUserIdByPhone = exports.upsertUser = exports.createUser = void 0;
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
const queries_1 = require("../Volunteer/queries");
const queries_2 = require("../Subjects/queries");
async function createUser(user, tc) {
    var _a, _b, _c, _d;
    try {
        const id = (0, pgUtils_1.getDbUlid)();
        const result = await pgQueries.createUser.run({
            id,
            email: user.email.toLowerCase(),
            emailVerified: (_a = user.emailVerified) !== null && _a !== void 0 ? _a : false,
            firstName: user.firstName,
            lastName: user.lastName,
            otherSignupSource: user.otherSignupSource,
            password: user.password,
            passwordResetToken: user.passwordResetToken,
            phone: user.phone,
            phoneVerified: (_b = user.phoneVerified) !== null && _b !== void 0 ? _b : false,
            proxyEmail: (_c = user.proxyEmail) === null || _c === void 0 ? void 0 : _c.toLowerCase(),
            referralCode: (0, pgUtils_1.generateReferralCode)(id),
            referredBy: user.referredBy,
            signupSourceId: user.signupSourceId,
            verified: (_d = user.verified) !== null && _d !== void 0 ? _d : false,
        }, tc);
        if (!result.length)
            throw new Errors_1.RepoCreateError('createUser returned 0 rows.');
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['proxyEmail']);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createUser = createUser;
async function upsertUser(user, tc) {
    var _a, _b, _c, _d;
    try {
        const id = (0, pgUtils_1.getDbUlid)();
        const result = await pgQueries.upsertUser.run({
            id,
            email: user.email.toLowerCase(),
            emailVerified: (_a = user.emailVerified) !== null && _a !== void 0 ? _a : false,
            firstName: user.firstName,
            lastName: user.lastName,
            otherSignupSource: user.otherSignupSource,
            password: user.password,
            passwordResetToken: user.passwordResetToken,
            phone: user.phone,
            phoneVerified: (_b = user.phoneVerified) !== null && _b !== void 0 ? _b : false,
            proxyEmail: (_c = user.proxyEmail) === null || _c === void 0 ? void 0 : _c.toLowerCase(),
            referralCode: (0, pgUtils_1.generateReferralCode)(id),
            referredBy: user.referredBy,
            signupSourceId: user.signupSourceId,
            verified: (_d = user.verified) !== null && _d !== void 0 ? _d : false,
        }, tc);
        if (!result.length)
            throw new Errors_1.RepoUpsertError('upsertUser returned 0 rows.');
        return (0, pgUtils_1.makeSomeOptional)(result[0], ['proxyEmail']);
    }
    catch (err) {
        throw new Errors_1.RepoUpsertError(err);
    }
}
exports.upsertUser = upsertUser;
async function getUserIdByPhone(phone) {
    try {
        const result = await pgQueries.getUserIdByPhone.run({ phone }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).id;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserIdByPhone = getUserIdByPhone;
async function getUserIdByEmail(email) {
    try {
        const result = await pgQueries.getUserIdByEmail.run({ email: email.toLowerCase() }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).id;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserIdByEmail = getUserIdByEmail;
async function deleteUser(userId, email) {
    try {
        const result = await pgQueries.deleteUser.run({ userId: userId, email: email.toLowerCase() }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query did not delete student');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.deleteUser = deleteUser;
async function getUserContactInfoById(id) {
    try {
        const result = await pgQueries.getUserContactInfoById.run({ id }, (0, db_1.getClient)());
        if (result.length) {
            const ret = (0, pgUtils_1.makeSomeOptional)(result[0], [
                'volunteerPartnerOrg',
                'studentPartnerOrg',
                'approved',
                'lastActivityAt',
                'phone',
            ]);
            ret.email = ret.email.toLowerCase();
            return ret;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserContactInfoById = getUserContactInfoById;
// getUserByReferralCode
async function getUserContactInfoByReferralCode(referralCode) {
    try {
        const result = await pgQueries.getUserContactInfoByReferralCode.run({ referralCode }, (0, db_1.getClient)());
        if (result.length) {
            const ret = (0, pgUtils_1.makeSomeOptional)(result[0], [
                'volunteerPartnerOrg',
                'studentPartnerOrg',
                'approved',
                'lastActivityAt',
                'phone',
            ]);
            ret.email = ret.email.toLowerCase();
            return ret;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserContactInfoByReferralCode = getUserContactInfoByReferralCode;
async function getUserReferralLink(id) {
    try {
        const result = await pgQueries.getUserReferralLink.run({ id }, (0, db_1.getClient)());
        if (result.length) {
            return (0, pgUtils_1.makeRequired)(result[0]);
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserReferralLink = getUserReferralLink;
async function getUserForPassport(email) {
    try {
        const result = await pgQueries.getUserForPassport.run({ email: email.toLowerCase() }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['password', 'proxyEmail']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserForPassport = getUserForPassport;
// getUserByResetToken
async function getUserContactInfoByResetToken(resetToken) {
    try {
        const result = await pgQueries.getUserContactInfoByResetToken.run({ resetToken }, (0, db_1.getClient)());
        if (result.length) {
            const ret = (0, pgUtils_1.makeSomeOptional)(result[0], [
                'volunteerPartnerOrg',
                'studentPartnerOrg',
                'approved',
                'lastActivityAt',
                'phone',
            ]);
            ret.email = ret.email.toLowerCase();
            return ret;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserContactInfoByResetToken = getUserContactInfoByResetToken;
// getUsersReferredByOtherId
async function countUsersReferredByOtherId(userId) {
    try {
        const result = await pgQueries.countUsersReferredByOtherId.run({ userId }, (0, db_1.getClient)());
        if (result.length && result[0].total)
            return (0, pgUtils_1.makeRequired)(result[0]).total;
        return 0;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.countUsersReferredByOtherId = countUsersReferredByOtherId;
async function updateUserResetTokenById(userId, token) {
    try {
        const result = await pgQueries.updateUserResetTokenById.run({ token, userId }, (0, db_1.getClient)());
        if (result.length && result[0].id)
            return;
        throw new Errors_1.RepoUpdateError('Update query did not return updated id');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateUserResetTokenById = updateUserResetTokenById;
async function updateUserPasswordById(userId, password) {
    try {
        const result = await pgQueries.updateUserPasswordById.run({ userId, password }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateUserPasswordById = updateUserPasswordById;
// updateUserIpById
async function insertUserIpById(userId, ipId) {
    try {
        const result = await pgQueries.insertUserIpById.run({ id: (0, pgUtils_1.getDbUlid)(), userId, ipId }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Insert query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.insertUserIpById = insertUserIpById;
async function updateUserVerifiedInfoById(userId, sendTo, isPhoneVerification) {
    const update = isPhoneVerification
        ? pgQueries.updateUserVerifiedPhoneById.run({ userId, phone: sendTo }, (0, db_1.getClient)())
        : pgQueries.updateUserVerifiedEmailById.run({ userId, email: sendTo.toLowerCase() }, (0, db_1.getClient)());
    try {
        const result = await update;
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
        return {
            contact: result[0].ok,
        };
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateUserVerifiedInfoById = updateUserVerifiedInfoById;
async function updateUserLastActivityById(userId, lastActivityAt) {
    try {
        const result = await pgQueries.updateUserLastActivityById.run({ userId, lastActivityAt }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateUserLastActivityById = updateUserLastActivityById;
async function banUserById(userId, banReason) {
    try {
        const result = await pgQueries.updateUserBanById.run({ userId, banReason }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.banUserById = banUserById;
function cleanPayload(payload) {
    var _a;
    const temp = {};
    for (const [key, value] of Object.entries(payload)) {
        temp[key] = value === '' ? undefined : value;
    }
    if (payload.email) {
        temp.email = (_a = payload.email) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    }
    return temp;
}
async function getUsersForAdminSearch(payload, limit, offset) {
    try {
        const result = await pgQueries.getUsersForAdminSearch.run({ ...cleanPayload(payload), limit, offset }, (0, db_1.getClient)());
        return result.map(v => {
            const user = (0, pgUtils_1.makeSomeOptional)(v, ['lastName']);
            return {
                _id: user.id,
                ...user,
            };
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUsersForAdminSearch = getUsersForAdminSearch;
async function getPastSessionsForAdminDetail(userId, limit, offset, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getPastSessionsForAdminDetail.run({ userId, limit, offset }, client);
        return result.map(v => {
            const temp = (0, pgUtils_1.makeSomeOptional)(v, [
                'volunteer',
                'volunteerJoinedAt',
                'endedAt',
            ]);
            return {
                ...temp,
                _id: temp.id,
            };
        });
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPastSessionsForAdminDetail = getPastSessionsForAdminDetail;
// TODO: needs formal return type which is huge due to frontend
// TODO: this query is making a request for user data on every page transition
//        for new pastSessions to display. May be better served as a separate
//        service method for getting the user's past sessions
async function getUserForAdminDetail(userId, limit, offset) {
    var _a;
    const client = await (0, db_1.getClient)().connect();
    try {
        const userResult = await pgQueries.getUserForAdminDetail.run({ userId }, client);
        const user = (0, pgUtils_1.makeSomeRequired)(userResult[0], [
            'id',
            'createdAt',
            'email',
            'firstName',
            'isAdmin',
            'isDeactivated',
            'isTestUser',
            'isVolunteer',
            'verified',
            'numPastSessions',
        ]);
        if (user.email) {
            user.email = user.email.toLowerCase();
        }
        const references = await (0, queries_1.getReferencesByVolunteerForAdminDetail)(user.id, client);
        const sessions = await getPastSessionsForAdminDetail(user.id, limit, offset, client);
        const background = {
            occupation: user.occupation,
            experience: user.experience,
            languages: user.languages,
            linkedInUrl: user.linkedinUrl,
            country: user.country,
            state: user.state,
            city: user.city,
            college: user.college,
            company: user.company,
        };
        return {
            ...user,
            references: references.map(ref => ({
                ...ref,
                _id: ref.id,
                status: ref.status.toUpperCase(),
            })),
            pastSessions: sessions.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1),
            _id: user.id,
            photoIdStatus: (_a = user.photoIdStatus) === null || _a === void 0 ? void 0 : _a.toUpperCase(),
            background,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
    finally {
        client.release();
    }
}
exports.getUserForAdminDetail = getUserForAdminDetail;
async function getUserToCreateSendGridContact(userId) {
    try {
        const result = await pgQueries.getUserToCreateSendGridContact.run({ userId }, (0, db_1.getClient)());
        if (!result.length)
            throw new Errors_1.RepoReadError('User not found');
        return (0, pgUtils_1.makeSomeOptional)(result[0], [
            'studentPartnerOrg',
            'volunteerPartnerOrg',
            'studentPartnerOrgDisplay',
            'volunteerPartnerOrgDisplay',
            'passedUpchieve101',
            'lastActivityAt',
            'studentGradeLevel',
        ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserToCreateSendGridContact = getUserToCreateSendGridContact;
async function getTotalSessionsByUserId(userId) {
    try {
        const result = await pgQueries.getTotalSessionsByUserId.run({ userId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).total;
        return 0;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getTotalSessionsByUserId = getTotalSessionsByUserId;
async function insertUserRoleByUserId(userId, roleName, tc) {
    try {
        const result = await pgQueries.insertUserRoleByUserId.run({ userId, roleName }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Insert query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.insertUserRoleByUserId = insertUserRoleByUserId;
async function updateUserPhoneNumberByUserId(userId, phone, tc) {
    try {
        const result = await pgQueries.updateUserPhoneNumberByUserId.run({ userId, phone }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Insert query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateUserPhoneNumberByUserId = updateUserPhoneNumberByUserId;
async function updateUserProfileById(userId, data) {
    try {
        const result = await pgQueries.updateUserProfileById.run({
            userId,
            deactivated: data.deactivated,
            phone: data.phone,
            smsConsent: data.smsConsent,
        }, (0, db_1.getClient)());
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
        // Update muted subject alerts for volunteers
        if (data.mutedSubjectAlerts) {
            if (data.mutedSubjectAlerts.length == 0) {
                await pgQueries.deleteAllUserSubjectAlerts.run({ userId }, (0, db_1.getClient)());
            }
            else {
                let subjectNameIdMapping = await (0, queries_2.getSubjectNameIdMapping)();
                let mutedSubjectAlertIds = [];
                for (const subjectName of data.mutedSubjectAlerts) {
                    mutedSubjectAlertIds.push(subjectNameIdMapping[subjectName]);
                }
                let mutedSubjectAlertIdsWithUserId = [];
                mutedSubjectAlertIds.forEach(subjectId => mutedSubjectAlertIdsWithUserId.push({ userId, subjectId }));
                await pgQueries.insertMutedUserSubjectAlerts.run({ mutedSubjectAlertIdsWithUserId }, (0, db_1.getClient)());
                await pgQueries.deleteUnmutedUserSubjectAlerts.run({ userId, mutedSubjectAlertIds }, (0, db_1.getClient)());
            }
        }
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateUserProfileById = updateUserProfileById;
async function deleteUserPhoneInfo(userId) {
    try {
        const result = await pgQueries.deletePhone.run({
            userId,
        }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.deleteUserPhoneInfo = deleteUserPhoneInfo;
async function getUserVerificationInfoById(userId) {
    try {
        const result = await pgQueries.getUserVerificationInfoById.run({ userId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUserVerificationInfoById = getUserVerificationInfoById;
async function getReportedUser(userId) {
    try {
        const result = await pgQueries.getReportedUser.run({
            userId,
        }, (0, db_1.getClient)());
        if (result.length) {
            const ret = (0, pgUtils_1.makeSomeOptional)(result[0], [
                'studentPartnerOrg',
                'volunteerPartnerOrg',
            ]);
            ret.email = ret.email.toLowerCase();
            return ret;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getReportedUser = getReportedUser;
