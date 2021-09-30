import { Request } from 'express'
import { Student } from '../models/Student'
import { Volunteer } from '../models/Volunteer'

export interface LoadedRequest extends Request {
  user?: Student | Volunteer,
  login?: Function,
  ip: string
}
