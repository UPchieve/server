import socketio, { Socket } from 'socket.io'
import { difference, intersection } from 'lodash'
import type { RemoteSocket } from 'socket.io'
import logger from '../logger'
import { Ulid, Uuid } from '../models/pgUtils'
import { getUnfulfilledSessions } from '../models/Session/queries'
import getSessionRoom from '../utils/get-session-room'
import { ProgressReport } from '../services/ProgressReportsService'
import { addDocEditorVersionTo } from './SessionService'
import { ProgressReportAnalysisTypes } from '../models/ProgressReports'
import { TransactionClient } from '../db'
import * as SessionService from '../services/SessionService'
import { backOff } from 'exponential-backoff'
import { UserContactInfo } from '../models/User'

// TODO: Remove class wrapper.
class SocketService {
  private static instance: SocketService
  private io: socketio.Server

  private constructor(io: socketio.Server) {
    this.io = io
  }

  // Allow singleton use of SocketService
  static getInstance(io?: socketio.Server): SocketService {
    if (!SocketService.instance) {
      if (!io) throw new Error('SocketService has not been initialized')
      SocketService.instance = new SocketService(io)
    }
    return SocketService.instance
  }

  async joinSession(socket: Socket, user: UserContactInfo, sessionId: Uuid) {
    try {
      await SessionService.ensureCanJoinSession(user, sessionId)
    } catch (error) {
      delete socket.data.sessionId
      throw error
    }

    const sessionRoom = getSessionRoom(sessionId)
    await socket.join(sessionRoom)
    socket.data.sessionId = sessionId

    await this.emitSessionChange(sessionId)
    await this.emitSessionPresence(user.id, sessionRoom, true)
  }

  async leaveSession(socket: Socket, user: UserContactInfo, sessionId: Uuid) {
    const sessionRoom = getSessionRoom(sessionId)
    await socket.leave(sessionRoom)
    delete socket.data.sessionId

    await this.emitSessionPresence(user.id, sessionRoom, false)
  }

  async emitSessionPresence(
    userId: string,
    roomName: string,
    hasJoined: boolean
  ) {
    const sessionSocketIds = await this.getAllSocketIdsInRoom(roomName)
    const userSocketIds = await this.getAllSocketIdsInRoom(userId)

    if (hasJoined) {
      // Emit to self if partner is connected to the session or not.
      // If there are any sockets in the session room that are not this user's,
      // we can assume the partner is in the room.
      const partnerSocketsInSession = difference(
        sessionSocketIds,
        userSocketIds
      )
      this.io
        .to(userId)
        .emit('sessions/partner:in-session', !!partnerSocketsInSession.length)
    }

    // Emit to partner whether in the room.
    // If there are any sockets in the session for this user, they are in
    // the room.
    const userSocketsInSession = intersection(sessionSocketIds, userSocketIds)
    this.io
      .to(roomName)
      .except(userId)
      .emit('sessions/partner:in-session', !!userSocketsInSession.length)
  }

  private async updateSessionList(tc?: TransactionClient): Promise<void> {
    const sessions = await getUnfulfilledSessions(tc)
    this.io.in('volunteers').emit('sessions', sessions)
  }

  async emitSessionChange(
    sessionId: Ulid,
    tc?: TransactionClient
  ): Promise<void> {
    const session = await SessionService.getSessionWithAllDetails(sessionId, tc)
    await addDocEditorVersionTo(session)
    const sessionParticipants = [session.student.id]
    if (session.volunteer?.id) {
      sessionParticipants.push(session.volunteer.id)
    }
    this.io.in(sessionParticipants).emit('session-change', session)

    await this.updateSessionList(tc)
  }

  async emitTutorBotMessage(sessionId: Ulid, messageData: any): Promise<void> {
    const socketRoom = getSessionRoom(sessionId)
    this.io.in(socketRoom).emit('tutorBotConversationMessage', messageData)
  }

  async emitProgressReportProcessedToUser(
    userId: Ulid,
    data: {
      report: ProgressReport
      subject: string
      sessionId?: Ulid
      analysisType: ProgressReportAnalysisTypes
    }
  ) {
    // The overall progress report is ready
    if (data.analysisType === 'group')
      this.io.to(userId).emit('progress-report:processed:overview', data)
    // A single progress report is ready
    else this.io.to(userId).emit('progress-report:processed:session', data)
  }

  async emitUserLiveMediaBannedEvents(
    userId: string,
    sessionId: string
  ): Promise<void> {
    this.io
      .to(getSessionRoom(sessionId))
      .except(userId)
      .emit('sessions:partner-banned-from-live-media')
    this.io.to(userId).emit('sessions:banned-from-live-media')
  }

  async emitModerationInfractionEvent(
    userId: string,
    data: {
      isBanned: boolean
      infraction: string[]
      source: string
      occurredAt: Date
      stopStreamImmediatelyReasons: string[]
    }
  ): Promise<void> {
    this.io.to(userId).emit('moderation-infraction', data)
  }

  // TODO: Remove once no longer have legacy mobile app.
  bump(
    socket: socketio.Socket,
    data: {
      endedAt?: Date
      volunteer?: Ulid
      student: Ulid
      sessionId: Ulid
      userId: Ulid
    },
    err: Error
  ): void {
    logger.error(
      `User ${data.userId} could not join session ${data.sessionId}: ${err}`
    )
    socket.emit('bump', data, err.toString())
  }

  private async getAllSocketIdsInRoom(roomName: string): Promise<string[]> {
    const sockets = await this.getAllSocketsInRoom(roomName)
    return sockets.map((socket) => socket.id)
  }

  private async getAllSocketsInRoom(
    roomName: string
  ): Promise<RemoteSocket<any, any>[]> {
    try {
      const sockets = await backOff(() => this.io.in(roomName).fetchSockets())
      return sockets
    } catch (error) {
      logger.error(
        `Failed to fetch sockets. ${JSON.stringify({ error, roomName })}`
      )
      return []
    }
  }
}

export default SocketService
