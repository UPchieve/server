import { Request } from 'express'
import { User } from '../models/User'
import { NotAuthenticatedError } from '../models/Errors'

export function extractUser(req: Request): User {
  if (!req.user) throw new NotAuthenticatedError()
  return req.user as User
}
