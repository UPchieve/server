"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const res_error_1 = require("../res-error");
const express_1 = __importDefault(require("express"));
const Subjects_1 = require("../../models/Subjects");
function routes(app) {
    const router = express_1.default.Router();
    router.get('/subjects', async function (_, res) {
        try {
            const subjects = await (0, Subjects_1.getSubjectsWithTopic)();
            res.json({
                subjects,
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    app.use('/api-public', router);
}
exports.routes = routes;
