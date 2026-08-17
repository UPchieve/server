import {
  NTHSCandidateApplicationStatus,
  NTHSGroupRoleName,
  NTHSSchoolAffiliationStatusName,
} from '../models/NTHSGroups/types'
import { ISODateString } from '../types/dates'
import { Uuid } from '../types/shared'

export type NTHSGroupPublic = {
  id: Uuid
  name: string
  key: string
  inviteCode: string
  createdAt?: ISODateString
}

export type NTHSUserInfoPublic = {
  title: string
  joinedAt: ISODateString
  roleName: NTHSGroupRoleName
}

export type NTHSGroupWithMemberInfoPublic = {
  // these top-level fields nest the below fields.
  groupInfo: NTHSGroupPublic
  memberInfo: NTHSUserInfoPublic
  // TODO: remove all of the below fields after the frontend is pointing to these nested fields
  memberTitle: string
  joinedAt: ISODateString
  groupId: Uuid
  groupName: string
  groupKey: string
  inviteCode: string
  roleName: NTHSGroupRoleName
  schoolAffiliationStatus: NTHSSchoolAffiliationStatusName | null
}

export type NTHSGroupMemberPublic = {
  nthsGroupId: Uuid
  userId: Uuid
  title?: string
  joinedAt: ISODateString
  deactivatedAt?: ISODateString
  firstName: string
  lastInitial: string
}

export type NTHSGroupMemberWithRolePublic = NTHSGroupMemberPublic & {
  roleName: NTHSGroupRoleName
}

export type NTHSGroupActionPublic = {
  id: number
  groupId: Uuid
  actionId: number
  actionName: string
  createdAt: ISODateString
}

export type NTHSActionPublic = {
  id: number
  name: string
}

export type AdvisorPublic = {
  id: Uuid
  nthsGroupId: Uuid
  schoolId?: Uuid
  firstName: string
  lastName: string
  email: string
  title: string
  phone?: string
  phoneExtension?: string
}

export type NTHSGroupsResponse = {
  groups: NTHSGroupWithMemberInfoPublic[]
  candidateApplicationStatus?: NTHSCandidateApplicationStatus
}

export type NTHSGroupMembersResponse = {
  members: NTHSGroupMemberWithRolePublic[]
}

export type NTHSNewGroupResponse = {
  group: NTHSGroupWithMemberInfoPublic
}

export type NTHSGroupPublicResponse = {
  group: NTHSGroupPublic
}

export type NTHSCreateActionResponse = {
  groupId: Uuid
  //   the below is the action response
  action: NTHSGroupActionPublic
  schoolAffiliationStatus?: NTHSSchoolAffiliationStatusName
}

export type NTHSActionsAndGroupActionsResponse = {
  groupId: Uuid
  actions: NTHSActionPublic[]
  groupActions: NTHSGroupActionPublic[]
}

export type NTHSSchoolAffiliationResponse = {
  groupId: string
  NTHSAdvisor: AdvisorPublic
  action: Omit<NTHSCreateActionResponse, 'groupId'>
}
