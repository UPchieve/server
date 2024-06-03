"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = exports.destroyQuestion = exports.update = exports.create = exports.list = void 0;
const Question_1 = require("../models/Question");
// TODO: duck type validation
async function list(filters // FilterQuery<Question>[]
) {
    return await (0, Question_1.listQuestions)(filters);
}
exports.list = list;
// TODO: duck type validation
async function create(question) {
    return await (0, Question_1.createQuestion)(question);
}
exports.create = create;
async function update(options) {
    return (0, Question_1.updateQuestion)(options);
}
exports.update = update;
async function destroyQuestion(questionId) {
    try {
        await (0, Question_1.destroy)(questionId);
    }
    catch (err) {
        throw new Error('question to delete not found');
    }
}
exports.destroyQuestion = destroyQuestion;
// Return an array of tuples, with each tuple containing a category and array of
// subcategories.
//
// Example:
//
//      [
//         ['algebra', ['linear', 'rational']],
//         ['applications', ['LOR', 'basic']]
//      ]
//
async function categories() {
    const categories = await (0, Question_1.getCategories)();
    const tuples = [];
    for (const category of categories) {
        tuples.push([category.categories, category.subcategories]);
    }
    return tuples;
}
exports.categories = categories;
