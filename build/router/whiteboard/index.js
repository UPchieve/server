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
const Sentry = __importStar(require("@sentry/node"));
const express_1 = __importDefault(require("express"));
const cache_1 = require("../../cache");
const logger_1 = __importDefault(require("../../logger"));
const WebSocketEmitterService_1 = require("../../services/WebSocketEmitterService");
const WhiteboardService = __importStar(require("../../services/WhiteboardService"));
const type_utils_1 = require("../../utils/type-utils");
const zwibblerDecoder_1 = require("../../utils/zwibblerDecoder");
const captureUnimplemented = (sessionId, messageType) => {
    Sentry.captureMessage(`Unimplemented Zwibbler message type ${messageType} called in session ${sessionId}`);
};
const whiteboardChannel = 'whiteboard/';
const wsEmitter = new WebSocketEmitterService_1.WebSocketEmitter(whiteboardChannel, { encoder: zwibblerDecoder_1.encode });
const messageHandlers = {
    [zwibblerDecoder_1.MessageType.INIT]: async ({ message, sessionId, wsClient }) => {
        const sessionObjectId = (0, type_utils_1.asUlid)(sessionId);
        let document;
        try {
            document = await WhiteboardService.getDoc(sessionObjectId);
        }
        catch (error) {
            if (!(error instanceof cache_1.KeyNotFoundError))
                throw error;
        }
        if (message.creationMode === zwibblerDecoder_1.CreationMode.NEVER_CREATE && !document) {
            return wsClient.send((0, zwibblerDecoder_1.encode)({
                messageType: zwibblerDecoder_1.MessageType.ERROR,
                errorCode: zwibblerDecoder_1.DecodeError.DOES_NOT_EXIST,
                more: 0,
                description: 'does not exist',
            }));
        }
        if (message.creationMode === zwibblerDecoder_1.CreationMode.ALWAYS_CREATE && !document) {
            return wsClient.send((0, zwibblerDecoder_1.encode)({
                messageType: zwibblerDecoder_1.MessageType.ERROR,
                errorCode: zwibblerDecoder_1.DecodeError.ALREADY_EXISTS,
                more: 0,
                description: 'already exists',
            }));
        }
        if ((message.creationMode === zwibblerDecoder_1.CreationMode.ALWAYS_CREATE ||
            message.creationMode === zwibblerDecoder_1.CreationMode.POSSIBLY_CREATE) &&
            !document) {
            await WhiteboardService.createDoc(sessionObjectId);
            if (message.data)
                await WhiteboardService.appendToDoc(sessionObjectId, message.data);
            const docLength = await WhiteboardService.getDocLength(sessionObjectId);
            return wsClient.send((0, zwibblerDecoder_1.encode)({
                messageType: zwibblerDecoder_1.MessageType.APPEND,
                offset: docLength,
                data: '',
                more: 0,
            }));
        }
        return wsClient.send((0, zwibblerDecoder_1.encode)({
            messageType: zwibblerDecoder_1.MessageType.APPEND,
            offset: 0,
            data: document,
            more: 0,
        }));
    },
    [zwibblerDecoder_1.MessageType.APPEND]: async ({ message, sessionId, wsClient }) => {
        const sessionObjectId = (0, type_utils_1.asUlid)(sessionId);
        const documentLength = await WhiteboardService.getDocLength(sessionObjectId);
        if (message.offset !== documentLength) {
            return wsClient.send((0, zwibblerDecoder_1.encode)({
                messageType: zwibblerDecoder_1.MessageType.ACK_NACK,
                ack: 0,
                offset: documentLength,
                more: 0,
            }));
        }
        await WhiteboardService.appendToDoc(sessionObjectId, message.data);
        const newDocLength = await WhiteboardService.getDocLength(sessionObjectId);
        // Ack unless this is the beginning of a continuation
        if (!message.more) {
            wsClient.send((0, zwibblerDecoder_1.encode)({
                messageType: zwibblerDecoder_1.MessageType.ACK_NACK,
                ack: 1,
                offset: newDocLength,
                more: 0,
            }));
        }
        const packet = {
            socketId: wsClient.id,
            message: {
                messageType: zwibblerDecoder_1.MessageType.APPEND,
                offset: documentLength,
                data: message.data,
                more: message.more,
            },
        };
        wsEmitter.broadcast(sessionId, packet);
    },
    [zwibblerDecoder_1.MessageType.SET_KEY]: ({ wsClient, sessionId }) => {
        captureUnimplemented(sessionId, 'SET_KEY');
        wsClient.send((0, zwibblerDecoder_1.encode)({
            messageType: zwibblerDecoder_1.MessageType.ERROR,
            description: 'not implemented',
            errorCode: zwibblerDecoder_1.DecodeError.UNIMPLEMENTED_ERROR,
            more: 0,
        }));
    },
    [zwibblerDecoder_1.MessageType.BROADCAST]: ({ wsClient, sessionId }) => {
        captureUnimplemented(sessionId, 'BROADCAST');
        wsClient.send((0, zwibblerDecoder_1.encode)({
            messageType: zwibblerDecoder_1.MessageType.ERROR,
            description: 'not implemented',
            errorCode: zwibblerDecoder_1.DecodeError.UNIMPLEMENTED_ERROR,
            more: 0,
        }));
    },
    [zwibblerDecoder_1.MessageType.ERROR]: ({ wsClient, sessionId }) => {
        captureUnimplemented(sessionId, 'ERROR');
        wsClient.send((0, zwibblerDecoder_1.encode)({
            messageType: zwibblerDecoder_1.MessageType.ERROR,
            description: 'not implemented',
            errorCode: zwibblerDecoder_1.DecodeError.UNIMPLEMENTED_ERROR,
            more: 0,
        }));
    },
    [zwibblerDecoder_1.MessageType.ACK_NACK]: ({ wsClient, sessionId }) => {
        captureUnimplemented(sessionId, 'ACK_NACK');
        wsClient.send((0, zwibblerDecoder_1.encode)({
            messageType: zwibblerDecoder_1.MessageType.ERROR,
            description: 'not implemented',
            errorCode: zwibblerDecoder_1.DecodeError.UNIMPLEMENTED_ERROR,
            more: 0,
        }));
    },
    [zwibblerDecoder_1.MessageType.KEY_INFORMATION]: ({ wsClient, sessionId }) => {
        captureUnimplemented(sessionId, 'KEY_INFORMATION');
        wsClient.send((0, zwibblerDecoder_1.encode)({
            messageType: zwibblerDecoder_1.MessageType.ERROR,
            description: 'not implemented',
            errorCode: zwibblerDecoder_1.DecodeError.UNIMPLEMENTED_ERROR,
            more: 0,
        }));
    },
    [zwibblerDecoder_1.MessageType.SET_KEY_ACK_NACK]: ({ wsClient, sessionId }) => {
        captureUnimplemented(sessionId, 'SET_KEY_ACK_NACK');
        wsClient.send((0, zwibblerDecoder_1.encode)({
            messageType: zwibblerDecoder_1.MessageType.ERROR,
            description: 'not implemented',
            errorCode: zwibblerDecoder_1.DecodeError.UNIMPLEMENTED_ERROR,
            more: 0,
        }));
    },
    [zwibblerDecoder_1.MessageType.CONTINUATION]: async ({ message, wsClient, sessionId }) => {
        const sessionObjectId = (0, type_utils_1.asUlid)(sessionId);
        await WhiteboardService.appendToDoc(sessionObjectId, message.data);
        const newDocLength = await WhiteboardService.getDocLength(sessionObjectId);
        const packet = {
            socketId: wsClient.id,
            message: {
                messageType: zwibblerDecoder_1.MessageType.CONTINUATION,
                data: message.data,
                more: message.more,
            },
        };
        wsEmitter.broadcast(sessionId, packet);
        // Ack if this is the end of a continuation
        if (!message.more) {
            wsClient.send((0, zwibblerDecoder_1.encode)({
                messageType: zwibblerDecoder_1.MessageType.ACK_NACK,
                ack: 1,
                offset: newDocLength,
                more: 0,
            }));
        }
    },
};
function routes(app) {
    const router = express_1.default.Router();
    router.ws('/room/:sessionId', function (wsClient, req, next) {
        let initialized = false;
        let sessionId;
        try {
            // use string here for socket room
            sessionId = (0, type_utils_1.asUlid)(req.params.sessionId);
        }
        catch (error) {
            logger_1.default.error(error);
            return;
        }
        wsEmitter.addClientToRoom(wsClient, sessionId);
        setTimeout(() => {
            if (!initialized) {
                console.log(`closing whiteboard socket connection for session ${sessionId}`);
                wsClient.close();
            }
        }, 30 * 1000);
        // Remove the websocket client from the room upon closing
        wsClient.on('close', () => {
            wsEmitter.removeClientFromRoom(wsClient, sessionId);
        });
        wsClient.on('message', rawMessage => {
            if (rawMessage === 'p1ng') {
                // Respond to ping and exit early
                wsClient.send('p0ng');
                return;
            }
            let message = (0, zwibblerDecoder_1.decode)(rawMessage);
            if (!message || !message.messageType) {
                console.log(`unsupported zwibbler client in session ${sessionId}`);
                message = {
                    messageType: zwibblerDecoder_1.MessageType.ERROR,
                };
            }
            if (message.messageType === zwibblerDecoder_1.MessageType.INIT)
                initialized = true;
            messageHandlers[message.messageType]
                ? messageHandlers[message.messageType]({
                    message,
                    sessionId,
                    wsClient,
                })
                : wsClient.send({ error: 'unsupported message type' });
        });
        next();
    });
    router.ws('/admin/:sessionId', function (wsClient, req) {
        const sessionId = (0, type_utils_1.asUlid)(req.params.sessionId);
        wsClient.on('message', async (rawMessage) => {
            const message = (0, zwibblerDecoder_1.decode)(rawMessage);
            if (message.messageType === zwibblerDecoder_1.MessageType.INIT) {
                try {
                    // Active session's document
                    let document;
                    try {
                        document = await WhiteboardService.getDoc((0, type_utils_1.asUlid)(sessionId));
                    }
                    catch (err) {
                        if (!(err instanceof cache_1.KeyNotFoundError))
                            throw err;
                    }
                    // Get the completed session's whiteboard document from storage
                    if (!document)
                        document = await WhiteboardService.getDocFromStorage(sessionId);
                    return wsClient.send((0, zwibblerDecoder_1.encode)({
                        messageType: zwibblerDecoder_1.MessageType.APPEND,
                        offset: 0,
                        data: document,
                        more: 0,
                    }));
                }
                catch (error) {
                    if (!(error instanceof cache_1.KeyNotFoundError))
                        throw error;
                }
            }
        });
    });
    router.ws('/recap/:sessionId', function (wsClient, req) {
        const sessionId = (0, type_utils_1.asUlid)(req.params.sessionId);
        let initialized = false;
        // Allow 5 seconds for the server to respond to an INIT message otherwise
        // we'll close the socket connection to allow for Zwibbler to retry connecting
        setTimeout(() => {
            if (!initialized)
                wsClient.close();
        }, 5 * 1000);
        wsClient.on('message', async (rawMessage) => {
            const message = (0, zwibblerDecoder_1.decode)(rawMessage);
            if (message.messageType === zwibblerDecoder_1.MessageType.INIT) {
                try {
                    initialized = true;
                    // Get the completed session's whiteboard document from storage for session recap
                    const document = await WhiteboardService.getDocFromStorage(sessionId);
                    return wsClient.send((0, zwibblerDecoder_1.encode)({
                        messageType: zwibblerDecoder_1.MessageType.APPEND,
                        offset: 0,
                        data: document,
                        more: 0,
                    }));
                }
                catch (error) {
                    Sentry.captureException(error);
                    return wsClient.send((0, zwibblerDecoder_1.encode)({
                        messageType: zwibblerDecoder_1.MessageType.ERROR,
                        errorCode: zwibblerDecoder_1.DecodeError.DOES_NOT_EXIST,
                        more: 0,
                        description: 'does not exist',
                    }));
                }
            }
        });
    });
    router.route('/reset').post(async function (req, res, next) {
        const { body: { sessionId }, } = req;
        try {
            await WhiteboardService.deleteDoc(sessionId);
            res.sendStatus(200);
        }
        catch (err) {
            Sentry.captureException(err);
            next(err);
        }
    });
    app.use('/whiteboard', router);
}
exports.routes = routes;
