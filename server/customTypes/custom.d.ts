import { UserContactInfo } from '../models/User'
import { Ulid } from '../models/pgUtils'
import type { NTHSActiveGroupMember } from '../models/NTHSGroups'

declare global {
  namespace Express {
    export interface User {
      id: Ulid
      isAdmin: boolean
    }
    export interface Request {
      ip: string
      // This is the signature we get after promisifying passport's login
      // and logout. See app.ts.
      asyncLogin: (user: User) => Promise<void>
      asyncLogout: () => Promise<unknown>
    }
    export interface Locals {
      groupMember?: NTHSActiveGroupMember
    }
  }
}
