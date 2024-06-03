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
exports.routeProductFlags = void 0;
const UserProductFlagsRepo = __importStar(require("../../models/UserProductFlags/queries"));
const UserProductFlagsService = __importStar(require("../../services/UserProductFlagsService"));
const extract_user_1 = require("../extract-user");
const res_error_1 = require("../res-error");
function routeProductFlags(router) {
    router.route('/product-flags').get(async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const flags = await UserProductFlagsRepo.getPublicUPFByUserId(user.id);
            res.json({ flags });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router
        .route('/product-flags/fall-incentive-enrollment/enroll')
        .post(async function (req, res) {
        const user = (0, extract_user_1.extractUser)(req);
        try {
            await UserProductFlagsService.incentiveProgramEnrollmentEnroll(user.id);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeProductFlags = routeProductFlags;
