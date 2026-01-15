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

export type NTHSGroupMember = {
  nthsGroupId: Ulid
  userId: Ulid
  title?: string
  joinedAt: Date
  updatedAt: Date
  deactivatedAt?: Date
}

export type NTHSGroupMemberRole = {
  userId: Ulid
  nthsGroupId: Ulid
  roleId: number
  roleName: string
  updatedAt: Date
}
