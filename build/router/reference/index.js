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
exports.routes = void 0;
const express_1 = require("express");
const UserService = __importStar(require("../../services/UserService"));
const queries_1 = require("../../models/Volunteer/queries");
const type_utils_1 = require("../../utils/type-utils");
const res_error_1 = require("../res-error");
function routes(app) {
    const router = (0, express_1.Router)();
    router.post('/:referenceId/submit', async (req, res) => {
        try {
            const referenceId = (0, type_utils_1.asUlid)(req.params.referenceId);
            const { body: referenceFormData, ip } = req;
            const result = await (0, queries_1.getVolunteerByReference)(referenceId);
            if (!result)
                return res.sendStatus(404);
            const { volunteerId, referenceEmail } = result;
            await UserService.saveReferenceForm(volunteerId, referenceId, referenceEmail, referenceFormData, ip);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/:referenceId', async (req, res) => {
        try {
            const referenceId = (0, type_utils_1.asUlid)(req.params.referenceId);
            const result = await (0, queries_1.getVolunteerByReference)(referenceId);
            if (!result)
                return res.sendStatus(404);
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    app.use('/api-public/reference', router);
}
exports.routes = routes;
