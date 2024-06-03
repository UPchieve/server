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
exports.recordProgress = exports.getCourse = void 0;
const Volunteer_1 = require("../models/Volunteer");
const TrainingUtils = __importStar(require("../utils/training-courses"));
// @note: this type was derived from how the return type is used by the frontend
// TODO: come back and verify this is the return shape we want
async function getCourse(volunteer, courseKey) {
    const volunteerTrainingCourses = await (0, Volunteer_1.getVolunteerTrainingCourses)(volunteer.id);
    const foundCourse = volunteerTrainingCourses[courseKey];
    // if the volunteer has no progress so far make a blank
    const volunteerCourse = foundCourse || {
        complete: false,
        completedMaterials: [],
        progress: 0,
    };
    const course = Object.assign({}, await TrainingUtils.getCourse(courseKey, volunteer.id));
    course.modules.forEach((mod) => {
        mod.materials.forEach((mat) => {
            mat.isCompleted = volunteerCourse.completedMaterials.includes(mat.materialKey);
        });
    });
    return {
        ...course,
        isComplete: volunteerCourse.complete,
        progress: volunteerCourse.progress,
        quizKey: courseKey,
    };
}
exports.getCourse = getCourse;
// TODO: clean up return type
async function recordProgress(volunteer, courseKey, materialKey) {
    const volunteerTrainingCourses = await (0, Volunteer_1.getVolunteerTrainingCourses)(volunteer.id);
    const foundCourse = volunteerTrainingCourses[courseKey];
    // if the volunteer has no progress so far make a blank
    const volunteerCourse = foundCourse || {
        complete: false,
        completedMaterials: [],
        progress: 0,
    };
    // Early exit if already saved progress
    if (volunteerCourse.completedMaterials.includes(materialKey))
        return;
    // Mutate user object's completedMaterials
    const completedMaterials = [...volunteerCourse.completedMaterials];
    completedMaterials.push(materialKey);
    const progress = await TrainingUtils.getProgress(courseKey, completedMaterials, volunteer.id);
    const isComplete = progress === 100;
    await (0, Volunteer_1.updateVolunteerTrainingById)(volunteer.id, courseKey, isComplete, progress, materialKey);
    return { progress, isComplete };
}
exports.recordProgress = recordProgress;
