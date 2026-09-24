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
  hasSchoolOnRecord: boolean
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

export type NTHSSchoolYearPublic = {
  label: string
  startsAt: ISODateString
  endsAt: ISODateString
}

export type NTHSChapterImpactTotalsPublic = {
  studentsHelped: number
  sessionsCompleted: number
  hoursTutored: number
}

// thisWeek, lastTwoWeeks and thisMonth run from the start the browser sent (or
// its UTC equivalent) to the moment of the request.
export type NTHSPeriodHoursPublic = {
  thisWeek: number
  lastTwoWeeks: number
  thisMonth: number
  thisSchoolYear: number
  allTime: number
}

export type NTHSPeriodSessionsPublic = NTHSPeriodHoursPublic

export type NTHSChapterTopTutorPublic = {
  userId: Uuid
  firstName: string
  lastInitial: string
  hoursTutored: number
  sessionsCompleted: number
}

export type NTHSChapterImpactPublic = {
  groupId: Uuid
  schoolYear: NTHSSchoolYearPublic
  schoolYearToDate: NTHSChapterImpactTotalsPublic & { membersTutoring: number }
  allTime: NTHSChapterImpactTotalsPublic
  goals: {
    hoursTutored: number
    membersTutoring: number
  }
  // This month's fields run from monthStartsAt (or the UTC 1st of the month) to now.
  topTutorThisMonth?: NTHSChapterTopTutorPublic
  // Only ever the requester's own hours.
  viewerHoursThisMonth: number
}

export type NTHSChapterImpactResponse = {
  impact: NTHSChapterImpactPublic
}

export type NTHSChapterRosterMemberPublic = {
  userId: Uuid
  firstName: string
  lastInitial: string
  roleName: NTHSGroupRoleName
  title?: string
  joinedAt: ISODateString
  trainingComplete: boolean
  safetyApproved: boolean
  accountClosed: boolean
  sessionsThisYear: number
  hoursThisYear: number
  periodHours: NTHSPeriodHoursPublic
  periodSessions: NTHSPeriodSessionsPublic
  // The member's most recent counted session, with no school-year bound, so it
  // can predate the year the counts above cover.
  lastActiveAt?: ISODateString
}

export type NTHSChapterRosterPublic = {
  groupId: Uuid
  schoolYear: NTHSSchoolYearPublic
  members: NTHSChapterRosterMemberPublic[]
  // From monthStartsAt (or the UTC 1st of the month) to now. Omitted when no
  // member qualifies.
  topTutorThisMonth?: NTHSChapterTopTutorPublic
}

export type NTHSChapterRosterResponse = {
  roster: NTHSChapterRosterPublic
}
