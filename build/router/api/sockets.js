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
exports.routeSockets = void 0;
/**
 * Processes incoming socket messages
 */
const node_1 = __importDefault(require("@sentry/node"));
const express_session_1 = __importDefault(require("express-session"));
const newrelic_1 = __importDefault(require("newrelic"));
const passport_1 = __importDefault(require("passport"));
const redlock_1 = require("redlock");
const uuid_1 = require("uuid");
const cache = __importStar(require("../../cache"));
const config_1 = __importDefault(require("../../config"));
const constants_1 = require("../../constants");
const logger_1 = __importDefault(require("../../logger"));
const Session_1 = require("../../models/Session");
const SessionRepo = __importStar(require("../../models/Session/queries"));
const User_1 = require("../../models/User");
const AnalyticsService_1 = require("../../services/AnalyticsService");
const FeatureFlagService_1 = require("../../services/FeatureFlagService");
const QueueService_1 = __importDefault(require("../../services/QueueService"));
const QuillDocService = __importStar(require("../../services/QuillDocService"));
const SessionService = __importStar(require("../../services/SessionService"));
const SocketService_1 = __importDefault(require("../../services/SocketService"));
const chatbot_lookup_1 = require("../../utils/chatbot-lookup");
const get_session_room_1 = __importDefault(require("../../utils/get-session-room"));
const socket_utils_1 = require("../../utils/socket-utils");
const jobs_1 = require("../../worker/jobs");
const extract_user_1 = require("../extract-user");
// Taken from https://socket.io/docs/v4/server-socket-instance/#disconnect
const DISCONNECT_REASONS = {
    'server namespace disconnect': {
        isError: false,
        description: 'The socket was forcefully disconnected with socket.disconnect()',
    },
    'client namespace disconnect': {
        isError: false,
        description: 'The client has manually disconnected the socket using socket.disconnect()',
    },
    'server shutting down': {
        isError: false,
        description: 'The server is shutting down',
    },
    'ping timeout': {
        isError: false,
        description: 'The client did not send a PONG packet in the pingTimeout delay',
    },
    'transport close': {
        isError: false,
        description: 'The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)',
    },
    'transport error': {
        isError: true,
        description: 'The connection has encountered an error',
    },
    'parse error': {
        isError: true,
        description: 'The server has received an invalid packet from the client.',
    },
    'forced close': {
        isError: true,
        description: 'The server has received an invalid packet from the client.',
    },
    'forced server close': {
        isError: false,
        description: 'The client did not join a namespace in time (see the connectTimeout option) and was forcefully closed.',
    },
};
// Custom API key handlers
async function handleChatBot(socket, key) {
    logger_1.default.debug(`Attempted key: ${key}`);
    if (key !== config_1.default.socketApiKey)
        throw new Error('User not authenticated');
    logger_1.default.debug('Chatbot connected to socket!');
}
async function handleUser(socket, user) {
    // Join a user to their own room to handle the event where a user might have
    // multiple socket connections open
    socket.join(user.id.toString());
    const latestSession = await SessionService.currentSession(user.id);
    // Join user to their latest session if it has not ended
    if (latestSession && !latestSession.endedAt) {
        socket.join((0, get_session_room_1.default)(latestSession.id));
        socket.emit('session-change', latestSession);
    }
    if (user && user.isVolunteer)
        socket.join('volunteers');
}
function routeSockets(io, sessionStore) {
    const socketService = SocketService_1.default.getInstance();
    let chatbot;
    // Authentication middleware for sockets
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
    const sessionMiddleware = (0, express_session_1.default)({
        resave: false,
        saveUninitialized: false,
        secret: config_1.default.sessionSecret,
        store: sessionStore,
        cookie: {
            httpOnly: false,
            maxAge: config_1.default.sessionCookieMaxAge,
        },
    });
    async function joinUserToSessionHistoryRooms(io, userId) {
        const sessionHistory = await (0, Session_1.getSessionHistoryIdsByUserId)(userId);
        for (const session of sessionHistory) {
            const sessionRoom = (0, get_session_room_1.default)(session.id);
            const socketIds = await (0, socket_utils_1.getSocketIdsFromRoom)(io, userId);
            // Have all of the user's socket connections join session history rooms
            for (const id of socketIds) {
                await (0, socket_utils_1.remoteJoinRoom)(io, id, sessionRoom);
            }
        }
    }
    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport_1.default.initialize()));
    io.use(wrap(passport_1.default.session()));
    io.use((socket, next) => {
        if (socket.request.user || socket.handshake.query.key) {
            next();
        }
        else {
            next(new Error('unauthorized'));
        }
    });
    // TODO: handle transport close errors from worker socket disconnecting
    io.on('connection', async function (socket) {
        const { request: { user }, handshake: { query: { key: socketApiKey }, }, } = socket;
        if (user) {
            await handleUser(socket, user);
            const isRecapSocketUpdatesActive = await (0, FeatureFlagService_1.getRecapSocketUpdatesFeatureFlag)(user.id);
            if (!isRecapSocketUpdatesActive)
                await joinUserToSessionHistoryRooms(io, user.id);
        }
        else {
            if (!socketApiKey) {
                socket.emit('redirect');
                throw new Error('User not authenticated');
            }
        }
        if ((0, FeatureFlagService_1.isChatBotEnabled)()) {
            chatbot = await (0, chatbot_lookup_1.lookupChatbotFromCache)();
            if (!chatbot)
                logger_1.default.error(`Chatbot user not found`);
            else {
                // chatbot activity prompt handler
                socket.on('activity-prompt-sent', async function (data) {
                    newrelic_1.default.startWebTransaction('/socket-io/chatbot', () => new Promise(async (resolve, reject) => {
                        try {
                            const { sessionId } = data;
                            if (!sessionId)
                                throw new Error('SessionId not included in payload');
                            logger_1.default.debug('Acitivty prompt sent for session ', sessionId);
                            await cache.saveWithExpiration(`${constants_1.SESSION_ACTIVITY_KEY}-${sessionId}`, 'true', 60 * 45);
                            resolve();
                        }
                        catch (err) {
                            reject(err);
                        }
                    }));
                });
                // chatbot end session handler
                socket.on('auto-end-session', async function (data) {
                    newrelic_1.default.startWebTransaction('/socket-io/chatbot', () => new Promise(async (resolve, reject) => {
                        try {
                            const { sessionId } = data;
                            if (!sessionId)
                                throw new Error('SessionId not included in payload');
                            logger_1.default.debug('Chatbot ending session ', sessionId);
                            await SessionService.endSession(sessionId, null, true, socketService);
                            resolve();
                        }
                        catch (err) {
                            reject(err);
                        }
                    }));
                });
            }
        }
        // Tutor session management
        socket.on('join', async function (data) {
            newrelic_1.default.startWebTransaction('/socket-io/join', () => new Promise(async (resolve, reject) => {
                if (!data || !data.sessionId) {
                    socket.emit('redirect');
                    resolve();
                    return;
                }
                const { sessionId, joinedFrom } = data;
                const user = (0, extract_user_1.extractSocketUser)(socket);
                let session;
                try {
                    // TODO: have middleware handle the auth
                    if (!user)
                        throw new Error('User not authenticated');
                    if (user.isVolunteer && !user.approved)
                        throw new Error('Volunteer not approved');
                    session = await SessionRepo.getSessionById(sessionId);
                }
                catch (error) {
                    socket.emit('redirect');
                    reject(error);
                    return;
                }
                try {
                    // TODO: correctly type User from passport
                    await SessionService.joinSession(user, session, {
                        socket,
                        joinedFrom,
                    });
                    const sessionRoom = (0, get_session_room_1.default)(sessionId);
                    const socketIds = await (0, socket_utils_1.getSocketIdsFromRoom)(io, user.id);
                    // Have all of the user's socket connections join the tutoring session room
                    for (const id of socketIds) {
                        await (0, socket_utils_1.remoteJoinRoom)(io, id, sessionRoom);
                    }
                    await socketService.emitSessionChange(sessionId);
                    resolve();
                }
                catch (error) {
                    socketService.bump(socket, {
                        endedAt: session.endedAt,
                        volunteer: session.volunteerId,
                        student: session.studentId,
                        sessionId: session.id,
                        userId: user.id,
                    }, error);
                    resolve();
                }
            }));
        });
        socket.on('sessions/recap:join', async function (data) {
            newrelic_1.default.startWebTransaction('/socket-io/sessions/recap:join', () => new Promise(async (resolve, reject) => {
                if (!data || !data.sessionId) {
                    socket.emit('redirect');
                    resolve();
                    return;
                }
                const { sessionId } = data;
                const user = (0, extract_user_1.extractSocketUser)(socket);
                try {
                    const session = await SessionRepo.getSessionById(sessionId);
                    if (user.id !== session.studentId &&
                        user.id !== session.volunteerId)
                        throw new Error('Not a session participant');
                }
                catch (error) {
                    socket.emit('redirect', error);
                    resolve();
                    return;
                }
                try {
                    const sessionRoom = (0, get_session_room_1.default)(sessionId);
                    await (0, socket_utils_1.remoteJoinRoom)(io, socket.id, sessionRoom);
                    socket.emit('sessions/recap:joined');
                }
                catch (error) {
                    socket.emit('sessions/recap:join-failed', error);
                }
                finally {
                    resolve();
                }
            }));
        });
        socket.on('list', (_data, callback) => {
            newrelic_1.default.startWebTransaction('/socket-io/list', () => new Promise(async (resolve, reject) => {
                try {
                    const sessions = await SessionRepo.getUnfulfilledSessions();
                    socket.emit('sessions', sessions);
                    callback({
                        status: 200,
                        sessions,
                    });
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
        socket.on('typing', data => {
            newrelic_1.default.startWebTransaction('/socket-io/typing', () => {
                socket
                    .to((0, get_session_room_1.default)(data.sessionId))
                    .emit('is-typing', { sessionId: data.sessionId });
            });
        });
        socket.on('notTyping', data => {
            newrelic_1.default.startWebTransaction('/socket-io/notTyping', () => {
                socket
                    .to((0, get_session_room_1.default)(data.sessionId))
                    .emit('not-typing', { sessionId: data.sessionId });
            });
        });
        socket.on('message', async (data) => {
            newrelic_1.default.startWebTransaction('/socket-io/message', () => new Promise(async (resolve, reject) => {
                const { user, sessionId, message, source } = data;
                newrelic_1.default.addCustomAttribute('sessionId', sessionId);
                // Do not allow banned users to send DMs
                const dbUser = await (0, User_1.getUserContactInfoById)(user.id);
                if (source === 'recap' && (dbUser === null || dbUser === void 0 ? void 0 : dbUser.banned))
                    return resolve();
                // TODO: handle this differently?
                if (!sessionId) {
                    return resolve();
                }
                const createdAt = new Date();
                try {
                    // TODO: correctly type user from payload
                    const messageId = await SessionService.saveMessage(user, createdAt, {
                        sessionId,
                        message,
                    }, chatbot);
                    if (chatbot && !(chatbot === user.id))
                        await SessionService.handleMessageActivity(sessionId);
                    const messageData = {
                        contents: message,
                        createdAt: createdAt,
                        isVolunteer: user.isVolunteer,
                        user: user.id,
                        sessionId,
                    };
                    // If the message is coming from the recap page, queue the message to send a notification
                    if (source === 'recap') {
                        await QueueService_1.default.add(jobs_1.Jobs.SendSessionRecapMessageNotification, { messageId }, { removeOnComplete: true, removeOnFail: true });
                        (0, AnalyticsService_1.captureEvent)(user.id, constants_1.EVENTS.USER_SUBMITTED_SESSION_RECAP_DM, {
                            sessionId: sessionId,
                            message,
                            isVolunteer: user.isVolunteer,
                        });
                    }
                    const socketRoom = (0, get_session_room_1.default)(data.sessionId);
                    io.in(socketRoom).emit('messageSend', messageData);
                    resolve();
                }
                catch (error) {
                    socket.emit('messageError', { sessionId: data.session });
                    reject(error);
                }
            }));
        });
        socket.on('requestQuillState', async ({ sessionId }) => {
            newrelic_1.default.startWebTransaction('/socket-io/requestQuillState', () => new Promise(async (resolve, reject) => {
                try {
                    const quillState = await QuillDocService.lockAndGetDocCacheState(sessionId);
                    let doc = quillState === null || quillState === void 0 ? void 0 : quillState.doc;
                    if (quillState === null || quillState === void 0 ? void 0 : quillState.lastDeltaStored)
                        socket.emit('lastDeltaStored', {
                            delta: quillState.lastDeltaStored,
                        });
                    else if (!doc)
                        doc = await QuillDocService.createDoc(sessionId);
                    socket.emit('quillState', {
                        delta: doc,
                    });
                    resolve();
                }
                catch (error) {
                    if (error instanceof redlock_1.LockError)
                        socket.emit('retryLoadingDoc');
                    else
                        reject(error);
                }
            }));
        });
        socket.on('requestQuillStateV2', async ({ sessionId }) => {
            newrelic_1.default.startWebTransaction('/socket-io/requestQuillStateV2', async () => {
                const updates = await QuillDocService.getDocumentUpdates(sessionId);
                socket.emit('quillStateV2', { updates });
            });
        });
        socket.on('transmitQuillDeltaV2', async ({ sessionId, update }) => {
            newrelic_1.default.startWebTransaction('/socket-io/transmitQuillDeltaV2', async () => {
                await QuillDocService.addDocumentUpdate(sessionId, update);
                socket
                    .to((0, get_session_room_1.default)(sessionId))
                    .emit('partnerQuillDeltaV2', { update });
            });
        });
        socket.on('transmitQuillDelta', async ({ sessionId, delta }) => {
            newrelic_1.default.startWebTransaction('/socket-io/transmitQuillDelta', () => new Promise(async (resolve, reject) => {
                /**
                 *
                 * Add a unique ID to each delta. This allows for the client to determine
                 * which deltas are which when it is queueing incoming deltas.
                 *
                 * The IDs are ignored when a delta is instantiated with `new Delta(delta)`
                 * or when a quill doc is composed
                 *
                 */
                delta.id = (0, uuid_1.v4)();
                await QuillDocService.appendToDoc(sessionId, delta);
                socket.to((0, get_session_room_1.default)(sessionId)).emit('partnerQuillDelta', {
                    delta,
                });
                return resolve();
            }));
        });
        socket.on('transmitQuillSelection', async ({ sessionId, range }) => {
            newrelic_1.default.startWebTransaction('/socket-io/transmitQuillSelection', () => {
                socket.to((0, get_session_room_1.default)(sessionId)).emit('quillPartnerSelection', {
                    range,
                });
            });
        });
        socket.on('error', function (error) {
            newrelic_1.default.startWebTransaction('/socket-io/error', () => {
                logger_1.default.error(`Socket error: ${error}`);
                node_1.default.captureException(error);
            });
        });
        socket.on('resetWhiteboard', async ({ sessionId }) => {
            newrelic_1.default.startWebTransaction('/socket-io/resetWhiteboard', () => {
                socket.to((0, get_session_room_1.default)(sessionId)).emit('resetWhiteboard');
            });
        });
        socket.on('progress-report:processed', async ({ userId, sessionId, subject, report }) => {
            newrelic_1.default.startWebTransaction('/socket-io/progress-report:processed', () => {
                logger_1.default.info(`Socket event progress-report:processed received for user ${userId} for session ${sessionId}`);
                socketService.emitProgressReportProcessedToUser(userId, {
                    sessionId,
                    subject,
                    report,
                });
            });
        });
        socket.on('disconnect', (reason) => {
            var _a;
            const message = `Socket disconnected: %o`;
            const { isError, description } = DISCONNECT_REASONS[reason];
            const logData = {
                user: (_a = socket.request.user) === null || _a === void 0 ? void 0 : _a.id,
                reason,
                description,
            };
            isError ? logger_1.default.error(message, logData) : logger_1.default.info(message, logData);
        });
    });
}
exports.routeSockets = routeSockets;
