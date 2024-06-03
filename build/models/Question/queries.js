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
exports.getQuizCertUnlocksByQuizName = exports.getQuizByName = exports.getQuizReviewMaterials = exports.getQuestionsByCategory = exports.getMultipleQuestionsById = exports.getSubcategoriesForQuiz = exports.getCategories = exports.destroy = exports.updateQuestion = exports.createQuestion = exports.listQuestions = exports.parseQueryResult = void 0;
const Errors_1 = require("../Errors");
const pgUtils_1 = require("../pgUtils");
const pgQueries = __importStar(require("./pg.queries"));
const db_1 = require("../../db");
function parseQueryResult(result) {
    const possibleAnswers = typeof result.possibleAnswers === 'string'
        ? JSON.parse(result.possibleAnswers)
        : result.possibleAnswers;
    return { ...result, possibleAnswers, _id: result.id };
}
exports.parseQueryResult = parseQueryResult;
async function listQuestions(filters) {
    try {
        const questions = await pgQueries.list.run({ ...filters }, (0, db_1.getClient)());
        const result = questions.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['imageSrc']));
        const parsedResult = result.map(res => parseQueryResult(res));
        return parsedResult;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.listQuestions = listQuestions;
async function createQuestion(question) {
    const client = await (0, db_1.getClient)().connect();
    try {
        await client.query('BEGIN');
        const quizUpsertResult = await pgQueries.upsertQuiz.run({ name: question.category }, client);
        const quizId = (0, pgUtils_1.makeRequired)(quizUpsertResult[0]).id;
        const subcategoryUpsertResult = await pgQueries.upsertQuizSubcategory.run({ name: question.subcategory, quizId }, client);
        const subcategoryId = (0, pgUtils_1.makeRequired)(subcategoryUpsertResult[0]).id;
        // pg parser takes any array and makes it a native array, so JSON arrays
        // break it, so we must JSON.stringify any JSON array.
        // https://github.com/adelsz/pgtyped/issues/263
        const result = await pgQueries.create.run({
            questionText: question.questionText,
            possibleAnswers: JSON.stringify(question.possibleAnswers),
            correctAnswer: question.correctAnswer,
            imageSrc: question.imageSrc,
            subcategoryId,
        }, client);
        if (result.length) {
            const newQuestion = (0, pgUtils_1.makeSomeOptional)(result[0], ['imageSrc']);
            const toRtn = parseQueryResult({
                ...newQuestion,
                category: question.category,
                subcategory: question.subcategory,
            });
            await client.query('COMMIT');
            return toRtn;
        }
        else
            throw new Error('insertion of question did not return new row');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoCreateError(err);
    }
    finally {
        client.release();
    }
}
exports.createQuestion = createQuestion;
async function updateQuestion(options) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const question = options.question;
        await client.query('BEGIN');
        const quizUpsertResult = await pgQueries.upsertQuiz.run({ name: question.category }, client);
        const quizId = (0, pgUtils_1.makeRequired)(quizUpsertResult[0]).id;
        const subcategoryUpsertResult = await pgQueries.upsertQuizSubcategory.run({ name: question.subcategory, quizId }, client);
        const subcategoryId = (0, pgUtils_1.makeRequired)(subcategoryUpsertResult[0]).id;
        // pg parser takes any array and makes it a native array, so JSON arrays
        // break it, so we must JSON.stringify any JSON array.
        // https://github.com/adelsz/pgtyped/issues/263
        const result = await pgQueries.update.run({
            questionId: options.id,
            correctAnswer: question.correctAnswer,
            imageSrc: question.imageSrc,
            questionText: question.questionText,
            subcategoryId: subcategoryId,
            possibleAnswers: JSON.stringify(question.possibleAnswers),
        }, client);
        if (!(result.length && (0, pgUtils_1.makeRequired)(result[0]).ok))
            throw new Error('insertion of question did not return ok');
        await client.query('COMMIT');
        return question;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoUpdateError(err);
    }
    finally {
        client.release();
    }
}
exports.updateQuestion = updateQuestion;
async function destroy(questionId) {
    try {
        const result = await pgQueries.destroy.run({ questionId }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0].ok))
            return;
    }
    catch (err) {
        throw new Errors_1.RepoDeleteError(err);
    }
}
exports.destroy = destroy;
async function getCategories() {
    try {
        const result = await pgQueries.categories.run(undefined, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getCategories = getCategories;
async function getSubcategoriesForQuiz(quizName) {
    try {
        const result = await pgQueries.getSubcategoriesForQuiz.run({ quizName }, (0, db_1.getClient)());
        return result.map(v => (0, pgUtils_1.makeRequired)(v));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSubcategoriesForQuiz = getSubcategoriesForQuiz;
async function getMultipleQuestionsById(ids) {
    try {
        const questions = await pgQueries.getMultipleQuestionsById.run({ ids }, (0, db_1.getClient)());
        const result = questions.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['imageSrc']));
        const parsedResult = result.map(res => parseQueryResult(res));
        return parsedResult;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getMultipleQuestionsById = getMultipleQuestionsById;
async function getQuestionsByCategory(category, limit, offset) {
    try {
        const questions = await pgQueries.getQuestionsByCategory.run({ category, limit, offset }, (0, db_1.getClient)());
        const result = questions.map(v => (0, pgUtils_1.makeSomeOptional)(v, ['imageSrc']));
        const parsedResult = result.map(res => parseQueryResult(res));
        return parsedResult;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuestionsByCategory = getQuestionsByCategory;
async function getQuizReviewMaterials(category) {
    try {
        const materials = await pgQueries.getQuizReviewMaterials.run({ category }, (0, db_1.getClient)());
        const result = materials.map(v => (0, pgUtils_1.makeRequired)(v));
        return result;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizReviewMaterials = getQuizReviewMaterials;
async function getQuizByName(quizName) {
    try {
        const results = await pgQueries.getQuizByName.run({ quizName }, (0, db_1.getClient)());
        if (results.length)
            return { ...(0, pgUtils_1.makeRequired)(results[0]), totalQuestions: 10 };
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizByName = getQuizByName;
async function getQuizCertUnlocksByQuizName(quizName) {
    try {
        const results = await pgQueries.getQuizCertUnlocksByQuizName.run({ quizName }, (0, db_1.getClient)());
        if (results.length)
            return results.map(v => (0, pgUtils_1.makeRequired)(v));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizCertUnlocksByQuizName = getQuizCertUnlocksByQuizName;
