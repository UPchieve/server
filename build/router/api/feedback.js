"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeFeedback = void 0;
const queries_1 = require("../../models/Feedback/queries");
const Errors_1 = require("../../models/Errors");
const type_utils_1 = require("../../utils/type-utils");
const res_error_1 = require("../res-error");
function routeFeedback(router) {
    router.get('/feedback', async (req, res) => {
        if (!req.query.hasOwnProperty('sessionId') ||
            !req.query.hasOwnProperty('userType'))
            throw new Errors_1.InputError('Missing query parameters');
        const { sessionId, userType } = req.query;
        try {
            const feedback = await (0, queries_1.getFeedbackBySessionIdUserType)((0, type_utils_1.asUlid)(sessionId), (0, type_utils_1.asString)(userType));
            res.json({
                feedback: feedback ? feedback.id : null,
            });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
}
exports.routeFeedback = routeFeedback;
