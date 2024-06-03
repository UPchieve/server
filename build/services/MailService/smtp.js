"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactFormEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const config_1 = __importDefault(require("../../config"));
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.smtp.host,
    port: config_1.default.smtp.port,
    secure: config_1.default.smtp.secure,
    auth: {
        user: config_1.default.smtp.user,
        pass: config_1.default.smtp.password,
    },
});
transporter.use('compile', (0, nodemailer_express_handlebars_1.default)({
    viewEngine: express_handlebars_1.default.create({
        layoutsDir: `${__dirname}/views`,
        extname: '.hbs',
    }),
    viewPath: `${__dirname}/views`,
    extName: '.hbs',
}));
async function sendContactFormEmail(context) {
    const mail = {
        from: `UPchieve ${config_1.default.mail.senders.noreply}`,
        sender: config_1.default.mail.senders.noreply,
        replyTo: config_1.default.mail.senders.noreply,
        to: config_1.default.mail.receivers.contact,
        subject: 'New contact form submission',
        template: 'ContactUs',
        context,
    };
    try {
        return transporter.sendMail(mail);
    }
    catch (err) {
        throw err;
    }
}
exports.sendContactFormEmail = sendContactFormEmail;
