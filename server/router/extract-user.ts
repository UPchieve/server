import { Request } from 'express'
import { UserContactInfo } from '../models/User'
import { NotAuthenticatedError } from '../models/Errors'
import { Socket } from 'socket.io'

export type SocketUser = Socket & { request: { user?: UserContactInfo } }

export function extractUser(req: Request): UserContactInfo {
  if (!req.user) throw new NotAuthenticatedError()
  return req.user as UserContactInfo
}

// Non-existent user is handled by socket middleware
export function extractSocketUser(socket: SocketUser): UserContactInfo {
  const {
    request: { user: socketUser },
  } = socket
  return socketUser as UserContactInfo
}
