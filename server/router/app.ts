import { Request } from 'express'
import { User } from '../models/User'

export interface LoadedRequest extends Request {
  login: { (user: User, done: (err: any) => void): void; (user: User, options: any, done: (err: any) => void): void; }
  ip: string
}
