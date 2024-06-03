"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSubjectAndTopic = exports.asValidSubjectAndTopicCheck = void 0;
const type_utils_1 = require("../utils/type-utils");
const Subjects_1 = require("../models/Subjects");
const case_1 = __importDefault(require("case"));
exports.asValidSubjectAndTopicCheck = (0, type_utils_1.asFactory)({
    subject: type_utils_1.asString,
    topic: type_utils_1.asString,
});
async function isValidSubjectAndTopic(data) {
    const { subject, topic } = (0, exports.asValidSubjectAndTopicCheck)(data);
    const result = await (0, Subjects_1.getSubjectAndTopic)(case_1.default.camel(subject), case_1.default.camel(topic));
    return !!result;
}
exports.isValidSubjectAndTopic = isValidSubjectAndTopic;
