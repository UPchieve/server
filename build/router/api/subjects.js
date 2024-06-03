"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeSubjects = void 0;
const res_error_1 = require("../res-error");
const SubjectsService_1 = require("../../services/SubjectsService");
const Subjects_1 = require("../../models/Subjects");
function routeSubjects(router) {
    router.get('/subjects', async function (req, res) {
        try {
            const subjects = await (0, Subjects_1.getSubjectsWithTopic)();
            res.json({
                subjects,
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/subjects/training', async function (req, res) {
        try {
            const trainingView = await (0, Subjects_1.getVolunteerTrainingData)();
            res.json({
                training: trainingView,
            });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
    router.get('/subjects/is-valid', async function (req, res) {
        try {
            const isValid = await (0, SubjectsService_1.isValidSubjectAndTopic)(req.query);
            res.json({ isValid });
        }
        catch (err) {
            (0, res_error_1.resError)(res, err);
        }
    });
}
exports.routeSubjects = routeSubjects;
