"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../../models/User");
const type_utils_1 = require("../../utils/type-utils");
const res_error_1 = require("../res-error");
function routes(app) {
    const router = express_1.default.Router();
    router.get('/:referralCode', async function (req, res) {
        try {
            const referralCode = (0, type_utils_1.asString)(req.params.referralCode);
            // TODO: is it ok to return no user if code isn't used?
            const user = await (0, User_1.getUserContactInfoByReferralCode)(referralCode);
            res.json({
                user: {
                    ...user,
                    firstname: user === null || user === void 0 ? void 0 : user.firstName,
                },
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    app.use('/api-public/referral', router);
}
exports.routes = routes;
