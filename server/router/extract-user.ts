import { Request } from 'express'
import { UserContactInfo } from '../models/User'
import { NotAuthenticatedError } from '../models/Errors'
import { SocketUser } from '../types/socket-types'

export function extractUser(req: Request): UserContactInfo {
  if (!req.user) throw new NotAuthenticatedError()
  return req.user as UserContactInfo
}

export function extractUserIfExists(req: Request): UserContactInfo | undefined {
  return req.user as UserContactInfo
}

// Non-existent user is handled by socket middleware
export function extractSocketUser(socket: SocketUser): UserContactInfo {
  const {
    request: { user: socketUser },
  } = socket
  return socketUser as UserContactInfo
}
