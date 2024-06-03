"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPassport = exports.getApiKeyFromHeader = exports.verifyPassword = exports.hashPassword = exports.getReferredBy = exports.checkEmail = exports.checkNames = exports.checkPhone = exports.createResetToken = exports.checkPassword = exports.asResetConfirmData = exports.asPartnerVolunteerRegData = exports.asVolunteerRegData = exports.asPartnerStudentRegData = exports.asOpenStudentRegData = exports.registerStudentValidator = exports.asCredentialData = exports.ResetError = exports.RegistrationError = void 0;
const crypto_1 = require("crypto");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ts_custom_error_1 = require("ts-custom-error");
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const GoogleStrategy = require('passport-google-oidc');
const config_1 = __importDefault(require("../config"));
const queries_1 = require("../models/User/queries");
const UserCtrl_1 = require("../controllers/UserCtrl");
const AnalyticsService_1 = require("../services/AnalyticsService");
const constants_1 = require("../constants");
const Errors_1 = require("../models/Errors");
const is_valid_international_phone_number_1 = __importDefault(require("./is-valid-international-phone-number"));
const type_utils_1 = require("./type-utils");
const validator_1 = __importDefault(require("validator"));
const queries_2 = require("../models/FederatedCredential/queries");
const UserCreationService_1 = require("../services/UserCreationService");
const RecaptchaService_1 = require("../services/RecaptchaService");
// Custom errors
class RegistrationError extends ts_custom_error_1.CustomError {
}
exports.RegistrationError = RegistrationError;
class ResetError extends ts_custom_error_1.CustomError {
}
exports.ResetError = ResetError;
exports.asCredentialData = (0, type_utils_1.asFactory)({
    email: type_utils_1.asString,
    password: type_utils_1.asString,
});
exports.registerStudentValidator = (0, type_utils_1.asFactory)({
    college: (0, type_utils_1.asOptional)(type_utils_1.asString),
    email: type_utils_1.asString,
    firstName: type_utils_1.asString,
    gradeLevel: (0, type_utils_1.asOptional)((0, type_utils_1.asEnum)(constants_1.GRADES)),
    ip: (0, type_utils_1.asOptional)(type_utils_1.asString),
    issuer: (0, type_utils_1.asOptional)(type_utils_1.asString),
    lastName: type_utils_1.asString,
    password: (0, type_utils_1.asOptional)(type_utils_1.asString),
    parentGuardianEmail: (0, type_utils_1.asOptional)(type_utils_1.asString),
    profileId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    referredByCode: (0, type_utils_1.asOptional)(type_utils_1.asString),
    schoolId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    studentPartnerOrg: (0, type_utils_1.asOptional)(type_utils_1.asString),
    studentPartnerSite: (0, type_utils_1.asOptional)(type_utils_1.asString),
    zipCode: (0, type_utils_1.asOptional)(type_utils_1.asString),
});
const userRegDataValidators = {
    ip: type_utils_1.asString,
    email: type_utils_1.asString,
    password: type_utils_1.asString,
    terms: type_utils_1.asBoolean,
    referredByCode: (0, type_utils_1.asOptional)(type_utils_1.asString),
    firstName: type_utils_1.asString,
    lastName: type_utils_1.asString,
    signupSourceId: (0, type_utils_1.asOptional)(type_utils_1.asNumber),
    otherSignupSource: (0, type_utils_1.asOptional)(type_utils_1.asString),
};
exports.asOpenStudentRegData = (0, type_utils_1.asFactory)({
    ...userRegDataValidators,
    highSchoolId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    zipCode: (0, type_utils_1.asOptional)(type_utils_1.asString),
    currentGrade: (0, type_utils_1.asEnum)(constants_1.GRADES),
});
exports.asPartnerStudentRegData = (0, type_utils_1.asFactory)({
    ...userRegDataValidators,
    highSchoolId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    zipCode: (0, type_utils_1.asOptional)(type_utils_1.asString),
    studentPartnerOrg: type_utils_1.asString,
    partnerUserId: (0, type_utils_1.asOptional)(type_utils_1.asString),
    partnerSite: (0, type_utils_1.asOptional)(type_utils_1.asString),
    college: (0, type_utils_1.asOptional)(type_utils_1.asString),
    currentGrade: (0, type_utils_1.asOptional)((0, type_utils_1.asEnum)(constants_1.GRADES)),
});
exports.asVolunteerRegData = (0, type_utils_1.asFactory)({
    ...userRegDataValidators,
    phone: type_utils_1.asString,
    timezone: (0, type_utils_1.asOptional)(type_utils_1.asString),
});
exports.asPartnerVolunteerRegData = (0, type_utils_1.asFactory)({
    ...userRegDataValidators,
    phone: type_utils_1.asString,
    volunteerPartnerOrg: type_utils_1.asString,
    timezone: (0, type_utils_1.asOptional)(type_utils_1.asString),
});
exports.asResetConfirmData = (0, type_utils_1.asFactory)({
    email: type_utils_1.asString,
    password: type_utils_1.asString,
    newpassword: type_utils_1.asString,
    token: type_utils_1.asString,
});
// Validation functions
function checkPassword(password) {
    if (password.length < 8) {
        throw new RegistrationError('Password must be 8 characters or longer');
    }
    const numberRegex = /[0-9]/;
    if (!password.match(numberRegex))
        throw new RegistrationError('Password must contain at least one number');
    const uppercaseRegex = /[A-Z]/;
    if (!password.match(uppercaseRegex))
        throw new RegistrationError('Password must contain at least one uppercase letter');
    const lowercaseRegex = /[a-z]/;
    if (!password.match(lowercaseRegex))
        throw new RegistrationError('Password must contain at least one lowercase letter');
    return true;
}
exports.checkPassword = checkPassword;
function createResetToken() {
    const buffer = (0, crypto_1.randomBytes)(16);
    return buffer.toString('hex');
}
exports.createResetToken = createResetToken;
async function checkPhone(phone) {
    if (!(0, is_valid_international_phone_number_1.default)(phone))
        throw new RegistrationError('Must supply a valid phone number');
    const existingUser = await (0, queries_1.getUserIdByPhone)(phone);
    if (existingUser)
        throw new Errors_1.LookupError('The phone number you entered is already in use');
    return true;
}
exports.checkPhone = checkPhone;
function checkNames(first, last) {
    // https://stackoverflow.com/questions/10570286/check-if-string-contains-url-anywhere-in-string-using-javascript
    const internalUrlRegExp = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');
    if (internalUrlRegExp.test(first) || internalUrlRegExp.test(last))
        throw new Errors_1.InputError('Names can only contain letters, spaces and hyphens');
}
exports.checkNames = checkNames;
function checkEmail(email) {
    if (!validator_1.default.isEmail(email))
        throw new Errors_1.InputError('Email is not a valid email format');
}
exports.checkEmail = checkEmail;
async function getReferredBy(referredByCode) {
    if (!referredByCode)
        return;
    const referredBy = await (0, UserCtrl_1.checkReferral)(referredByCode);
    if (referredBy) {
        (0, AnalyticsService_1.captureEvent)(referredBy, constants_1.EVENTS.FRIEND_REFERRED, {
            event: constants_1.EVENTS.FRIEND_REFERRED,
        });
        return referredBy;
    }
}
exports.getReferredBy = getReferredBy;
const hashPassword = async function (password) {
    const salt = await bcrypt_1.default.genSalt(config_1.default.saltRounds);
    const hash = await bcrypt_1.default.hash(password, salt);
    return hash;
};
exports.hashPassword = hashPassword;
function verifyPassword(candidatePassword, userPassword) {
    // TODO: is there an async bcrypt compare?
    return new Promise((resolve, reject) => {
        bcrypt_1.default.compare(candidatePassword, userPassword, (error, isMatch) => {
            if (error) {
                return reject(error);
            }
            return resolve(isMatch);
        });
    });
}
exports.verifyPassword = verifyPassword;
function getApiKeyFromHeader(req) {
    var _a;
    const apiKey = (_a = req.headers['x-api-key']) !== null && _a !== void 0 ? _a : null;
    return apiKey;
}
exports.getApiKeyFromHeader = getApiKeyFromHeader;
// Passport functions
function setupPassport() {
    passport_1.default.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async function (id, done) {
        try {
            const user = await (0, queries_1.getUserContactInfoById)(id);
            if (!user)
                throw new Error('User not found for authenticated session');
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    });
    passport_1.default.use(new passport_local_1.Strategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async function (email, passwordGiven, done) {
        try {
            const user = await (0, queries_1.getUserForPassport)(email);
            if (!user) {
                return done(null, false);
            }
            if (!user.password) {
                return done(null, false);
            }
            const isValidPassword = await verifyPassword(passwordGiven, user.password);
            user.password = '';
            if (isValidPassword) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.use('google-login', new GoogleStrategy({
        clientID: config_1.default.googleClientId,
        clientSecret: config_1.default.googleClientSecret,
        callbackURL: '/auth/oauth2/redirect/google/login',
        scope: ['email'],
        prompt: 'select_account',
    }, async function (issuer, profile, done) {
        try {
            const existingFedCred = await (0, queries_2.getFederatedCredential)(profile.id, issuer);
            if (!existingFedCred) {
                return done(null, false);
            }
            return done(null, { id: existingFedCred.userId });
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.use('google-register-student', new GoogleStrategy({
        clientID: config_1.default.googleClientId,
        clientSecret: config_1.default.googleClientSecret,
        callbackURL: '/auth/oauth2/redirect/google/register/student',
        passReqToCallback: true,
        scope: ['profile', 'email'],
        prompt: 'select_account',
    }, async function (req, issuer, profile, done) {
        var _a, _b, _c, _d;
        try {
            const existingFedCred = await (0, queries_2.getFederatedCredential)(profile.id, issuer);
            if (existingFedCred) {
                return done(null, false, 'Google account already associated with an account.');
            }
            const firstName = (_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName;
            const lastName = (_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName;
            const email = (_d = (_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value;
            if (!firstName || !lastName || !email) {
                return done(null, false);
            }
            const existingUser = await (0, queries_1.getUserIdByEmail)(email);
            if (existingUser) {
                return done(null, false, 'Account with Google email already exists.');
            }
            const session = req.session;
            if (!session.studentData) {
                return done(null, false);
            }
            const data = {
                email,
                emailVerified: true,
                firstName,
                gradeLevel: session.studentData.currentGrade,
                ip: session.studentData.ip,
                issuer,
                lastName,
                profileId: profile.id,
                schoolId: session.studentData.highSchoolId,
                studentPartnerOrg: session.studentData.studentPartnerOrg,
                referredByCode: session.studentData.referredByCode,
                verified: true,
                zipCode: session.studentData.zipCode,
            };
            const student = await (0, UserCreationService_1.registerStudent)(data);
            return done(null, student);
        }
        catch (err) {
            return done(err);
        }
    }));
    passport_1.default.use('google-register-partner-student', new GoogleStrategy({
        clientID: config_1.default.googleClientId,
        clientSecret: config_1.default.googleClientSecret,
        callbackURL: '/auth/oauth2/redirect/google/register/partner-student',
        passReqToCallback: true,
        scope: ['profile', 'email'],
        prompt: 'select_account',
    }, async function (req, issuer, profile, done) {
        var _a, _b, _c, _d;
        try {
            const existingFedCred = await (0, queries_2.getFederatedCredential)(profile.id, issuer);
            if (existingFedCred) {
                return done(null, false, 'Google account already associated with an account.');
            }
            const firstName = (_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName;
            const lastName = (_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName;
            const email = (_d = (_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value;
            if (!firstName || !lastName || !email) {
                return done(null, false);
            }
            const existingUser = await (0, queries_1.getUserIdByEmail)(email);
            if (existingUser) {
                return done(null, false, 'Account with Google email already exists.');
            }
            const session = req.session;
            if (!session.studentData) {
                return done(null, false);
            }
            const student = await (0, UserCreationService_1.createPartnerStudent)({
                email,
                firstName,
                lastName,
                gradeLevel: session.studentData.currentGrade,
                studentPartnerOrg: session.studentData.studentPartnerOrg,
                profileId: profile.id,
                issuer,
            });
            return done(null, student);
        }
        catch (err) {
            return done(err);
        }
    }));
}
// Login Required middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ err: 'Not authenticated' });
}
function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    return res.status(403).json({ err: 'Unauthorized' });
}
function isWorker(req, res, next) {
    const token = getApiKeyFromHeader(req);
    if (token && token === config_1.default.subwayApiCredentials) {
        return next();
    }
    return res.status(401).json({ err: 'Not authenticated' });
}
function bypassMiddlewareForWebhooks(fn) {
    return function (req, res, next) {
        if (req.path.includes('/webhooks/') && req.method === 'POST') {
            next();
        }
        else {
            fn(req, res, next);
        }
    };
}
function isAuthenticatedRedirect(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/');
}
function isAdminRedirect(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    return res.redirect('/');
}
async function checkRecaptcha(req, res, next) {
    try {
        await (0, RecaptchaService_1.validateRequestRecaptcha)(req);
        return next();
    }
    catch (err) {
        if (err instanceof Errors_1.MissingRecaptchaTokenError ||
            err instanceof Errors_1.LowRecaptchaScoreError) {
            res.status(500).json({
                err: err.message,
            });
        }
        else {
            res.status(500).json({
                err: 'Something went wrong. Please contact the UPchieve team at support@upchieve.org for help.',
            });
        }
    }
}
exports.authPassport = {
    setupPassport,
    isAuthenticated,
    isAdmin,
    isWorker,
    isAuthenticatedRedirect,
    isAdminRedirect,
    checkRecaptcha,
    bypassMiddlewareForWebhooks,
};
