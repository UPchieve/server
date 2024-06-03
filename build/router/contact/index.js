"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const newrelic_1 = __importDefault(require("newrelic"));
const ContactFormService_1 = require("../../services/ContactFormService");
const Errors_1 = require("../../models/Errors");
const logger_1 = __importDefault(require("../../logger"));
async function submissionHandler(req, res) {
    const requestData = req.body;
    logger_1.default.debug(requestData);
    await newrelic_1.default.startSegment('router:contactFormSubmission:save', true, async function () {
        try {
            await (0, ContactFormService_1.saveContactFormSubmission)(requestData);
            res.status(200).json({
                message: 'contact form submission has been sent',
            });
        }
        catch (err) {
            logger_1.default.error(err);
            if (err instanceof Errors_1.RepoCreateError) {
                res.status(400).json({
                    error: err.message,
                });
            }
            else {
                res.status(500).json({
                    error: err.message,
                });
            }
        }
    });
}
function routes(app) {
    const router = (0, express_1.Router)();
    router.route('/send').post(submissionHandler);
    app.use('/api-public/contact', router);
}
exports.routes = routes;
