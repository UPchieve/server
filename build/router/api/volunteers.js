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
exports.routeVolunteers = void 0;
const moment_1 = __importDefault(require("moment"));
const config_1 = __importDefault(require("../../config"));
const VolunteersCtrl = __importStar(require("../../controllers/VolunteersCtrl"));
const VolunteerService = __importStar(require("../../services/VolunteerService"));
const auth_utils_1 = require("../../utils/auth-utils");
const cache = __importStar(require("../../cache"));
const type_utils_1 = require("../../utils/type-utils");
const res_error_1 = require("../res-error");
function routeVolunteers(router) {
    router.get('/volunteers/availability/:certifiedSubject', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const certifiedSubject = (0, type_utils_1.asString)(req.params.certifiedSubject);
            const aggAvailabilities = await VolunteersCtrl.getVolunteersAvailability(certifiedSubject);
            res.json({
                msg: 'Users retreived from database',
                aggAvailabilities: aggAvailabilities,
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/volunteers/review', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const { page } = req.query;
            const pageNum = page ? (0, type_utils_1.asNumber)(page) : 1;
            const { volunteers, isLastPage, } = await VolunteerService.getVolunteersToReview(pageNum);
            res.json({
                volunteers: volunteers.map(vol => ({
                    ...vol,
                    _id: vol.id,
                    firstname: vol.firstName,
                    lastname: vol.lastName,
                })),
                isLastPage,
            });
        }
        catch (error) {
            res
                .status(500)
                .json({ err: 'There was an error retrieving the pending volunteers.' });
        }
    });
    router.post('/volunteers/review/:id', auth_utils_1.authPassport.isAdmin, async function (req, res) {
        try {
            const volunteerId = (0, type_utils_1.asString)(req.params.id);
            const { photoIdStatus } = req.body;
            await VolunteerService.updatePendingVolunteerStatus(volunteerId, (0, type_utils_1.asString)(photoIdStatus).toLowerCase());
            res.sendStatus(200);
        }
        catch (error) {
            res.status(500).json({ err: error.message });
        }
    });
    router.get('/volunteers/hours-last-updated', async function (req, res) {
        try {
            const cacheValue = await cache.get(config_1.default.cacheKeys.updateTotalVolunteerHoursLastRun);
            const lastUpdated = (0, moment_1.default)(cacheValue).format('M/DD/YYYY');
            res.json({ lastUpdated });
        }
        catch (error) {
            if (error instanceof cache.KeyNotFoundError) {
                res.status(409);
            }
            else {
                res.status(500);
            }
            res.json({ err: error.message });
        }
    });
}
exports.routeVolunteers = routeVolunteers;
