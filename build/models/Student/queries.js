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
exports.deleteDuplicateStudentVolunteerFavorites = exports.countDuplicateStudentVolunteerFavorites = exports.updateStudentsGradeLevel = exports.getStudentsForGradeLevelUpdate = exports.getActivePartnersForStudent = exports.deleteSelfFavoritedVolunteers = exports.getStudentSignupSources = exports.getUsageReport = exports.getSessionReport = exports.createStudent = exports.upsertStudentProfile = exports.createStudentProfile = exports.adminUpdateStudent = exports.getPartnerOrgByKey = exports.deleteStudent = exports.addFavoriteVolunteer = exports.deleteFavoriteVolunteer = exports.getFavoriteVolunteersPaginated = exports.getFavoriteVolunteersByStudentId = exports.isFavoriteVolunteer = exports.getTotalFavoriteVolunteers = exports.getGatesStudentById = exports.isTestUser = exports.getTestStudentExistsById = exports.getStudentContactInfoById = exports.getStudentPartnerInfoById = void 0;
const db_1 = require("../../db");
const type_utils_1 = require("../../utils/type-utils");
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
const SchoolRepo = __importStar(require("../School/queries"));
const constants_1 = require("../../constants");
const User_1 = require("../User");
async function getStudentPartnerInfoById(studentId) {
    try {
        const result = await pgQueries.getStudentPartnerInfoById.run({
            userId: studentId,
        }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeSomeOptional)(result[0], [
                'studentPartnerOrg',
                'approvedHighschool',
            ]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentPartnerInfoById = getStudentPartnerInfoById;
async function getStudentContactInfoById(studentId) {
    try {
        const result = await pgQueries.getStudentContactInfoById.run({
            userId: (0, type_utils_1.isPgId)(studentId) ? studentId : undefined,
            mongoUserId: (0, type_utils_1.isPgId)(studentId) ? undefined : studentId,
        }, (0, db_1.getClient)());
        if (result.length) {
            const ret = (0, pgUtils_1.makeSomeOptional)(result[0], ['schoolId', 'studentPartnerOrg']);
            ret.email = ret.email.toLowerCase();
            return ret;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentContactInfoById = getStudentContactInfoById;
// NOTE: duplicate of `isTestUser` query function in this file
// TODO: remove once there are no more callers of this function
async function getTestStudentExistsById(studentId) {
    try {
        const result = await pgQueries.isTestUser.run({
            userId: studentId,
        }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).testUser;
        return false;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getTestStudentExistsById = getTestStudentExistsById;
async function isTestUser(studentId) {
    try {
        const result = await pgQueries.isTestUser.run({
            userId: studentId,
        }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).testUser;
        return false;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.isTestUser = isTestUser;
async function getGatesStudentById(userId) {
    try {
        const result = await pgQueries.getGatesStudentById.run({ userId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeSomeOptional)(result[0], ['studentPartnerOrg']);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getGatesStudentById = getGatesStudentById;
async function getTotalFavoriteVolunteers(userId) {
    try {
        const result = await pgQueries.getTotalFavoriteVolunteers.run({ userId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).total;
        return 0;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getTotalFavoriteVolunteers = getTotalFavoriteVolunteers;
async function isFavoriteVolunteer(studentId, volunteerId) {
    try {
        const result = await pgQueries.isFavoriteVolunteer.run({ studentId, volunteerId }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0]).volunteerId)
            return true;
        return false;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.isFavoriteVolunteer = isFavoriteVolunteer;
async function getFavoriteVolunteersByStudentId(studentId) {
    try {
        const result = await pgQueries.getFavoriteVolunteersByStudentId.run({ studentId }, (0, db_1.getClient)());
        return result.map(row => (0, pgUtils_1.makeRequired)(row).id);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getFavoriteVolunteersByStudentId = getFavoriteVolunteersByStudentId;
async function getFavoriteVolunteersPaginated(studentId, limit, offset) {
    try {
        const result = await pgQueries.getFavoriteVolunteersPaginated.run({ studentId, limit, offset }, (0, db_1.getClient)());
        return {
            favoriteVolunteers: result.map(row => (0, pgUtils_1.makeRequired)(row)),
            isLastPage: result.length < limit,
        };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getFavoriteVolunteersPaginated = getFavoriteVolunteersPaginated;
async function deleteFavoriteVolunteer(studentId, volunteerId) {
    try {
        const result = await pgQueries.deleteFavoriteVolunteer.run({ studentId, volunteerId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
        throw new Errors_1.RepoDeleteError('Delete query did not return deleted favorited volunteer');
    }
    catch (err) {
        throw new Errors_1.RepoDeleteError(err);
    }
}
exports.deleteFavoriteVolunteer = deleteFavoriteVolunteer;
async function addFavoriteVolunteer(studentId, volunteerId) {
    try {
        const result = await pgQueries.addFavoriteVolunteer.run({ studentId, volunteerId }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]);
        throw new Errors_1.RepoUpdateError('Update query did not return added favorite volunteer');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.addFavoriteVolunteer = addFavoriteVolunteer;
async function deleteStudent(studentId, email) {
    try {
        const result = await pgQueries.deleteStudent.run({ userId: studentId, email: email.toLowerCase() }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError('Update query did not delete student');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.deleteStudent = deleteStudent;
async function getPartnerOrgByKey(partnerKey, partnerSite, client) {
    try {
        const result = await pgQueries.getPartnerOrgByKey.run({
            partnerOrgKey: partnerKey,
            partnerOrgSiteName: partnerSite,
        }, client);
        return result.length
            ? (0, pgUtils_1.makeSomeOptional)(result[0], ['siteId', 'siteName', 'schoolId'])
            : undefined;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getPartnerOrgByKey = getPartnerOrgByKey;
async function adminUpdateStudentPartnerOrgInstance(studentId, newPartnerOrgKey, newPartnerSite, schoolPartnerKey, client) {
    try {
        const newPartnerOrg = await getPartnerOrgByKey(newPartnerOrgKey, newPartnerSite, client);
        if (newPartnerOrgKey && !newPartnerOrg)
            throw new Error(`New partner org ${newPartnerOrgKey} does not exist`);
        const newSchoolOrg = await getPartnerOrgByKey(schoolPartnerKey, undefined, client);
        if (schoolPartnerKey && !newSchoolOrg)
            throw new Error(`New school org ${schoolPartnerKey} does not exist`);
        const activePartnerOrgInstanceResults = await pgQueries.getPartnerOrgsByStudent.run({ studentId }, client);
        const activePartnerOrgInstances = activePartnerOrgInstanceResults.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['schoolId', 'siteName']));
        // students may be involved with a partner org and go to a partner school
        if (activePartnerOrgInstances.length > 2)
            throw new Error(`Student ${studentId} has more than 2 partner orgs; cannot update`);
        let activePartnerInstance;
        let activeSchoolInstance;
        for (let org of activePartnerOrgInstances) {
            if (org.schoolId)
                activeSchoolInstance = org;
            else
                activePartnerInstance = org;
        }
        /**
         *
         * We attempt to deactive the active (partner org or partner school) instance in two cases:
         * 1. We're removing a partner org and there is an active instance
         * 2. We're changing the partner org OR site and there is an active instance
         *
         */
        if ((activePartnerInstance && !newPartnerOrg) ||
            (activePartnerInstance &&
                newPartnerOrg &&
                (activePartnerInstance.name !== newPartnerOrg.partnerName ||
                    activePartnerInstance.siteName !== newPartnerOrg.siteName))) {
            const updateResult = await pgQueries.adminDeactivateStudentPartnershipInstance.run({ userId: studentId, spoId: activePartnerInstance.id }, client);
            if (!(0, pgUtils_1.makeRequired)(updateResult[0]).ok)
                throw new Error(`Deactivating active partner org instance failed for student ${studentId}`);
        }
        if ((activeSchoolInstance && !newSchoolOrg) ||
            (activeSchoolInstance &&
                newSchoolOrg &&
                activeSchoolInstance.name !== newSchoolOrg.partnerName)) {
            const updateResult = await pgQueries.adminDeactivateStudentPartnershipInstance.run({ userId: studentId, spoId: activeSchoolInstance.id }, client);
            if (!(0, pgUtils_1.makeRequired)(updateResult[0]).ok)
                throw new Error(`Deactivating active partner org instance failed for student ${studentId}`);
        }
        /**
         *
         * TODO: Remove once the use of `student_partner_org_id` on the `student_profile` table
         *       is no longer needed. This is legacy and is currently here to achieve dual writes
         *
         */
        await pgQueries.adminUpdateStudentProfile.run({
            userId: studentId,
            partnerOrgId: newPartnerOrg ? newPartnerOrg.partnerId : undefined,
            partnerOrgSiteId: newPartnerOrg ? newPartnerOrg.siteId : undefined,
        }, client);
        /**
         *
         * We attempt to add a new active org (partner org or partner school) instance in two cases:
         * 1. We're adding a new partner org and there is no active instance
         * 2. We're changing the partner org OR site
         *
         */
        if ((!activePartnerInstance && newPartnerOrg) ||
            (newPartnerOrg &&
                activePartnerInstance &&
                (activePartnerInstance.name !== newPartnerOrg.partnerName ||
                    activePartnerInstance.siteName !== newPartnerOrg.siteName))) {
            const insertResult = await pgQueries.insertStudentPartnershipInstance.run({
                userId: studentId,
                partnerOrgId: newPartnerOrg.partnerId,
                partnerOrgSiteId: newPartnerOrg.siteId,
            }, client);
            if (!(0, pgUtils_1.makeRequired)(insertResult[0]).ok)
                throw new Error(`Inserting partner org ${newPartnerOrg.partnerId} instance failed for student ${studentId}`);
        }
        if ((!activeSchoolInstance && newSchoolOrg) ||
            (newSchoolOrg &&
                activeSchoolInstance &&
                activeSchoolInstance.name !== newSchoolOrg.partnerName)) {
            const insertResult = await pgQueries.insertStudentPartnershipInstance.run({
                userId: studentId,
                partnerOrgId: newSchoolOrg.partnerId,
                partnerOrgSiteId: undefined,
            }, client);
            if (!(0, pgUtils_1.makeRequired)(insertResult[0]).ok)
                throw new Error(`Inserting school partner org ${newSchoolOrg.partnerId} instance failed for student ${studentId}`);
            if (newSchoolOrg.schoolId) {
                const updateSchoolResult = await pgQueries.adminUpdateStudentSchool.run({ userId: studentId, schoolId: newSchoolOrg.schoolId }, client);
                if (!(0, pgUtils_1.makeRequired)(updateSchoolResult[0]).ok)
                    throw new Error(`Updating school ${newSchoolOrg.schoolId} failed for student profile ${studentId}`);
            }
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(`Could not update student partner org: ${err}`);
    }
}
async function adminUpdateStudent(studentId, update) {
    const transactionClient = await (0, db_1.getClient)().connect();
    try {
        await transactionClient.query('BEGIN');
        const updateStudentResult = await pgQueries.adminUpdateStudent.run({
            userId: studentId,
            firstName: update.firstName,
            lastName: update.lastName,
            email: update.email.toLowerCase(),
            verified: update.isVerified,
            banned: update.isBanned,
            deactivated: update.isDeactivated,
        }, transactionClient);
        const updateProductFlagsResult = await pgQueries.updateStudentInGatesStudy.run({ userId: studentId, inGatesStudy: update.inGatesStudy }, transactionClient);
        await adminUpdateStudentPartnerOrgInstance(studentId, update.studentPartnerOrg, update.partnerSite, update.partnerSchool, transactionClient);
        if (!(updateStudentResult.length &&
            updateProductFlagsResult.length &&
            (0, pgUtils_1.makeRequired)(updateStudentResult[0]).ok &&
            (0, pgUtils_1.makeRequired)(updateProductFlagsResult[0]).ok))
            throw new Errors_1.RepoUpdateError('Update query did not update the student');
        await transactionClient.query('COMMIT');
    }
    catch (err) {
        await transactionClient.query('ROLLBACK');
        if (err instanceof Errors_1.RepoUpdateError)
            throw err;
        throw new Errors_1.RepoTransactionError(err);
    }
    finally {
        transactionClient.release();
    }
}
exports.adminUpdateStudent = adminUpdateStudent;
async function createStudentProfile(studentData, tc) {
    try {
        const result = await pgQueries.createStudentProfile.run({
            userId: studentData.userId,
            college: studentData.college,
            schoolId: studentData.schoolId,
            postalCode: studentData.zipCode,
            gradeLevel: studentData.gradeLevel,
            partnerOrg: studentData.studentPartnerOrg,
            partnerSite: studentData.partnerSite,
        }, tc);
        if (!result.length)
            throw new Errors_1.RepoCreateError('createStudentProfile created 0 rows.');
        return (0, pgUtils_1.makeSomeRequired)(result[0], ['createdAt', 'updatedAt', 'userId']);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createStudentProfile = createStudentProfile;
async function upsertStudentProfile(studentData, tc) {
    try {
        const result = await pgQueries.upsertStudentProfile.run({
            userId: studentData.userId,
            college: studentData.college,
            schoolId: studentData.schoolId,
            postalCode: studentData.zipCode,
            gradeLevel: studentData.gradeLevel,
            partnerOrg: studentData.studentPartnerOrg,
            partnerSite: studentData.partnerSite,
        }, tc);
        if (!result.length)
            throw new Errors_1.RepoUpsertError('upsertStudentProfile returned 0 rows.');
        return (0, pgUtils_1.makeSomeRequired)(result[0], ['createdAt', 'updatedAt', 'userId']);
    }
    catch (err) {
        throw new Errors_1.RepoUpsertError(err);
    }
}
exports.upsertStudentProfile = upsertStudentProfile;
async function createStudent(studentData) {
    var _a, _b;
    const transactionClient = await (0, db_1.getClient)().connect();
    try {
        const userId = (0, pgUtils_1.getDbUlid)();
        await transactionClient.query('BEGIN');
        const userResult = await pgQueries.createStudentUser.run({
            userId,
            referralCode: (0, pgUtils_1.generateReferralCode)(userId),
            email: studentData.email.toLowerCase(),
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            password: studentData.password,
            referredBy: studentData.referredBy,
            signupSourceId: studentData.signupSourceId,
            otherSignupSource: studentData.otherSignupSource,
            verified: (_a = studentData.verified) !== null && _a !== void 0 ? _a : false,
            emailVerified: (_b = studentData.emailVerified) !== null && _b !== void 0 ? _b : false,
        }, transactionClient);
        const profileResult = await pgQueries.createStudentProfile.run({
            userId,
            college: studentData.college,
            partnerOrg: studentData.studentPartnerOrg,
            partnerSite: studentData.partnerSite,
            postalCode: studentData.zipCode,
            gradeLevel: studentData.currentGrade,
            schoolId: studentData.approvedHighschool,
        }, transactionClient);
        if (studentData.studentPartnerOrg) {
            const partnerOrg = await getPartnerOrgByKey(studentData.studentPartnerOrg, studentData.partnerSite, transactionClient);
            if (partnerOrg) {
                const spoInstanceResult = await pgQueries.createUserStudentPartnerOrgInstance.run({
                    userId,
                    spoName: partnerOrg.partnerName,
                    spoSiteName: studentData.partnerSite,
                }, transactionClient);
                if (!spoInstanceResult.length || !(0, pgUtils_1.makeRequired)(spoInstanceResult[0]).ok)
                    throw new Errors_1.RepoCreateError('Could not create student: user partner org instance creation did not return rows');
            }
        }
        if (studentData.approvedHighschool) {
            const school = await SchoolRepo.getSchoolById(studentData.approvedHighschool);
            if (school && school.isPartner) {
                const spoInstanceResult = await pgQueries.createUserStudentPartnerOrgInstanceWithSchoolId.run({
                    userId,
                    schoolId: school.id,
                }, transactionClient);
                if (!spoInstanceResult.length || !(0, pgUtils_1.makeRequired)(spoInstanceResult[0]).ok)
                    throw new Errors_1.RepoCreateError('Could not create student: user school partner instance creation did not return rows');
            }
        }
        if (userResult.length && profileResult.length) {
            const profile = (0, pgUtils_1.makeSomeOptional)(profileResult[0], [
                'studentPartnerOrg',
                'partnerSite',
                'college',
                'schoolId',
                'postalCode',
                'gradeLevel',
            ]);
            const user = (0, pgUtils_1.makeRequired)(userResult[0]);
            await transactionClient.query('COMMIT');
            await (0, User_1.insertUserRoleByUserId)(user.id, constants_1.USER_ROLES.STUDENT);
            return {
                id: user.id,
                firstname: user.firstName,
                firstName: user.firstName,
                lastname: user.lastName,
                email: user.email.toLowerCase(),
                isBanned: user.banned,
                isDeactivated: user.deactivated,
                isTestUser: user.testUser,
                isAdmin: false,
                isVolunteer: false,
                verified: user.verified,
                createdAt: user.createdAt,
                currentGrade: profile.gradeLevel,
                zipCode: profile.postalCode,
            };
        }
        throw new Errors_1.RepoCreateError('could not create student, profile or user came back with 0 rows');
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
}
exports.createStudent = createStudent;
// TODO: break out anything that uses RO client into their own repo
async function getSessionReport(query) {
    try {
        const result = await pgQueries.getSessionReport.run({
            highSchoolId: query.highSchoolId ? query.highSchoolId : undefined,
            studentPartnerOrg: query.studentPartnerOrg
                ? query.studentPartnerOrg
                : undefined,
            studentPartnerSite: query.studentPartnerSite
                ? query.studentPartnerSite
                : undefined,
            sponsorOrg: query.sponsorOrg ? query.sponsorOrg : undefined,
            start: query.start,
            end: query.end,
        }, (0, db_1.getAnalyticsClient)());
        if (result.length) {
            return result.map(r => (0, pgUtils_1.makeSomeOptional)(r, [
                'partnerSite',
                'waitTimeMins',
                'volunteerJoinedAt',
                'sessionRating',
                'sponsorOrg',
            ]));
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSessionReport = getSessionReport;
// TODO: break out anything that uses RO client into their own repo
async function getUsageReport(query) {
    try {
        const result = await pgQueries.getUsageReport.run({
            highSchoolId: query.highSchoolId ? query.highSchoolId : undefined,
            studentPartnerOrg: query.studentPartnerOrg
                ? query.studentPartnerOrg
                : undefined,
            studentPartnerSite: query.studentPartnerSite
                ? query.studentPartnerSite
                : undefined,
            sponsorOrg: query.sponsorOrg ? query.sponsorOrg : undefined,
            joinedStart: query.joinedStart,
            joinedEnd: query.joinedEnd,
            sessionStart: query.sessionStart,
            sessionEnd: query.sessionEnd,
        }, (0, db_1.getAnalyticsClient)());
        const report = [];
        if (result.length) {
            for (const row of result) {
                const session = (0, pgUtils_1.makeSomeOptional)(row, [
                    'partnerSite',
                    'studentPartnerOrg',
                    'school',
                    'sponsorOrg',
                ]);
                row.email = row.email.toLowerCase();
                report.push({
                    ...session,
                });
            }
            return report;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getUsageReport = getUsageReport;
async function getStudentSignupSources() {
    try {
        const result = await pgQueries.getStudentSignupSources.run(undefined, (0, db_1.getClient)());
        if (result.length) {
            // query returns sources in a random order, but we want to make sure Other is at the end
            const res = result.map(row => (0, pgUtils_1.makeRequired)(row));
            const otherIndex = res.findIndex(x => x.name === 'Other');
            const other = res.splice(otherIndex, 1)[0];
            res.push(other);
            return res;
        }
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentSignupSources = getStudentSignupSources;
async function deleteSelfFavoritedVolunteers() {
    try {
        await pgQueries.deleteSelfFavoritedVolunteers.run(undefined, (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoDeleteError(err);
    }
}
exports.deleteSelfFavoritedVolunteers = deleteSelfFavoritedVolunteers;
async function getActivePartnersForStudent(studentId, tc) {
    try {
        const result = await pgQueries.getPartnerOrgsByStudent.run({ studentId }, tc !== null && tc !== void 0 ? tc : (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeSomeOptional)(row, ['schoolId', 'siteName']));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getActivePartnersForStudent = getActivePartnersForStudent;
async function getStudentsForGradeLevelUpdate(fromDate, toDate) {
    try {
        const result = await pgQueries.getStudentsForGradeLevelUpdate.run({ fromDate, toDate }, (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeRequired)(row));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getStudentsForGradeLevelUpdate = getStudentsForGradeLevelUpdate;
async function updateStudentsGradeLevel(userId, gradeLevel) {
    try {
        const result = await pgQueries.updateStudentsGradeLevel.run({ userId, gradeLevel }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
        throw new Errors_1.RepoUpdateError(`Update query did not update grade level to ${gradeLevel} for ${userId}`);
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.updateStudentsGradeLevel = updateStudentsGradeLevel;
async function countDuplicateStudentVolunteerFavorites() {
    try {
        const result = await pgQueries.countDuplicateStudentVolunteerFavorites.run(undefined, (0, db_1.getClient)());
        if (result.length &&
            result[0].duplicates !== null &&
            (0, pgUtils_1.makeRequired)(result[0].duplicates)) {
            return result[0].duplicates;
        }
        throw new Errors_1.RepoReadError('Could not count duplicates in student_favorite_volunteer');
    }
    catch (error) {
        throw new Errors_1.RepoReadError(error);
    }
}
exports.countDuplicateStudentVolunteerFavorites = countDuplicateStudentVolunteerFavorites;
async function deleteDuplicateStudentVolunteerFavorites(tc) {
    try {
        const result = await pgQueries.deleteDuplicateStudentVolunteerFavorites.run(undefined, tc);
        if (result.length &&
            result[0].deleted !== null &&
            (0, pgUtils_1.makeRequired)(result[0])) {
            return result[0].deleted;
        }
        throw new Errors_1.RepoUpdateError('Could not delete duplicates in student_favorite_volunteers');
    }
    catch (error) {
        throw new Errors_1.RepoUpdateError(error);
    }
}
exports.deleteDuplicateStudentVolunteerFavorites = deleteDuplicateStudentVolunteerFavorites;
