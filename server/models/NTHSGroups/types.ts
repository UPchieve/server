import { Ulid } from '../pgUtils'

export type UserGroup = {
  memberTitle: string
  joinedAt: Date
  groupId: Ulid
  groupName: string
  groupKey: string
  inviteCode: string
  roleName: NTHSGroupRoleName
  schoolAffiliationStatus: NTHSSchoolAffiliationStatus | null
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

export type NTHSActionName =
  | 'NAMED YOUR TEAM'
  | 'REVIEWED RESOURCES'
  | 'ATTENDED ORIENTATION'
  | 'MARKED SCHOOL AFFILIATION IN PROGRESS'
  | 'SUBMITTED ADVISOR CONTACT INFO'
  | 'ADVISOR VERIFIED'
  | 'SCHOOL AFFILIATION DENIED'

export const NTHS_ACTIONS_TO_SCHOOL_AFFILIATION_STATUS_MAPPING: Partial<
  Record<NTHSActionName, NTHSSchoolAffiliationStatus>
> = {
  'MARKED SCHOOL AFFILIATION IN PROGRESS': 'PENDING_SCHOOL_AFFILIATION',
  'SUBMITTED ADVISOR CONTACT INFO': 'PENDING_UPCHIEVE_VERIFICATION',
  'ADVISOR VERIFIED': 'AFFILIATED',
  'SCHOOL AFFILIATION DENIED': 'DENIED',
}

export type NTHSGroupAction = {
  id: number
  groupId: Ulid
  actionId: number
  actionName: string
  createdAt: Date
}

export type NTHSAction = {
  id: number
  name: string
}

export type NTHSSchoolAffiliationStatus =
  | 'PENDING_SCHOOL_AFFILIATION'
  | 'PENDING_UPCHIEVE_VERIFICATION'
  | 'AFFILIATED'
  | 'DENIED'
