"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeAdmin = void 0;
const multer_1 = __importDefault(require("multer"));
const auth_utils_1 = require("../../utils/auth-utils");
const SchoolService_1 = require("../../services/SchoolService");
const res_error_1 = require("../res-error");
const file_utils_1 = require("../../utils/file-utils");
const UserCreationService_1 = require("../../services/UserCreationService");
function routeAdmin(app, router) {
    const upload = (0, multer_1.default)();
    router.get('/schools/partner-schools', async function (_req, res) {
        try {
            const schools = await (0, SchoolService_1.getPartnerSchools)();
            res.send(schools);
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    router.post('/roster-students', upload.single('studentsFile'), async function (req, res) {
        try {
            if (!req.body.schoolId || !req.file) {
                res.status(500).json({
                    err: 'Missing required data.',
                });
                return;
            }
            const students = (0, file_utils_1.readCsvFromBuffer)(req.file.buffer, ['firstName', 'lastName', 'email', 'gradeLevel']);
            const { failed, updated } = await (0, UserCreationService_1.rosterPartnerStudents)(students, req.body.schoolId, req.body.partnerKey, req.body.partnerSite);
            res.json({ failed, updated });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
    app.use('/api/admin', auth_utils_1.authPassport.isAdmin, router);
}
exports.routeAdmin = routeAdmin;
