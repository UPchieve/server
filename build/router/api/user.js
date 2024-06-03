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
exports.routeUser = void 0;
const UserService = __importStar(require("../../services/UserService"));
const MailService = __importStar(require("../../services/MailService"));
const AwsService = __importStar(require("../../services/AwsService"));
const VolunteerService = __importStar(require("../../services/VolunteerService"));
const User_1 = require("../../models/User/");
const auth_utils_1 = require("../../utils/auth-utils");
const res_error_1 = require("../res-error");
const type_utils_1 = require("../../utils/type-utils");
const extract_user_1 = require("../extract-user");
const UserAction_1 = require("../../models/UserAction");
const constants_1 = require("../../constants");
const Errors_1 = require("../../models/Errors");
function routeUser(router) {
    router.route('/user').get(async function (req, res) {
        const user = (0, extract_user_1.extractUser)(req);
        const parsedUser = await UserService.parseUser(user);
        return res.json({ user: parsedUser });
    });
    // Note: Both students and volunteers can edit parts of their profile,
    // but only volunteers can deactivate their accounts.
    router.put('/user', async (req, res) => {
        try {
            const { ip } = req;
            const user = (0, extract_user_1.extractUser)(req);
            const isDeactivated = (0, type_utils_1.asBoolean)(req.body.isDeactivated);
            // Form request object
            let updateReq = {
                deactivated: isDeactivated,
            };
            // optional fields
            if ('smsConsent' in req.body) {
                updateReq['smsConsent'] = (0, type_utils_1.asBoolean)(req.body.smsConsent);
            }
            if ('mutedSubjectAlerts' in req.body) {
                updateReq['mutedSubjectAlerts'] = req.body
                    .mutedSubjectAlerts;
            }
            if ('phone' in req.body) {
                const phone = (0, type_utils_1.asString)(req.body.phone);
                if (phone.length === 0) {
                    throw new Errors_1.InputError('Phone number must be provided');
                }
                updateReq['phone'] = phone;
            }
            await UserService.updateUserProfile(user.id, updateReq);
            if (isDeactivated !== user.deactivated) {
                await MailService.createContact(user.id);
                if (isDeactivated)
                    await (0, UserAction_1.createAccountAction)({
                        action: constants_1.ACCOUNT_USER_ACTIONS.DEACTIVATED,
                        userId: user.id,
                        ipAddress: ip,
                    });
            }
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.delete('/user/phone', async (req, res) => {
        const user = (0, extract_user_1.extractUser)(req);
        try {
            await UserService.deletePhoneFromAccount(user.id);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.delete('/user', async (req, res) => {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            await UserService.flagForDeletion(user);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    // Admin route to update a user
    router.put('/user/:userId', auth_utils_1.authPassport.isAdmin, async (req, res) => {
        const { userId } = req.params;
        try {
            await UserService.adminUpdateUser({ userId, ...req.body });
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/user/volunteer-approval/reference', async (req, res) => {
        try {
            const { ip } = req;
            const user = (0, extract_user_1.extractUser)(req);
            await UserService.addReference({
                userId: user.id,
                userEmail: user.email,
                ip,
                ...req.body,
            });
            res.sendStatus(200);
        }
        catch (err) {
            if (err instanceof Errors_1.NotAllowedError) {
                res.json({
                    success: false,
                    message: err.message,
                });
            }
            else
                (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/user/volunteer-approval/reference/delete', async (req, res) => {
        try {
            const { ip } = req;
            const user = (0, extract_user_1.extractUser)(req);
            await UserService.deleteReference(user.id, (0, type_utils_1.asString)(req.body.referenceEmail), ip);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/user/volunteer-approval/photo-url', async (req, res) => {
        try {
            const { ip } = req;
            const user = (0, extract_user_1.extractUser)(req);
            const photoIdS3Key = await UserService.addPhotoId(user.id, ip);
            const uploadUrl = await AwsService.getPhotoIdUploadUrl(photoIdS3Key);
            if (uploadUrl) {
                res.json({
                    success: true,
                    message: 'AWS SDK S3 pre-signed URL generated successfully',
                    uploadUrl,
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Pre-signed URL error',
                });
            }
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/user/volunteer-approval/background-information', async (req, res) => {
        const { ip } = req;
        const user = (0, extract_user_1.extractUser)(req);
        // TODO: duck type validation
        const { occupation, experience, company, college, linkedInUrl, languages, country, state, city, } = req.body;
        const update = {
            occupation,
            experience,
            company,
            college,
            linkedInUrl,
            languages,
            country,
            state,
            city,
        };
        try {
            await VolunteerService.addBackgroundInfo(user.id, update, ip);
            res.sendStatus(200);
        }
        catch (error) {
            res.sendStatus(500);
        }
    });
    router.get('/user/referred-friends', async (req, res) => {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const referredFriends = await (0, User_1.countUsersReferredByOtherId)(user.id);
            // the frontend is expecting to look at the length of an array, not a #
            const referredFriendsArr = Array(referredFriends);
            res.json({ referredFriendsArr });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/user/email/:userEmail', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        const { userEmail } = req.params;
        try {
            const userId = await (0, User_1.getUserIdByEmail)(userEmail);
            res.json({ userId: userId });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/user/:userId', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        const { userId } = req.params;
        const page = Number(req.query.page || '1');
        const PAGE_SIZE = 10;
        const skip = PAGE_SIZE * (page - 1);
        try {
            const user = await (0, User_1.getUserForAdminDetail)((0, type_utils_1.asUlid)(userId), PAGE_SIZE, skip);
            let resUser = user;
            if (user.isVolunteer && user.photoIdS3Key) {
                const photoUrl = await AwsService.getPhotoIdUrl(user.photoIdS3Key);
                resUser = Object.assign(resUser, { photoUrl });
            }
            res.json({ user });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/users', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const payload = {
                ...req.query,
                page: req.query.page ? req.query.page : 1,
            };
            const { users, isLastPage } = await UserService.getUsers(payload);
            res.json({ users, isLastPage });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeUser = routeUser;
