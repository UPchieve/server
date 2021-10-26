import { Types } from 'mongoose'
import socketio from 'socket.io'
import SessionModel from '../models/Session'
import { getUnfulfilledSessions } from '../models/Session/queries'
import MessageModel, { MessageDocument } from '../models/Message'
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
  ): Promise<MessageDocument> {
    const populateOptions = [
      { path: 'student', select: 'firstname isVolunteer' },
      { path: 'volunteer', select: 'firstname isVolunteer' },
    ]

    // TODO: import from SessionService instead of directly from the model
    const populatedSession = await SessionModel.findById(sessionId)
      .populate(populateOptions)
      .exec()

    return MessageModel.populate(populatedSession, {
      path: 'messages.user',
      select: 'firstname isVolunteer',
    })
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

  // TODO: type these once api socket router is fully typed
  bump(
    socket: socketio.Socket,
    data: {
      endedAt: Date
      volunteer?: Types.ObjectId
      student?: Types.ObjectId
    },
    err: Error
  ): void {
    console.log('Could not join session')
    console.log(err)
    socket.emit('bump', data, err.toString())
  }
}

export default SocketService
