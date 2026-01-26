import { Ulid } from '../pgUtils'

export type UserGroup = {
  memberTitle: string
  joinedAt: Date
  groupId: Ulid
  groupName: string
  groupKey: string
  inviteCode: string
  roleName: NTHSGroupRoleName
}

export type NTHSGroup = {
  id: Ulid
  name: string
  key: string
  createdAt: Date
  inviteCode: string
}

export type NTHSGroupMember = {
  nthsGroupId: Ulid
  userId: Ulid
  title?: string
  joinedAt: Date
  updatedAt: Date
  deactivatedAt?: Date
  firstName: string
  lastInitial: string
}

export type NTHSGroupMemberWithRole = NTHSGroupMember & {
  roleName: NTHSGroupRoleName
}

export type NTHSGroupMemberRole = {
  userId: Ulid
  nthsGroupId: Ulid
  roleId: number
  roleName: string
  updatedAt: Date
}

export type NTHSGroupRoleName = 'admin' | 'member'
