import { UserContactInfo } from '../models/User'
import { Ulid } from '../models/pgUtils'

declare global {
  namespace Express {
    export interface User {
      id: Ulid
      isAdmin: boolean
    }
    export interface Request {
      ip: string
      // this is the signature we get after promisifying login
      // see app.ts line 166
      asyncLogin: (arg1: User, arg2?: any) => Promise<unknown>
    }
  }
}
