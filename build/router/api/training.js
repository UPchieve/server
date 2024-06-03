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
exports.routeTraining = void 0;
const TrainingCtrl = __importStar(require("../../controllers/TrainingCtrl"));
const TrainingCourseService = __importStar(require("../../services/TrainingCourseService"));
const VolunteerService = __importStar(require("../../services/VolunteerService"));
const type_utils_1 = require("../../utils/type-utils");
const res_error_1 = require("../res-error");
const extract_user_1 = require("../extract-user");
const queries_1 = require("../../models/UserAction/queries");
const constants_1 = require("../../constants");
const queries_2 = require("../../models/Question/queries");
function routeTraining(router) {
    router.post('/training/questions', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const questions = await TrainingCtrl.getQuestions((0, type_utils_1.asString)(req.body.category), user.id);
            res.json({
                msg: 'Questions retrieved from database',
                questions,
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/training/score', async function (req, res) {
        try {
            const { ip } = req;
            const user = (0, extract_user_1.extractUser)(req);
            const category = (0, type_utils_1.asString)(req.body.category);
            const idAnswerMap = req.body.idAnswerMap; // TODO: duck type validation
            const { tries, passed, score, idCorrectAnswerMap, isTrainingSubject, } = await TrainingCtrl.getQuizScore({
                user: user,
                ip,
                category: category,
                idAnswerMap,
            });
            if (passed) {
                await (0, queries_1.createQuizAction)({
                    userId: user.id,
                    action: constants_1.QUIZ_USER_ACTIONS.PASSED,
                    quizSubcategory: category,
                    ipAddress: ip,
                });
            }
            else {
                // we want to queue a job to send this email only if this is the first time
                // a volunteer has taken a quiz ever, and they failed it
                // must come before th quizActionCreator call or will never fire
                // because there would always be a failed quiz
                const takenQuizBefore = await (0, queries_1.userHasTakenQuiz)(user.id);
                if (!takenQuizBefore)
                    await VolunteerService.queueFailedFirstAttemptedQuizEmail(category, user.email, user.firstName, user.id);
                await (0, queries_1.createQuizAction)({
                    userId: user.id,
                    action: constants_1.QUIZ_USER_ACTIONS.FAILED,
                    quizSubcategory: category,
                    ipAddress: ip,
                });
            }
            res.json({
                msg: 'Score calculated and saved',
                tries,
                passed,
                score,
                idCorrectAnswerMap,
                isTrainingSubject,
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/training/review/:category', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const category = (0, type_utils_1.asString)(req.params.category);
            const { ip: ipAddress } = req;
            (0, queries_1.createQuizAction)({
                userId: user.id,
                action: constants_1.QUIZ_USER_ACTIONS.VIEWED_MATERIALS,
                quizSubcategory: category,
                ipAddress: ipAddress,
            });
            const resultList = await (0, queries_2.getQuizReviewMaterials)(category);
            if (resultList) {
                res.status(200).json(resultList);
            }
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/training/course/:courseKey', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const courseKey = (0, type_utils_1.asString)(req.params.courseKey);
            const course = await TrainingCourseService.getCourse(user, courseKey);
            if (!course)
                return res.sendStatus(404);
            res.status(200).json({ course });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.post('/training/course/:courseKey/progress', async function (req, res) {
        try {
            const user = (0, extract_user_1.extractUser)(req);
            const courseKey = (0, type_utils_1.asString)(req.params.courseKey);
            const materialKey = (0, type_utils_1.asString)(req.body.materialKey);
            const result = await TrainingCourseService.recordProgress(user, courseKey, materialKey);
            if (result)
                // TODO: can I exit early?
                res.status(200).json(result);
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeTraining = routeTraining;
