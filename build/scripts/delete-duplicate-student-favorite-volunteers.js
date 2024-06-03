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
exports.deleteDuplicateStudentFavoriteVolunteers = void 0;
const StudentRepo = __importStar(require("../models/Student"));
const logger_1 = require("../worker/logger");
const db_1 = require("../db");
const deleteDuplicateStudentFavoriteVolunteers = async () => {
    const numDuplicates = await StudentRepo.countDuplicateStudentVolunteerFavorites();
    if (numDuplicates === 0) {
        (0, logger_1.log)('Found 0 duplicates in student_favorite_volunteers. Returning');
        return;
    }
    (0, logger_1.log)(`Found ${numDuplicates} duplicates in student_favorite_volunteers`);
    await (0, db_1.runInTransaction)(async (tc) => {
        const numDeleted = await StudentRepo.deleteDuplicateStudentVolunteerFavorites(tc);
        if (numDeleted !== numDuplicates) {
            throw new Error(`Expected to delete ${numDuplicates} duplicates from student_favorite_volunteers, but actually deleted ${numDeleted}. Will rollback.`);
        }
        (0, logger_1.log)(`Deleted ${numDeleted} duplicates from student_favorite_volunteers`);
    });
};
exports.deleteDuplicateStudentFavoriteVolunteers = deleteDuplicateStudentFavoriteVolunteers;
exports.default = exports.deleteDuplicateStudentFavoriteVolunteers;
