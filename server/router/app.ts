import { Request } from 'express'

export interface LoadedRequest extends Request {
  login: Function
  ip: string
}
