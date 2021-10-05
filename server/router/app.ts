import { Request } from 'express'
import { Student } from '../models/Student'
import { Volunteer } from '../models/Volunteer'

/**
 * LoadedRequest represents an authenticated request that has gone through
 * passport middleware
 *
 * TODO: find a way to extends the Express namespace to get the typing built into default express request so we don't need to import this everywhere
 */
export interface LoadedRequest extends Request {
  user?: Student | Volunteer
  login?: Function
  logout?: Function
  ip: string
}
