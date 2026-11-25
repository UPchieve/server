import {
  NTHSCandidateApplicationStatus,
  NTHSGroupRoleName,
  NTHSSchoolAffiliationStatusName,
} from '../models/NTHSGroups/types'
import type { NTHSTitle } from '../constants/nths-titles'
import { ISODateString } from '../types/dates'
import { Uuid } from '../types/shared'
import type {
  NTHSAcceptanceOutcome,
  NTHSRenewalPrompt,
} from '../services/NTHSRenewalService'

export type NTHSGroupPublic = {
  id: Uuid
  name: string
  key: string
  inviteCode: string
  createdAt?: ISODateString
}

export type NTHSGroupJoinPublic = Omit<NTHSGroupPublic, 'inviteCode'> & {
  closedAt: ISODateString | null
}

export type NTHSUserInfoPublic = {
  title: NTHSTitle
  joinedAt: ISODateString
  roleName: NTHSGroupRoleName
}

export type NTHSGroupWithMemberInfoPublic = {
  // these top-level fields nest the below fields.
  groupInfo: NTHSGroupPublic
  memberInfo: NTHSUserInfoPublic
  // TODO: remove all of the below fields after the frontend is pointing to these nested fields
  memberTitle: NTHSTitle
  joinedAt: ISODateString
  groupId: Uuid
  groupName: string
  groupKey: string
  inviteCode: string
  roleName: NTHSGroupRoleName
  schoolAffiliationStatus: NTHSSchoolAffiliationStatusName | null
  hasSchoolOnRecord: boolean
}

export type NTHSRenewalPublic = {
  prompt: NTHSRenewalPrompt
  closesOn: string | null
  successorConfirmationOn: string | null
}

export type NTHSGroupWithRenewalPublic = NTHSGroupWithMemberInfoPublic & {
  renewal: NTHSRenewalPublic
}

export type NTHSRenewalResponse = {
  renewal: NTHSRenewalPublic
}

export type NTHSRenewalAcceptResponse = NTHSRenewalResponse & {
  outcome: NTHSAcceptanceOutcome
}

export type NTHSGroupMemberPublic = {
  nthsGroupId: Uuid
  userId: Uuid
  title: NTHSTitle
  joinedAt: ISODateString
  deactivatedAt?: ISODateString
  firstName: string
  lastInitial: string
}

export type NTHSGroupMemberWithRolePublic = NTHSGroupMemberPublic & {
  roleName: NTHSGroupRoleName
  accountClosed: boolean
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
  groups: NTHSGroupWithRenewalPublic[]
  candidateApplicationStatus?: NTHSCandidateApplicationStatus
  approvalExpiresAt: string | null
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
