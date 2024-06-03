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
exports.filterSubtopicsFromQuestions = exports.getQuizScore = exports.getQuestions = void 0;
const lodash_1 = __importDefault(require("lodash"));
const AnalyticsService_1 = require("../services/AnalyticsService");
const constants_1 = require("../constants");
const UserAction_1 = require("../models/UserAction");
const MailService_1 = require("../services/MailService");
const VolunteerService_1 = require("../services/VolunteerService");
const QuestionModel = __importStar(require("../models/Question"));
const VolunteerModel = __importStar(require("../models/Volunteer"));
const SubjectsModel = __importStar(require("../models/Subjects"));
const type_utils_1 = require("../utils/type-utils");
const FeatureFlagService_1 = require("../services/FeatureFlagService");
async function getQuestions(category, userId) {
    const subcategories = await QuestionModel.getSubcategoriesForQuiz(category);
    if (!subcategories.length) {
        throw new Error(`No subcategories defined for category: ${category}`);
    }
    const quiz = await QuestionModel.getQuizByName(category);
    if (!quiz)
        throw new Error(`No quiz created for category: ${category}`);
    const questionPerCategory = quiz.questionsPerSubcategory;
    const questions = await QuestionModel.listQuestions({
        category,
        subcategory: null,
    });
    const isStandardizedCertsActive = await (0, FeatureFlagService_1.getStandardizedCertsFlag)(userId);
    const filteredSubcategoryQuestions = filterSubtopicsFromQuestions(category, questions);
    const questionsBySubcategory = lodash_1.default.groupBy(isStandardizedCertsActive ? filteredSubcategoryQuestions : questions, question => question.subcategory);
    const shuffledQuestions = lodash_1.default.shuffle(Object.entries(questionsBySubcategory).flatMap(([, subQuestions]) => lodash_1.default.sampleSize(subQuestions, questionPerCategory)));
    if (isStandardizedCertsActive) {
        (0, AnalyticsService_1.captureEvent)(userId, constants_1.EVENTS.FLAGGED_BY_STANDARDIZED_CERTS, {
            event: constants_1.EVENTS.FLAGGED_BY_STANDARDIZED_CERTS,
            subject: category,
        });
    }
    return isStandardizedCertsActive
        ? shuffledQuestions.slice(0, quiz.totalQuestions)
        : shuffledQuestions;
}
exports.getQuestions = getQuestions;
async function getQuizScore(options) {
    const { user, idAnswerMap, ip } = options;
    const cert = options.category;
    const objIDs = Object.keys(idAnswerMap);
    const numIDs = objIDs.map(id => Number(id));
    const questions = await QuestionModel.getMultipleQuestionsById(numIDs);
    const SUBJECT_THRESHOLD = 0.8;
    const TRAINING_THRESHOLD = 0.9;
    const score = questions.filter(question => question.correctAnswer === idAnswerMap[question.id]).length;
    const percent = score / questions.length;
    const subjectType = await SubjectsModel.getSubjectType(cert);
    if (!subjectType)
        throw new Error(`No subject type found for subject: ${cert}`);
    const threshold = subjectType === constants_1.SUBJECT_TYPES.TRAINING
        ? TRAINING_THRESHOLD
        : SUBJECT_THRESHOLD;
    const passed = percent >= threshold;
    const userQuizzesMap = await VolunteerModel.getQuizzesForVolunteers([user.id]);
    const userQuizzes = userQuizzesMap[user.id];
    const tries = userQuizzes[cert] ? userQuizzes[cert].tries : 1;
    await VolunteerModel.updateVolunteerQuiz(user.id, options.category, passed);
    if (passed) {
        const quizCertUnlocks = await QuestionModel.getQuizCertUnlocksByQuizName((0, type_utils_1.asString)(cert));
        const unlockedSubjects = quizCertUnlocks.map(cert => cert.unlockedCertName);
        // set custom field passedUpchieve101 in SendGrid
        if (cert === constants_1.TRAINING.UPCHIEVE_101)
            await (0, MailService_1.createContact)(user.id);
        const currentSubjects = await VolunteerModel.getSubjectsForVolunteer(user.id);
        // Create a user action for every subject unlocked
        for (const subject of unlockedSubjects) {
            if (!currentSubjects.includes(subject)) {
                await (0, UserAction_1.createQuizAction)({
                    action: constants_1.QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
                    userId: user.id,
                    quizSubcategory: subject,
                });
                (0, AnalyticsService_1.captureEvent)(user.id, constants_1.EVENTS.SUBJECT_UNLOCKED, {
                    event: constants_1.EVENTS.SUBJECT_UNLOCKED,
                    subject,
                });
                await VolunteerModel.addVolunteerCertification(user.id, subject);
            }
        }
        // If volunteer is not onboarded and has completed other onboarding steps - including passing an academic quiz
        const volunteerProfile = await VolunteerModel.getVolunteerForOnboardingById(user.id);
        const hasSubjects = unlockedSubjects.length > 0 || currentSubjects.length > 0;
        const passedUpchieve101 = (volunteerProfile === null || volunteerProfile === void 0 ? void 0 : volunteerProfile.hasCompletedUpchieve101) ||
            cert === constants_1.TRAINING.UPCHIEVE_101;
        if (volunteerProfile &&
            !volunteerProfile.onboarded &&
            volunteerProfile.availabilityLastModifiedAt &&
            hasSubjects &&
            passedUpchieve101) {
            await VolunteerModel.updateVolunteerOnboarded(user.id);
            await (0, VolunteerService_1.queueOnboardingEventEmails)(user.id);
            // TODO: this should just be done by the generic onboarding email handler above
            if (user.volunteerPartnerOrg)
                await (0, VolunteerService_1.queuePartnerOnboardingEventEmails)(user.id);
            await (0, UserAction_1.createAccountAction)({
                action: constants_1.ACCOUNT_USER_ACTIONS.ONBOARDED,
                userId: user.id,
                ipAddress: ip,
            });
            (0, AnalyticsService_1.captureEvent)(user.id, constants_1.EVENTS.ACCOUNT_ONBOARDED, {
                event: constants_1.EVENTS.ACCOUNT_ONBOARDED,
            });
        }
    }
    const idCorrectAnswerMap = questions.reduce((correctAnswers, question) => {
        correctAnswers[question.id] = question.correctAnswer;
        return correctAnswers;
    }, {});
    return {
        tries,
        passed,
        score,
        idCorrectAnswerMap,
        isTrainingSubject: subjectType === constants_1.SUBJECT_TYPES.TRAINING,
    };
}
exports.getQuizScore = getQuizScore;
// TODO: Remove in medium-certs-v2 clean up
function filterSubtopicsFromQuestions(subject, questions) {
    const filterSubtopicsOut = {
        '6thGradeMath': [
            'ratios',
            'area',
            'polygons',
            'exponents',
            'factoring',
            'doubleNumberLine',
            'SEL',
            'middleSchool',
        ],
        '7thGradeMath': [
            'ratio',
            'propertiesof',
            'scalefactor',
            'areaofcircle',
            'prisms',
            'visual3',
            'SEL',
        ],
        '8thGradeMath': [
            'middleSchool',
            'SEL',
            'linearEquations',
            'functions',
            'geometryCongruence',
            'volume',
            'Exponents',
            'scatterPlots',
            'geometryDialations',
            'pythagoreanTheorem',
        ],
        // no subtopics to filter
        prealgebra: [],
        // no subtopics to filter
        algebraOne: [],
        algebraTwo: [
            'rounding_and_scientific_notation',
            'functions_domain',
            'rational_expressions',
            'square_root_equations',
            'arithmetic_and_geometric_sequences',
        ],
        // no subtopics to filter
        geometry: [],
        trigonometry: ['trig functions', 'pythagorean theorem', 'right triangles'],
        // no subtopics to filter
        statistics: [],
        // no subtopics to filter
        precalculus: [],
        // no subtopics to filter
        calculusAB: [],
        // no subtopics to filter
        calculusBC: [],
        biology: ['the cell'],
        // no subtopics to filter
        chemistry: [],
        // no subtopics to filter
        physicsOne: [],
        // no subtopics to filter
        physicsTwo: [],
        // no subtopics to filter
        environmentalScience: [],
        // no subtopics to filter
        reading: [],
        essayPlanning: [
            // had a space
            'set expectations',
            'planning steps',
            'outlines',
            'types of essays',
            'common requests',
        ],
        essayFeedback: [
            'types of essays',
            'basics',
            'passage details',
            'structure',
            'passage unity',
            'conclusion',
            'passage thesis',
            'punctuation',
            'wordiness',
            'nonvarying sentence length',
            'specificity and coherence',
            'common requests',
            'independent and dependent clauses',
        ],
        // no subtopics to filter
        usHistory: [],
        // no subtopics to filter
        worldHistory: [],
        collegePrep: ['timeline'],
        collegeList: ['research', 'cost'],
        // no subtopics to filter
        collegeApps: [],
        // no subtopics to filter
        applicationEssays: [],
        financialAid: ['special', 'source', 'direct', 'FAFSA advanced', 'CSS'],
        // no subtopics to filter
        satMath: [],
        // no subtopics to filter
        satReading: [],
    };
    const subtopicsToFilter = new Set(filterSubtopicsOut[subject]);
    return questions.filter(q => !subtopicsToFilter.has(q.subcategory));
}
exports.filterSubtopicsFromQuestions = filterSubtopicsFromQuestions;
