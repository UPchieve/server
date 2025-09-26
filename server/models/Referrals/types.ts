import { Ulid } from '../pgUtils'

export type Referral = {
  id: number
  referredBy?: Ulid
  userId?: Ulid
}
