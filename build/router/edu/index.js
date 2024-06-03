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
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
// TODO: no typesfor ejs layouts
const expressLayouts = require('express-ejs-layouts');
const config_1 = __importDefault(require("../../config"));
const auth_utils_1 = require("../../utils/auth-utils");
const QuestionCtrl = __importStar(require("../../controllers/QuestionCtrl"));
const helpers_1 = require("./helpers");
const logger_1 = __importDefault(require("../../logger"));
const path_1 = __importDefault(require("path"));
const type_utils_1 = require("../../utils/type-utils");
const QuestionRepo = __importStar(require("../../models/Question"));
const edu = (0, express_1.default)();
edu.set('view engine', 'ejs');
edu.set('views', path_1.default.join(__dirname, '../../views'));
edu.set('layout', 'layouts/edu');
edu.use(expressLayouts);
edu.locals = {
    homeLink: config_1.default.NODE_ENV === 'dev' ? 'http://localhost:3000' : '/',
    frontEndRoot: config_1.default.NODE_ENV === 'dev' ? new URL('http://localhost:3000') : null,
};
// GET /edu
edu.get('/', async (req, res) => {
    try {
        const categories = (await QuestionCtrl.categories()).reduce((acc, [category, subcategories]) => [
            ...acc,
            (0, helpers_1.questionsPath)(category),
            subcategories.map((subcategory) => (0, helpers_1.questionsPath)(category, subcategory)),
        ], []);
        res.render('edu/index', {
            adminPages: [
                { path: 'questions', label: 'All Questions' },
                ...categories,
            ],
            isActive: (0, helpers_1.isActivePage)(req),
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).send(`<h1>Internal Server Error</h1> <pre>${error}</pre>`);
    }
});
// GET /edu/questions
edu.route('/questions').get(async (req, res) => {
    try {
        const questions = await QuestionCtrl.list(req.query || {});
        const isActive = (0, helpers_1.isActivePage)(req);
        // question._id --> URL
        const imagePaths = questions.reduce((map, question) => {
            map[question.id] = (0, helpers_1.frontEndPath)(question.imageSrc || '', edu.locals.frontEndRoot);
            return map;
        }, {});
        res.render('edu/questions/index', {
            questions,
            isActive,
            imagePaths,
            csrfToken: req.csrfToken(),
        });
    }
    catch (error) {
        res.status(500).send(`<h1>Internal Server Error</h1> <pre>${error}</pre>`);
    }
});
// GET /edu/questions/new
edu.route('/questions/new').get((req, res) => {
    const question = {
        possibleAnswers: [{ val: 'a' }, { val: 'b' }, { val: 'c' }, { val: 'd' }],
    };
    const isActive = (0, helpers_1.isActivePage)(req);
    res.render('edu/questions/new', {
        question,
        isActive,
        csrfToken: req.csrfToken(),
    });
});
const eduApi = (0, express_1.default)();
// POST[JSON] /edu/categoryquestions
eduApi.post('/categoryquestions', async (req, res) => {
    const category = (0, type_utils_1.asString)(req.body.category);
    // TODO: duck typing on optionals here
    const skip = req.body.skip;
    const limit = req.body.limit;
    try {
        const questions = await QuestionRepo.getQuestionsByCategory(category, limit, skip);
        res.status(200).json({ questions: questions });
    }
    catch (error) {
        res.status(422).json({ error: error.toString() });
    }
});
// POST[JSON] /edu/questions
eduApi.post('/questions', async (req, res) => {
    try {
        const question = await QuestionCtrl.create(req.body.question);
        res.status(200).json({ question: question });
    }
    catch (error) {
        res.status(422).json({ error });
    }
});
// PUT[JSON] /edu/questions/:id
eduApi.put('/questions/:id', async (req, res) => {
    try {
        const updatedQuestion = await QuestionCtrl.update({
            id: Number(req.params.id),
            question: req.body.question,
        });
        res.status(200).json({ question: updatedQuestion });
    }
    catch (error) {
        res.status(422).json({ error });
    }
});
// DELETE[JSON] /edu/questions/:id
eduApi.delete('/questions/:id', async (req, res) => {
    try {
        await QuestionCtrl.destroyQuestion(Number(req.params.id));
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        res.status(422).json({ error });
    }
});
function routes(rootApp) {
    rootApp.use('/edu', [auth_utils_1.authPassport.isAuthenticatedRedirect, auth_utils_1.authPassport.isAdminRedirect], edu);
    rootApp.use('/edu', [auth_utils_1.authPassport.isAuthenticated, auth_utils_1.authPassport.isAdmin], eduApi);
}
exports.routes = routes;
