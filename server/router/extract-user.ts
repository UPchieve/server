import { Request } from 'express'
import { UserContactInfo } from '../models/User'
import { NotAuthenticatedError } from '../models/Errors'

export function extractUser(req: Request): UserContactInfo {
  if (!req.user) throw new NotAuthenticatedError()
  return req.user as UserContactInfo
}
