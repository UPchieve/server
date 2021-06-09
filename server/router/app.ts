import { Request } from 'express'
import { UserDocument } from '../models/User'

export interface LoadedRequest extends Request {
  user: UserDocument
  login: Function
  ip: string
}
