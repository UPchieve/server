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
exports.getSubjectNameIdMapping = exports.getSubjectType = exports.getVolunteerTrainingData = exports.getTrainingCourses = exports.getQuizCertUnlocks = exports.getComputedSubjectUnlocks = exports.getCertSubjectUnlocks = exports.generateTrainingRow = exports.processTrainingRow = exports.getSubjectsWithTopic = exports.getSubjectAndTopic = void 0;
const pgQueries = __importStar(require("./pg.queries"));
const db_1 = require("../../db");
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
const lodash_1 = __importDefault(require("lodash"));
const type_utils_1 = require("../../utils/type-utils");
async function getSubjectAndTopic(subject, topic) {
    try {
        const result = await pgQueries.getSubjectAndTopic.run({ subject, topic }, (0, db_1.getClient)());
        if (result.length && (0, pgUtils_1.makeRequired)(result[0]))
            return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSubjectAndTopic = getSubjectAndTopic;
async function getSubjectsWithTopic() {
    try {
        const result = await pgQueries.getSubjects.run(undefined, (0, db_1.getClient)());
        const mappedResult = result.map(row => (0, pgUtils_1.makeSomeOptional)(row, ['topicIconLink', 'topicColor']));
        const subjects = {};
        for (const row of mappedResult) {
            subjects[row.name] = row;
        }
        return subjects;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSubjectsWithTopic = getSubjectsWithTopic;
// Remaps a training data to a shape of `FormattedTrainingPerTopic`
function processTrainingRow(groups, desiredMapping) {
    const mappedRow = {};
    for (const [topicName, certs] of Object.entries(groups)) {
        mappedRow[topicName] = [];
        for (const data of certs) {
            const trainingMapping = {
                // TODO: figure out a better way to match type than asserting
                //       that the values are what they are
                rowName: (0, type_utils_1.asString)(data[desiredMapping.rowName]),
                rowDisplayName: (0, type_utils_1.asString)(data[desiredMapping.rowDisplayName]),
                rowDisplayOrder: (0, type_utils_1.asNumber)(data[desiredMapping.rowDisplayOrder]),
                rowListItemName: (0, type_utils_1.asString)(data[desiredMapping.rowListItemName]),
                rowListItemDisplayName: (0, type_utils_1.asString)(data[desiredMapping.rowListItemDisplayName]),
                rowListItemDisplayOrder: (0, type_utils_1.asNumber)(data[desiredMapping.rowListItemDisplayOrder]),
            };
            if (desiredMapping.rowIsActive)
                trainingMapping.rowIsActive = (0, type_utils_1.asBoolean)(data[desiredMapping.rowIsActive]);
            mappedRow[topicName].push(trainingMapping);
        }
    }
    return mappedRow;
}
exports.processTrainingRow = processTrainingRow;
// Constructs training rows with properties that the frontend expects
function generateTrainingRow(groups) {
    const topicTrainingRows = {};
    for (const [topicName, data] of Object.entries(groups)) {
        topicTrainingRows[topicName] = [];
        const groupedRows = lodash_1.default.groupBy(data, row => row.rowName);
        for (const rows of Object.values(groupedRows)) {
            const item = {
                displayName: rows[0].rowDisplayName,
                key: rows[0].rowName,
                order: rows[0].rowDisplayOrder,
                subjectsIncluded: [],
            };
            if (rows[0].hasOwnProperty('rowIsActive'))
                item.active = rows[0].rowIsActive;
            for (const row of rows) {
                item.subjectsIncluded.push({
                    displayName: row.rowListItemDisplayName,
                    key: row.rowListItemName,
                    order: row.rowListItemDisplayOrder,
                });
            }
            item.subjectsIncluded.sort((a, b) => a.order - b.order);
            topicTrainingRows[topicName].push(item);
        }
    }
    return topicTrainingRows;
}
exports.generateTrainingRow = generateTrainingRow;
async function getCertSubjectUnlocks() {
    try {
        // Get the subjects that are unlocked when a certification
        // has been acquired for the subject
        const certificationUnlocks = await pgQueries.getCertSubjectUnlocks.run(undefined, (0, db_1.getClient)());
        // remove certifications that unlock themselves
        const computedSubjects = certificationUnlocks
            .map(v => (0, pgUtils_1.makeRequired)(v))
            .filter(row => row.unlockedSubjectName !== row.certName);
        const computedSubjectGrouped = lodash_1.default.groupBy(computedSubjects, row => row.topicName);
        const processedSubjectGrouped = processTrainingRow(computedSubjectGrouped, {
            rowName: 'unlockedSubjectName',
            rowDisplayName: 'unlockedSubjectDisplayName',
            rowDisplayOrder: 'unlockedSubjectDisplayOrder',
            rowListItemName: 'certName',
            rowListItemDisplayName: 'certDisplayName',
            rowListItemDisplayOrder: 'certDisplayOrder',
        });
        const additionalSubjects = generateTrainingRow(processedSubjectGrouped);
        return additionalSubjects;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getCertSubjectUnlocks = getCertSubjectUnlocks;
async function getComputedSubjectUnlocks() {
    try {
        // Get the computed subjects that are unlocked when a combination of
        // quizzes have been completed
        // The purpose here is to find computed subjects that rely on having multiple certifications
        const certificationUnlocks = await pgQueries.getComputedSubjectUnlocks.run(undefined, (0, db_1.getClient)());
        // remove certifications that unlock themselves
        const computedSubjects = certificationUnlocks
            .map(v => (0, pgUtils_1.makeRequired)(v))
            .filter(row => row.unlockedSubjectName !== row.certName);
        const computedSubjectGrouped = lodash_1.default.groupBy(computedSubjects, row => row.topicName);
        const processedSubjectGrouped = processTrainingRow(computedSubjectGrouped, {
            rowName: 'unlockedSubjectName',
            rowDisplayName: 'unlockedSubjectDisplayName',
            rowDisplayOrder: 'unlockedSubjectDisplayOrder',
            rowListItemName: 'certName',
            rowListItemDisplayName: 'certDisplayName',
            rowListItemDisplayOrder: 'certDisplayOrder',
        });
        const additionalSubjects = generateTrainingRow(processedSubjectGrouped);
        return additionalSubjects;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getComputedSubjectUnlocks = getComputedSubjectUnlocks;
async function getQuizCertUnlocks() {
    try {
        // Get all quizzes and the certs that are unlocked from those quizzes
        const quizCertificationResults = await pgQueries.getQuizCertUnlocks.run(undefined, (0, db_1.getClient)());
        const mappedQuizCertificationsResults = quizCertificationResults.map(v => (0, pgUtils_1.makeRequired)(v));
        const quizTopicGroups = lodash_1.default.groupBy(mappedQuizCertificationsResults, row => row.topicName);
        const processedQuizTopics = processTrainingRow(quizTopicGroups, {
            rowName: 'quizName',
            rowDisplayName: 'quizDisplayName',
            rowDisplayOrder: 'quizDisplayOrder',
            rowListItemName: 'unlockedCertName',
            rowListItemDisplayName: 'unlockedCertDisplayName',
            rowListItemDisplayOrder: 'unlockedCertDisplayOrder',
            rowIsActive: 'quizIsActive',
        });
        const quizCertificationUnlocks = generateTrainingRow(processedQuizTopics);
        return quizCertificationUnlocks;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getQuizCertUnlocks = getQuizCertUnlocks;
async function getTrainingCourses() {
    try {
        const result = await pgQueries.getTrainingCourses.run(undefined, (0, db_1.getClient)());
        if (result.length)
            return result.map(row => (0, pgUtils_1.makeRequired)(row));
        return [];
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getTrainingCourses = getTrainingCourses;
async function getVolunteerTrainingData() {
    try {
        // Get all of the topics for the subject type headings for the training view
        const topics = await pgQueries.getTopics.run(undefined, (0, db_1.getClient)());
        const subjectTypes = topics
            .map(v => {
            const mappedTopics = (0, pgUtils_1.makeRequired)(v);
            return {
                ...mappedTopics,
                key: mappedTopics.name,
                order: mappedTopics.trainingOrder,
            };
        })
            .sort((a, b) => a.order - b.order);
        const additionalSubjects = await getCertSubjectUnlocks();
        const computedSubjects = await getComputedSubjectUnlocks();
        const quizCertificationUnlocks = await getQuizCertUnlocks();
        const trainingCourses = await getTrainingCourses();
        const requiredTraining = trainingCourses.map(v => {
            const mappedTraining = (0, pgUtils_1.makeRequired)(v);
            return {
                displayName: mappedTraining.displayName,
                key: mappedTraining.name,
            };
        });
        const trainingView = {
            subjectTypes,
        };
        for (const topic of subjectTypes) {
            // Filter out the training header if the topic has no active quizzes
            // that unlock certs
            if (!quizCertificationUnlocks[topic.key]) {
                trainingView.subjectTypes = trainingView.subjectTypes.filter(header => header.key !== topic.key);
                continue;
            }
            if (!trainingView[topic.key])
                trainingView[topic.key] = {};
            trainingView[topic.key].training = requiredTraining;
            trainingView[topic.key].certifications = quizCertificationUnlocks[topic.key].sort((a, b) => a.order - b.order);
            trainingView[topic.key].additionalSubjects =
                additionalSubjects[topic.key] || [];
            trainingView[topic.key].computedSubjects =
                computedSubjects[topic.key] || [];
        }
        return trainingView;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getVolunteerTrainingData = getVolunteerTrainingData;
async function getSubjectType(subject) {
    try {
        const result = await pgQueries.getSubjectType.run({ subject }, (0, db_1.getClient)());
        if (result.length)
            return (0, pgUtils_1.makeRequired)(result[0]).subjectType;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSubjectType = getSubjectType;
async function getSubjectNameIdMapping() {
    try {
        let subjectNameIdMappingResult = await pgQueries.getSubjectNameIdMapping.run(undefined, (0, db_1.getClient)());
        if (!subjectNameIdMappingResult.length)
            throw new Errors_1.RepoReadError('Select query did not return ok (subjectNameIdMappingResult)');
        subjectNameIdMappingResult.map(v => (0, pgUtils_1.makeRequired)(v));
        let subjectNameIdMapping = {};
        for (const subjectNameAndId of subjectNameIdMappingResult) {
            subjectNameIdMapping[subjectNameAndId.name] = subjectNameAndId.id;
        }
        return subjectNameIdMapping;
    }
    catch (err) {
        if (err instanceof Errors_1.RepoReadError)
            throw err;
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getSubjectNameIdMapping = getSubjectNameIdMapping;
