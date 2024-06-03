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
exports.routes = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const AuthService = __importStar(require("../../services/AuthService"));
const UserCreationService = __importStar(require("../../services/UserCreationService"));
const auth_utils_1 = require("../../utils/auth-utils");
const Errors_1 = require("../../models/Errors");
const res_error_1 = require("../res-error");
const queries_1 = require("../../models/User/queries");
const type_utils_1 = require("../../utils/type-utils");
const logger_1 = __importDefault(require("../../logger"));
const legacy_user_1 = require("../../models/User/legacy-user");
const extract_user_1 = require("../extract-user");
const config_1 = __importDefault(require("../../config"));
const constants_1 = require("../../constants");
const UserAction_1 = require("../../models/UserAction");
class GoogleAuthRedirect {
    static getBaseRedirect() {
        if (!this._baseRedirect) {
            let protocol;
            if (config_1.default.NODE_ENV === 'dev') {
                protocol = 'http';
            }
            else {
                protocol = 'https';
            }
            this._baseRedirect = `${protocol}://${config_1.default.client.host}`;
        }
        return this._baseRedirect;
    }
    static get successRedirect() {
        return this.getBaseRedirect();
    }
    static get loginFailureRedirect() {
        return `${this.getBaseRedirect()}/login?400=true`;
    }
    static registerFailureRedirect(studentData, errMsg) {
        const params = new URLSearchParams({
            error: errMsg !== null && errMsg !== void 0 ? errMsg : '',
        });
        if (studentData.email) {
            params.append('email', studentData.email);
        }
        if (studentData.highSchoolId) {
            params.append('highSchoolId', studentData.highSchoolId);
        }
        if (studentData.zipCode) {
            params.append('zipCode', studentData.zipCode);
        }
        if (studentData.currentGrade) {
            params.append('currentGrade', studentData.currentGrade);
        }
        if (studentData.studentPartnerOrg) {
            params.append('partner', studentData.studentPartnerOrg);
        }
        return `${this.getBaseRedirect()}/sign-up/student/account?${params.toString()}`;
    }
    static registerPartnerStudentFailureRedirect(studentData, errMsg) {
        const params = new URLSearchParams({
            sso: 'google',
            error: errMsg !== null && errMsg !== void 0 ? errMsg : '',
        });
        return `${this.getBaseRedirect()}/signup/student/${studentData.studentPartnerOrg}?${params.toString()}`;
    }
}
async function trackLoggedIn(userId, ipAddress) {
    await (0, UserAction_1.createAccountAction)({
        userId,
        action: constants_1.ACCOUNT_USER_ACTIONS.LOGGED_IN,
        ipAddress,
    });
}
function routes(app) {
    const router = (0, express_1.Router)();
    router.route('/logout').get(async function (req, res) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        req.session.destroy(() => {
            /* do nothing */
        });
        // We do not remove all sessions from the database when users log out
        // because we have lots of students who share multiple devices. They may
        // want to log out of a laptop they share with a sibling, but stay logged
        // in on their mobile device, for example.
        req.logout();
        if (userId) {
            await (0, UserAction_1.createAccountAction)({
                userId,
                action: constants_1.ACCOUNT_USER_ACTIONS.LOGGED_OUT,
                ipAddress: req.ip,
            });
        }
        res.json({
            msg: 'You have been logged out',
        });
    });
    router.route('/login').post(
    // Delegate auth logic to passport middleware
    passport_1.default.authenticate('local'), 
    // If successfully authed, return user object (otherwise 401 is returned from middleware)
    async function (req, res) {
        const legacyUser = await (0, legacy_user_1.getLegacyUserObject)((0, extract_user_1.extractUser)(req).id);
        await trackLoggedIn(legacyUser.id, req.ip);
        res.json({ user: legacyUser });
    });
    router.route('/login/google').get(passport_1.default.authenticate('google-login'));
    router.route('/oauth2/redirect/google/login').get(passport_1.default.authenticate('google-login', {
        successRedirect: GoogleAuthRedirect.successRedirect,
        failureRedirect: GoogleAuthRedirect.loginFailureRedirect,
    }));
    router.route('/register/google/student').get(function (req, res) {
        ;
        req.session.studentData = req.query;
        req.session.studentData.ip = req.ip;
        passport_1.default.authenticate('google-register-student')(req, res);
    });
    router
        .route('/oauth2/redirect/google/register/student')
        .get(function (req, res) {
        passport_1.default.authenticate('google-register-student', async function (_err, user, info) {
            const studentData = req.session.studentData;
            delete req.session.studentData;
            if (user) {
                res.redirect(GoogleAuthRedirect.successRedirect);
                await req.asyncLogin(user);
            }
            else {
                res.redirect(GoogleAuthRedirect.registerFailureRedirect(studentData, info));
            }
        })(req, res);
    });
    router.route('/register/google/partner-student').get(function (req, res) {
        ;
        req.session.studentData = req.query;
        passport_1.default.authenticate('google-register-partner-student')(req, res);
    });
    router
        .route('/oauth2/redirect/google/register/partner-student')
        .get(function (req, res) {
        passport_1.default.authenticate('google-register-partner-student', async function (_err, user, info) {
            const studentData = req.session.studentData;
            delete req.session.studentData;
            if (user) {
                res.redirect(GoogleAuthRedirect.successRedirect);
                await req.asyncLogin(user);
            }
            else {
                res.redirect(GoogleAuthRedirect.registerPartnerStudentFailureRedirect(studentData, info));
            }
        })(req, res);
    });
    router.route('/register/checkcred').post(async function (req, res) {
        try {
            const checked = await AuthService.checkCredential(req.body);
            return res.json({ checked });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/register/student').post(async function (req, res) {
        try {
            const data = (0, auth_utils_1.registerStudentValidator)({
                ...req.body,
                ip: req.ip,
            });
            const student = await UserCreationService.registerStudent(data);
            if (data.password) {
                await req.asyncLogin(student);
            }
            return res.json({ user: student });
        }
        catch (e) {
            (0, res_error_1.resError)(res, e);
        }
    });
    router.route('/register/student/open').post(async function (req, res) {
        try {
            const student = await AuthService.registerOpenStudent({
                ...req.body,
                ip: req.ip,
            });
            await req.asyncLogin(student);
            res.json({ user: student });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/register/student/partner').post(async function (req, res) {
        try {
            const student = await AuthService.registerPartnerStudent({
                ...req.body,
                ip: req.ip,
            });
            await req.asyncLogin(student);
            res.json({ user: student });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/register/volunteer/open').post(async function (req, res) {
        try {
            const volunteer = await AuthService.registerVolunteer({
                ...req.body,
                ip: req.ip,
            });
            await req.asyncLogin(volunteer);
            await trackLoggedIn(volunteer.id, req.ip);
            res.json({ user: volunteer });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/register/volunteer/partner').post(async function (req, res) {
        try {
            const volunteer = await AuthService.registerPartnerVolunteer({
                ...req.body,
                ip: req.ip,
            });
            await req.asyncLogin(volunteer);
            await trackLoggedIn(volunteer.id, req.ip);
            res.json({ user: volunteer });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/partner/volunteer').get(async function (req, res) {
        try {
            if (!req.query.hasOwnProperty('partnerId'))
                throw new Errors_1.InputError('Missing volunteerPartnerId query string');
            const partner = await AuthService.lookupPartnerVolunteer(req.query.partnerId);
            res.json({ volunteerPartner: partner });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/partner/student').get(async function (req, res) {
        try {
            if (!req.query.hasOwnProperty('partnerId'))
                throw new Errors_1.InputError('Missing studentPartnerId query string');
            const partner = await AuthService.lookupPartnerStudent(req.query.partnerId);
            res.json({
                studentPartner: {
                    ...partner,
                    isManuallyApproved: partner.key === config_1.default.customManualStudentPartnerOrg,
                },
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/partner/student/code').get(async function (req, res) {
        try {
            if (!req.query.hasOwnProperty('partnerSignupCode'))
                throw new Errors_1.InputError('Missing partnerSignupCode query string');
            const studentPartnerKey = await AuthService.lookupPartnerStudentCode(req.query.partnerSignupCode);
            res.json({ studentPartnerKey });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router
        .route('/partner/student-partners')
        .all(auth_utils_1.authPassport.isAdmin)
        .get(async function (req, res) {
        try {
            const partnerOrgs = await AuthService.lookupStudentPartners();
            res.json({ partnerOrgs });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router
        .route('/partner/volunteer-partners')
        .all(auth_utils_1.authPassport.isAdmin)
        .get(async function (req, res) {
        try {
            const partnerOrgs = await AuthService.lookupVolunteerPartners();
            res.json({ partnerOrgs });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router
        .route('/partner/sponsor-orgs')
        .all(auth_utils_1.authPassport.isAdmin)
        .get(async function (req, res) {
        try {
            const sponsorOrgs = await AuthService.lookupSponsorOrgs();
            res.json({ sponsorOrgs });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/reset/send').post(async function (req, res) {
        try {
            const reqEmail = (0, type_utils_1.asString)(req.body.email);
            const email = reqEmail.toLowerCase();
            try {
                await AuthService.sendReset(email);
            }
            catch (err) {
                // do not respond with info about no email match
                if (!(err instanceof Errors_1.LookupError))
                    return (0, res_error_1.resError)(res, err); // will handle sending response with status/error
                logger_1.default.info(err); // log expected lookup errors
            }
            let userId;
            if (!req.user) {
                // user not logged in
                userId = await (0, queries_1.getUserIdByEmail)(email);
            } // logged in
            else
                userId = req.user.id;
            req.session.destroy(() => {
                /* do nothing */
            });
            // if account with given email exists then try to destroy its sessions
            if (userId) {
                await AuthService.deleteAllUserSessions(userId);
                req.logout();
            }
            res.status(200).json({
                msg: 'If an account with this email address exists then we will send a password reset email',
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/reset/confirm', auth_utils_1.authPassport.checkRecaptcha, async function (req, res) {
        try {
            await AuthService.confirmReset(req.body);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    app.use('/auth', router);
}
exports.routes = routes;
