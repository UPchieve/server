import { Types } from 'mongoose'
import socketio from 'socket.io'
import logger from '../logger'
import SessionModel, { SessionDocument } from '../models/Session'
import { getUnfulfilledSessions } from '../models/Session/queries'
import getSessionRoom from '../utils/get-session-room'

class SocketService {
  private io: socketio.Server

  constructor(io: socketio.Server) {
    this.io = io
  }

  /**
   * Get session data to send to client for a given session ID
   * @param sessionId
   * @returns the session object
   */
  private async getSessionData(
    sessionId: Types.ObjectId
  ): Promise<SessionDocument> {
    const populateOptions = [
      { path: 'student', select: 'firstname isVolunteer' },
      { path: 'volunteer', select: 'firstname isVolunteer' },
    ]

    // TODO: repo pattern
    const populatedSession = await SessionModel.findById(sessionId)
      .populate(populateOptions)
      .exec()

    if (populatedSession) return populatedSession
    else throw new Error(`Session data for ${sessionId} not found`)
  }

  async updateSessionList(): Promise<void> {
    const sessions = await getUnfulfilledSessions()
    this.io.in('volunteers').emit('sessions', sessions)
  }

  async emitSessionChange(sessionId: Types.ObjectId): Promise<void> {
    const session = await this.getSessionData(sessionId)
    this.io.in(getSessionRoom(sessionId)).emit('session-change', session)

    await this.updateSessionList()
  }

  bump(
    socket: socketio.Socket,
    data: {
      endedAt?: Date
      volunteer?: Types.ObjectId
      student: Types.ObjectId
    },
    err: Error
  ): void {
    logger.error('Could not join session')
    logger.error(err)
    socket.emit('bump', data, err.toString())
  }
}

export default SocketService
