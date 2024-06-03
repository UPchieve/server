"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageControlFlow = exports.MESSAGE_TYPING_DELAY = void 0;
const queries_1 = require("../../../models/Session/queries");
const sockets_1 = require("../../sockets");
const logger_1 = require("../../logger");
const safe_async_1 = require("../../../utils/safe-async");
const messages_1 = require("./messages");
const type_utils_1 = require("../../../utils/type-utils");
const promises_1 = require("timers/promises");
const chatbot_lookup_1 = require("../../../utils/chatbot-lookup");
exports.MESSAGE_TYPING_DELAY = 3 * 1000;
async function sendMessage(sessionId, content, chatbot, delay) {
    const socket = (0, sockets_1.getSocket)();
    socket.emit('typing', { sessionId });
    await (0, promises_1.setTimeout)(delay);
    socket.emit('notTyping', { sessionId });
    socket.emit('message', {
        // socket message handler expects a FRONTEND user-like object
        user: { _id: chatbot, isVolunteer: true },
        sessionId,
        message: content,
    });
}
// Param 'messageDelay' included so test can provide a shorter delay to improve their runtime
async function messageControlFlow(session, chatbot, chatbotMessages, messageDelay) {
    const errors = [];
    const messagesToSend = [];
    const actions = [];
    for (const msg of chatbotMessages) {
        const result = await (0, safe_async_1.safeAsync)(msg.requirements(session, chatbot));
        if (result.result) {
            messagesToSend.push(msg.content(session));
            if (msg.action)
                actions.push(async () => await msg.action(session));
            (0, logger_1.log)(`Planning to send message ${msg.key} to session ${session.id}`);
        }
        else if (result.error)
            errors.push(result.error.message);
    }
    // TODO: should sending these be more transactional? Messages should still be sent in order
    for (const msg of messagesToSend) {
        const result = await (0, safe_async_1.safeAsync)(sendMessage(session.id, msg, chatbot, messageDelay));
        if (result.error)
            errors.push(result.error.message);
    }
    // execute actions
    for (const action of actions) {
        const result = await (0, safe_async_1.safeAsync)(action());
        if (result.error)
            errors.push(result.error.message);
    }
    if (errors.length) {
        throw new Error(`Error while sending chatbot messages: ${errors.join('\n')}`);
    }
}
exports.messageControlFlow = messageControlFlow;
async function chatbot(job) {
    const sessionId = (0, type_utils_1.asString)(job.data.sessionId);
    const chatbotId = await (0, chatbot_lookup_1.lookupChatbotFromCache)();
    if (!chatbot)
        throw new Error('Chatbot user not found!');
    // replaced by getSessionForChatbot
    const session = await (0, queries_1.getSessionForChatbot)(sessionId);
    if (!session)
        throw new Error(`Session ${sessionId} not found`);
    await messageControlFlow(session, chatbotId, messages_1.MESSAGES, exports.MESSAGE_TYPING_DELAY);
}
exports.default = chatbot;
