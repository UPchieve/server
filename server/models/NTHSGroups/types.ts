import { Ulid } from '../pgUtils'

export type UserGroup = {
  memberTitle: string
  joinedAt: Date
  groupId: Ulid
  groupName: string
  groupKey: string
  inviteCode: string
}

export type NTHSGroup = {
  id: Ulid
  name: string
  key: string
  createdAt: Date
}
