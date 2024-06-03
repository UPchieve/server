"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../logger"));
const Session_1 = require("../models/Session");
const queries_1 = require("../models/Session/queries");
const get_session_room_1 = __importDefault(require("../utils/get-session-room"));
const SessionService_1 = require("./SessionService");
class SocketService {
    constructor(io) {
        this.io = io;
    }
    // Allow singleton use of SocketService
    static getInstance(io) {
        if (!SocketService.instance) {
            if (!io)
                throw new Error('SocketService has not been initialized');
            SocketService.instance = new SocketService(io);
        }
        return SocketService.instance;
    }
    /**
     * Get session data to send to client for a given session ID
     * @param sessionId
     * @returns the session object
     */
    async getSessionData(sessionId) {
        // Replaced by getCurrentSessionBySessionId
        const populatedSession = await (0, Session_1.getCurrentSessionBySessionId)(sessionId);
        if (populatedSession)
            return populatedSession;
        else
            throw new Error(`Session data for ${sessionId} not found`);
    }
    async updateSessionList() {
        const sessions = await (0, queries_1.getUnfulfilledSessions)();
        this.io.in('volunteers').emit('sessions', sessions);
    }
    async emitSessionChange(sessionId) {
        const session = await this.getSessionData(sessionId);
        await (0, SessionService_1.addDocEditorVersionTo)(session);
        this.io.in((0, get_session_room_1.default)(sessionId)).emit('session-change', session);
        await this.updateSessionList();
    }
    bump(socket, data, err) {
        logger_1.default.error(`User ${data.userId} could not join session ${data.sessionId}: `, err);
        socket.emit('bump', data, err.toString());
    }
    async emitProgressReportProcessedToUser(userId, data) {
        // The overall progress report is ready
        if (!data.sessionId)
            this.io.to(userId).emit('progress-report:processed:overview', data);
        // A single progress report is ready
        else
            this.io.to(userId).emit('progress-report:processed:session', data);
    }
}
exports.default = SocketService;
