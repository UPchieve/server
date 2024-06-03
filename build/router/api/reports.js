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
exports.routeReports = void 0;
const res_error_1 = require("../res-error");
const auth_utils_1 = require("../../utils/auth-utils");
const ReportService = __importStar(require("../../services/ReportService"));
function routeReports(router) {
    router.get('/reports/session-report', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const sessions = await ReportService.sessionReport(req.query);
            res.json({ sessions });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/reports/usage-report', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const students = await ReportService.usageReport(req.query);
            res.json({ students });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/reports/volunteer-telecom-report', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const data = await ReportService.getTelecomReport(req.query);
            res.json({ data });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/reports/partner-analytics-report', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const reportFilePath = await ReportService.getAnalyticsReport(req.query);
            res.status(201).download(reportFilePath);
            await ReportService.deleteReport(reportFilePath);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
}
exports.routeReports = routeReports;
