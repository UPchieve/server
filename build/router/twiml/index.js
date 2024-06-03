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
const express_1 = require("express");
const twilio_1 = __importDefault(require("twilio"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../../logger"));
const twilioService = __importStar(require("../../services/TwilioService"));
const res_error_1 = require("../res-error");
const UserAction_1 = require("../../models/UserAction");
const constants_1 = require("../../constants");
const Volunteer_1 = require("../../models/Volunteer");
function routes(app) {
    const router = (0, express_1.Router)();
    // This route is called by Twilio to receive TwiML instructions for
    // voice calls. The Twilio API for voice calling requires that a URL be
    // specified to obtain the TwiML code it needs to generate the voice message.
    // In order to put our message content into a voice call we give Twilio
    // a URL pointing to our own server, which contains the message text encoded
    // in it. When the call is answered, Twilio sends a request to this
    // URL, and our server responds with TwiML containing the decoded message text
    // and the configured voice for the text-to-speech conversion.
    router.post('/message/:message', function (req, res) {
        try {
            const message = decodeURIComponent(req.params.message);
            logger_1.default.info('Making TwiML for voice message');
            const twiml = new twilio_1.default.twiml.VoiceResponse();
            twiml.say({ voice: config_1.default.voice }, message);
            res.type('text/xml');
            res.send(twiml.toString());
        }
        catch (err) {
            // TODO: should we bother replying to twilio?
            (0, res_error_1.resError)(res, err);
        }
    });
    /**
     * This route handles SMS messages sent to our Twilio numbers
     */
    router.post('/incoming-sms', async function (req, res, next) {
        const twiml = new twilio_1.default.twiml.MessagingResponse();
        // TODO: duck type validation
        const incomingMessage = req.body.Body;
        const incomingPhoneNumber = req.body.From;
        let session;
        if (!incomingPhoneNumber)
            return res.status(422).json({ err: 'Error: Missing phone number' });
        /**
         * If a volunteer responds "Yes" to a text notification, send
         * them a link to the session that they were notified about.
         */
        const yesRegex = /\b(yes|yeah|yea|yess|yesss|ye|ya|yaa|yee|y|yeh|yah|sure)\b/gim;
        const isYesMessage = !!incomingMessage.match(yesRegex);
        if (isYesMessage) {
            try {
                /**
                 * 1. Find the user by their phone number
                 * 2. Populate their most recent notification
                 * 3. Populate that notification's session
                 */
                session = await (0, Volunteer_1.getVolunteerForTextResponse)(incomingPhoneNumber);
                if (!session) {
                    logger_1.default.error(`User not found for phone number: ${incomingMessage}. Not acknologing phone reply`);
                    return;
                }
                if (!session.sessionId) {
                    // Handle: No session found
                    twiml.message('Error: No session found. You can try joining the session from the dashboard at app.upchieve.org');
                }
                else if (session.volunteerJoinedAt) {
                    // Handle: Different volunteer already joined
                    twiml.message('A volunteer has already joined this session');
                }
                else if (session.endedAt) {
                    // Handle: Student already ended the session
                    twiml.message('The student has cancelled their help request');
                }
                else {
                    // Handle: No issues, so send the session URL
                    const sessionUrl = twilioService.getSessionUrl({
                        subject: session.subject,
                        topic: session.topic,
                        id: session.sessionId,
                    });
                    twiml.message(sessionUrl);
                }
            }
            catch (err) {
                return next(err);
            }
        }
        else {
            // Handle: Unknown message intent
            twiml.message("Hmm, I don't understand. Please send questions to contact@upchieve.org");
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        if (isYesMessage && session) {
            await (0, UserAction_1.createSessionAction)({
                userId: session.volunteerId,
                sessionId: session.sessionId,
                action: constants_1.SESSION_USER_ACTIONS.REPLIED_YES,
            });
        }
    });
    app.use('/twiml', router);
}
exports.routes = routes;
