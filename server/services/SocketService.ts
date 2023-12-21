import { Ulid } from '../models/pgUtils'
import socketio from 'socket.io'
import logger from '../logger'
import { CurrentSession, getCurrentSessionBySessionId } from '../models/Session'
import { getUnfulfilledSessions } from '../models/Session/queries'
import getSessionRoom from '../utils/get-session-room'
import { ProgressReport } from '../services/ProgressReportsService'

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

  /**
   * Get session data to send to client for a given session ID
   * @param sessionId
   * @returns the session object
   */
  private async getSessionData(sessionId: Ulid): Promise<CurrentSession> {
    // Replaced by getCurrentSessionBySessionId
    const populatedSession = await getCurrentSessionBySessionId(sessionId)

    if (populatedSession) return populatedSession
    else throw new Error(`Session data for ${sessionId} not found`)
  }

  async updateSessionList(): Promise<void> {
    const sessions = await getUnfulfilledSessions()
    this.io.in('volunteers').emit('sessions', sessions)
  }

  async emitSessionChange(sessionId: Ulid): Promise<void> {
    const session = await this.getSessionData(sessionId)
    this.io.in(getSessionRoom(sessionId)).emit('session-change', session)

    await this.updateSessionList()
  }

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
      `User ${data.userId} could not join session ${data.sessionId}: `,
      err
    )
    socket.emit('bump', data, err.toString())
  }

  async emitProgressReportProcessedToUser(
    userId: Ulid,
    data: {
      report: ProgressReport
      subject: string
      sessionId?: Ulid
    }
  ) {
    // The overall progress report is ready
    if (!data.sessionId)
      this.io.to(userId).emit('progress-report:processed:overview', data)
    // A single progress report is ready
    else this.io.to(userId).emit('progress-report:processed:session', data)
  }
}

export default SocketService
