"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGES = exports.m9 = exports.m8 = exports.m7 = exports.m6 = exports.m5 = exports.m4 = exports.m3c = exports.m3b = exports.m3a = exports.m2 = exports.m1 = exports.autoEndSession = exports.updateActivityStatus = exports.WAIT_FOR_REPLY = exports.WAIT_FOR_MATCH = void 0;
const moment_1 = __importDefault(require("moment"));
const sockets_1 = require("../../sockets");
const constants_1 = require("../../../constants");
const QueueService_1 = __importDefault(require("../../../services/QueueService"));
const index_1 = require("../index");
const session_utils_1 = require("../../../utils/session-utils");
const SessionService_1 = require("../../../services/SessionService");
const config_1 = __importDefault(require("../../../config"));
const ONE_MINUTE = 1 * 60 * 1000;
exports.WAIT_FOR_MATCH = 10 * ONE_MINUTE;
exports.WAIT_FOR_REPLY = 3 * ONE_MINUTE;
const socket = (0, sockets_1.getSocket)();
async function textMoreVolunteers(sessionId) {
    // ignore the initial delay on the notification schedule and notify tutors ASAP
    const notificationSchedule = config_1.default.notificationSchedule.slice(1);
    await QueueService_1.default.add(index_1.Jobs.NotifyTutors, { sessionId, notificationSchedule }, {
        removeOnComplete: true,
        removeOnFail: true,
    });
}
async function updateActivityStatus(sessionId) {
    socket.emit('activity-prompt-sent', { sessionId });
}
exports.updateActivityStatus = updateActivityStatus;
async function autoEndSession(sessionId) {
    socket.emit('auto-end-session', { sessionId });
}
exports.autoEndSession = autoEndSession;
function chatbotSentMessage(session, chatbot) {
    return session.messages.some(msg => chatbot === msg.user);
}
function lastChatbotMessage(session, chatbot) {
    return session.messages
        .filter(msg => msg.user === chatbot)
        .sort((x, y) => (x.createdAt > y.createdAt ? 1 : 0))
        .slice(-1)[0];
}
exports.m1 = {
    key: 'M1',
    content: (session) => `Hey ${session.studentFirstName}! I’m the UPchieve Bot.`,
    requirements: async (session, chatbot) => !session.volunteerJoinedAt &&
        !session.endedAt &&
        !chatbotSentMessage(session, chatbot),
};
exports.m2 = {
    key: 'M2',
    content: () => 'Right now, we’re searching for a live coach to pair you with. This process should take 5-10 minutes, so please be patient!',
    requirements: async (session, chatbot) => !session.volunteerJoinedAt &&
        !session.endedAt &&
        !chatbotSentMessage(session, chatbot),
};
exports.m3a = {
    key: 'M3A',
    content: () => `To save time, please respond to the questions below in the chat and copy and paste what you’re working on into the document editor.\n
  ❓ What do you need help with today?\n
  💡 What do you think you should do first?`,
    requirements: async (session, chatbot) => !session.volunteerJoinedAt &&
        !session.endedAt &&
        !chatbotSentMessage(session, chatbot) &&
        session.topic !== constants_1.SUBJECT_TYPES.COLLEGE &&
        (0, session_utils_1.isSubjectUsingDocumentEditor)(session.toolType),
    action: async (session) => {
        await QueueService_1.default.add(index_1.Jobs.Chatbot, { sessionId: session.id }, { delay: exports.WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true });
    },
};
exports.m3b = {
    key: 'M3B',
    content: () => `To save time, please respond to the questions below in the chat and upload any photos or write out problems on the whiteboard.\n
  ❓ What do you need help with today?\n
  💡 What do you think the first step is?`,
    requirements: async (session, chatbot) => !session.volunteerJoinedAt &&
        !session.endedAt &&
        !chatbotSentMessage(session, chatbot) &&
        !(0, session_utils_1.isSubjectUsingDocumentEditor)(session.toolType),
    action: async (session) => {
        await QueueService_1.default.add(index_1.Jobs.Chatbot, { sessionId: session.id }, { delay: exports.WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true });
    },
};
exports.m3c = {
    key: 'M3C',
    content: () => `To save time, please respond to the questions below in the chat and if it makes sense, copy and paste what you’re working on into the document editor.\n
  ❓ What do you hope to accomplish today?\n
  💡 Where do you think we should start?`,
    requirements: async (session, chatbot) => !session.volunteerJoinedAt &&
        !session.endedAt &&
        !chatbotSentMessage(session, chatbot) &&
        session.topic === constants_1.SUBJECT_TYPES.COLLEGE,
    action: async (session) => {
        await QueueService_1.default.add(index_1.Jobs.Chatbot, { sessionId: session.id }, { delay: exports.WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true });
    },
};
exports.m4 = {
    key: 'M4',
    content: () => `We’re having trouble finding a coach. 😞 Please reply in the chat if we should keep looking  👀 or end the session if you’d rather come back later.`,
    requirements: async (session, chatbot) => {
        const lastChatbotMsg = lastChatbotMessage(session, chatbot);
        return (!session.volunteerJoinedAt &&
            !session.endedAt &&
            !!lastChatbotMsg &&
            (await (0, SessionService_1.volunteersAvailableForSession)(session.id, session.subject)) &&
            (0, moment_1.default)().subtract(exports.WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
                (0, moment_1.default)(lastChatbotMsg.createdAt) &&
            (lastChatbotMsg.contents === exports.m3a.content() ||
                lastChatbotMsg.contents === exports.m3b.content() ||
                lastChatbotMsg.contents === exports.m3c.content()));
    },
    action: async (session) => {
        await updateActivityStatus(session.id);
        await QueueService_1.default.add(index_1.Jobs.Chatbot, { sessionId: session.id }, { delay: exports.WAIT_FOR_REPLY, removeOnComplete: true, removeOnFail: true });
    },
};
exports.m5 = {
    key: 'M5',
    content: () => `Great! We’re reaching out to more volunteers.  Please give us another 5-10 minutes to see what we can do!`,
    requirements: async (session, chatbot) => {
        const lastChatbotMsg = lastChatbotMessage(session, chatbot);
        return (!session.volunteerJoinedAt &&
            !session.endedAt &&
            !!lastChatbotMsg &&
            lastChatbotMsg.contents === exports.m4.content() &&
            session.messages.some(msg => msg.createdAt > lastChatbotMsg.createdAt &&
                session.student === msg.user));
    },
    action: async (session) => {
        await QueueService_1.default.add(index_1.Jobs.Chatbot, { sessionId: session.id }, { delay: exports.WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true });
        await textMoreVolunteers(session.id);
    },
};
exports.m6 = {
    key: 'M6',
    content: () => `So, it’s been 10 minutes and we still can’t find a coach. 😳 Reply in the chat if you want us to give it one last try, and we’ll keep searching! 🕵🏿‍♀️`,
    requirements: async (session, chatbot) => {
        const lastChatbotMsg = lastChatbotMessage(session, chatbot);
        return (!session.volunteerJoinedAt &&
            !session.endedAt &&
            !!lastChatbotMsg &&
            (await (0, SessionService_1.volunteersAvailableForSession)(session.id, session.subject)) &&
            (0, moment_1.default)().subtract(exports.WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
                (0, moment_1.default)(lastChatbotMsg.createdAt) &&
            lastChatbotMsg.contents === exports.m5.content());
    },
    action: async (session) => {
        await updateActivityStatus(session.id);
        await QueueService_1.default.add(index_1.Jobs.Chatbot, { sessionId: session.id }, { delay: exports.WAIT_FOR_REPLY, removeOnComplete: true, removeOnFail: true });
    },
};
exports.m7 = {
    key: 'M7',
    content: () => `Search initiated! 5-10 more minutes please to see what we can do 🙏`,
    requirements: async (session, chatbot) => {
        const lastChatbotMsg = lastChatbotMessage(session, chatbot);
        return (!session.volunteerJoinedAt &&
            !session.endedAt &&
            !!lastChatbotMsg &&
            lastChatbotMsg.contents === exports.m6.content() &&
            session.messages.some(msg => msg.createdAt > lastChatbotMsg.createdAt &&
                session.student === msg.user));
    },
    action: async (session) => {
        await QueueService_1.default.add(index_1.Jobs.Chatbot, { sessionId: session.id }, { delay: exports.WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true });
        await textMoreVolunteers(session.id);
    },
};
exports.m8 = {
    key: 'M8',
    content: () => `We can’t seem to find a coach for you right now. 😭 Please come back and try again soon—we promise this almost never happens! (tip: if you answered the questions about what you need help with, copy your answer before you go so you can paste it in your next session).`,
    requirements: async (session, chatbot) => {
        const chatbotMessages = session.messages
            .filter(msg => msg.user === chatbot)
            .sort((x, y) => (x.createdAt > y.createdAt ? 1 : 0));
        const lastChatbotMsg = chatbotMessages.slice(-1)[0];
        return (!session.volunteerJoinedAt &&
            !session.endedAt &&
            !!lastChatbotMsg &&
            (0, moment_1.default)().subtract(exports.WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
                (0, moment_1.default)(lastChatbotMsg.createdAt) &&
            (lastChatbotMsg.contents === exports.m7.content() ||
                ([exports.m3a.content(), exports.m3b.content(), exports.m3c.content()].some(content => content === lastChatbotMsg.contents) &&
                    !(await (0, SessionService_1.volunteersAvailableForSession)(session.id, session.subject)))));
    },
    action: async (session) => {
        await autoEndSession(session.id);
    },
};
exports.m9 = {
    key: 'M9',
    content: () => `Hmm, it doesn’t seem like you’re here anymore. We’ve ended the session for now, but if you come back and still need help, please feel free to request a new session on the dashboard (tip: if you answered the questions about what you need help with, copy your answer before you go so you can paste it in your next session.)`,
    requirements: async (session, chatbot) => {
        // sort in reverse order so array.find returns the last instance
        const messages = session.messages.sort((x, y) => x.createdAt < y.createdAt ? 1 : -1);
        const lastPromptMsg = messages.find(msg => msg.contents === exports.m4.content() || msg.contents === exports.m6.content());
        return (!!lastPromptMsg &&
            (0, moment_1.default)().subtract(exports.WAIT_FOR_REPLY - ONE_MINUTE, 'milliseconds') >=
                (0, moment_1.default)(lastPromptMsg.createdAt) &&
            !session.messages.some(msg => msg.createdAt > lastPromptMsg.createdAt &&
                session.student === msg.user));
    },
    action: async (session) => {
        await autoEndSession(session.id);
    },
};
exports.MESSAGES = [
    exports.m1,
    exports.m2,
    exports.m3a,
    exports.m3b,
    exports.m3c,
    exports.m4,
    exports.m5,
    exports.m6,
    exports.m7,
    exports.m8,
    exports.m9,
];
