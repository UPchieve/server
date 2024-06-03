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
const express_1 = __importDefault(require("express"));
const Sentry = __importStar(require("@sentry/node"));
const auth_utils_1 = require("../../utils/auth-utils");
const SchoolService = __importStar(require("../../services/SchoolService"));
const queries_1 = require("../../models/ZipCode/queries");
const queries_2 = require("../../models/IneligibleStudent/queries");
const res_error_1 = require("../res-error");
const IpAddressService = __importStar(require("../../services/IpAddressService"));
const type_utils_1 = require("../../utils/type-utils");
const EligibilityService_1 = require("../../services/EligibilityService");
const StudentService_1 = require("../../services/StudentService");
function routes(app) {
    const router = express_1.default.Router();
    // Check if a student is eligible
    router.route('/check').post(async function (req, res) {
        try {
            const result = await (0, EligibilityService_1.checkEligibility)(req.ip, req.body);
            return res.json(result);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.route('/school/search').get(async (req, res) => {
        const { q } = req.query;
        try {
            const results = await SchoolService.search(q);
            res.json({
                results: results,
            });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/school/:schoolId', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const schoolId = (0, type_utils_1.asUlid)(req.params.schoolId);
            const school = await SchoolService.getSchool(schoolId);
            res.json({
                school: {
                    _id: school.id,
                    ...school,
                },
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.put('/school/:schoolId', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const schoolId = (0, type_utils_1.asUlid)(req.params.schoolId);
            await SchoolService.adminUpdateSchool({
                schoolId,
                ...req.body,
            });
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/schools', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const { schools, isLastPage } = await SchoolService.getSchools(req.query);
            res.json({ schools, isLastPage });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/school/approval', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const schoolId = (0, type_utils_1.asUlid)(req.body.schoolId);
            const isApproved = (0, type_utils_1.asBoolean)(req.body.isApproved);
            await SchoolService.updateApproval(schoolId, isApproved);
            res.sendStatus(200);
        }
        catch (err) {
            Sentry.captureException(err);
            res.sendStatus(500);
        }
    });
    router.post('/school/partner', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const schoolId = (0, type_utils_1.asUlid)(req.body.schoolId);
            const isPartner = (0, type_utils_1.asBoolean)(req.body.isPartner);
            await SchoolService.updateIsPartner(schoolId, isPartner);
            res.sendStatus(200);
        }
        catch (err) {
            Sentry.captureException(err);
            res.sendStatus(500);
        }
    });
    router.get('/ineligible-students', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const PER_PAGE = 15;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const skip = (page - 1) * PER_PAGE;
            const ineligibleStudents = await (0, queries_2.getIneligibleStudentsPaginated)(PER_PAGE, skip);
            const isLastPage = ineligibleStudents.length < PER_PAGE;
            res.json({ ineligibleStudents, isLastPage });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/zip-codes/:zipCode', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        const zipCode = (0, type_utils_1.asString)(req.params.zipCode);
        try {
            const result = await (0, queries_1.getZipCodeByZipCode)(zipCode);
            if (!result)
                res.sendStatus(404);
            else
                res.json({
                    zipCode: { ...result },
                });
        }
        catch (err) {
            Sentry.captureException(err);
            res.sendStatus(500);
        }
    });
    router.get('/ip-check', async function (req, res) {
        try {
            await IpAddressService.checkIpAddress(req.ip);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/check-zip-code/:zipCode', async function (req, res) {
        try {
            const zipCode = (0, type_utils_1.asString)(req.params.zipCode);
            const result = await (0, EligibilityService_1.checkZipCode)(zipCode);
            res.json({ isValidZipCode: result });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/signup-sources/students', async function (req, res) {
        try {
            const signupSources = await (0, StudentService_1.getStudentSignupSources)();
            res.json({ signupSources });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    app.use('/api-public/eligibility', router);
}
exports.routes = routes;
