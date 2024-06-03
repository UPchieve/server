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
exports.routeStudents = void 0;
const config_1 = __importDefault(require("../../config"));
const StudentRepo = __importStar(require("../../models/Student/queries"));
const type_utils_1 = require("../../utils/type-utils");
const extract_user_1 = require("../extract-user");
const res_error_1 = require("../res-error");
const StudentService = __importStar(require("../../services/StudentService"));
const Errors_1 = require("../../services/Errors");
const auth_utils_1 = require("../../utils/auth-utils");
function routeStudents(router) {
    router.get('/students/remaining-favorite-volunteers', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const totalFavoriteVolunteers = (await StudentRepo.getTotalFavoriteVolunteers(String(user.id)));
            res.json({
                remaining: config_1.default.favoriteVolunteerLimit - totalFavoriteVolunteers,
            });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/students/favorite-volunteers/:volunteerId', async function (req, res) {
        try {
            const volunteerId = (0, type_utils_1.asString)(req.params.volunteerId);
            const user = (0, extract_user_1.extractUser)(req);
            const isFavorite = await StudentRepo.isFavoriteVolunteer(String(user.id), volunteerId);
            res.json({
                isFavorite,
            });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/students/favorite-volunteers', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const page = (0, type_utils_1.asNumber)(req.query.page);
            const result = await StudentService.getFavoriteVolunteersPaginated(String(user.id), page);
            res.json(result);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.post('/students/favorite-volunteers/:volunteerId', async function (req, res) {
        try {
            const volunteerId = (0, type_utils_1.asUlid)(req.params.volunteerId);
            const user = (0, extract_user_1.extractUser)(req);
            const isFavorite = (0, type_utils_1.asBoolean)(req.body.isFavorite);
            const sessionId = req.body.sessionId
                ? (0, type_utils_1.asUlid)(req.body.sessionId)
                : undefined;
            const result = await StudentService.checkAndUpdateVolunteerFavoriting(isFavorite, user.id, volunteerId, sessionId, (0, type_utils_1.asString)(req.ip));
            res.json({ isFavorite: result.isFavorite });
        }
        catch (error) {
            if (error instanceof Errors_1.FavoriteLimitReachedError) {
                res.status(422).json({
                    success: false,
                    message: error.message,
                });
            }
            else
                (0, res_error_1.resError)(res, error);
        }
    });
    router.get('/students/partners/active', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const studentId = req.query.student;
            const activePartners = await StudentService.adminGetActivePartnersForStudent((0, type_utils_1.asString)(studentId));
            res.json({ activePartners: activePartners || [] });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/students/reminders/text', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const phone = req.body.phone;
            const reminderDate = req.body.reminderDate;
            await StudentService.queueProcrastinationTextReminder(user.id, (0, type_utils_1.asString)(phone), (0, type_utils_1.asString)(reminderDate));
            res.sendStatus(200);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeStudents = routeStudents;
