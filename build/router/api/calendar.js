"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeCalendar = void 0;
const CalendarCtrl_1 = require("../../controllers/CalendarCtrl");
const res_error_1 = require("../res-error");
const Errors_1 = require("../../models/Errors");
const type_utils_1 = require("../../utils/type-utils");
const extract_user_1 = require("../extract-user");
function routeCalendar(router) {
    router.post('/calendar/save', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            if (!req.body.hasOwnProperty('availability'))
                throw new Errors_1.InputError('No availability object specified');
            await (0, CalendarCtrl_1.updateSchedule)({
                ...req.body,
                user: user,
                ip: req.ip,
            });
            res.json({
                msg: 'Schedule saved',
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/calendar/clear', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            await (0, CalendarCtrl_1.clearSchedule)(user, (0, type_utils_1.asString)(req.body.tz));
            res.json({
                msg: 'Schedule cleared',
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeCalendar = routeCalendar;
