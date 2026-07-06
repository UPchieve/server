import { Ulid } from '../pgUtils'

export type UsersGradeLevels = {
  userId: Ulid
  signupGradeLevelId?: number
  gradeLevelId?: number
  updatedAt: Date
}
