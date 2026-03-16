import { Ulid } from '../pgUtils'

export type Totp = {
  userId: Ulid
  secret: string
  verified: boolean
  lastUsedCounter?: number
  createdAt: Date
  updatedAt: Date
}
