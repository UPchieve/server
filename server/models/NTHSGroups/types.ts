import { Ulid } from '../pgUtils'
import { SchoolYear } from '../../utils/school-year'

export type NTHSGroupWithMemberInfo = {
  // these top-level fields nest the below fields.
  groupInfo: NTHSGroup
  memberInfo: NTHSUserInfo
  // TODO: remove all of the below fields after the frontend is pointing to these nested fields
  memberTitle: string
  joinedAt: Date
  groupId: Ulid
  groupName: string
  groupKey: string
  inviteCode: string
  roleName: NTHSGroupRoleName
  schoolAffiliationStatus: NTHSSchoolAffiliationStatusName | null
  hasSchoolOnRecord: boolean
}

export type NTHSGroup = {
  id: Ulid
  name: string
  key: string
  createdAt?: Date
  inviteCode: string
}

export type NTHSUserInfo = {
  title: string
  joinedAt: Date
  roleName: NTHSGroupRoleName
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
  deleted: boolean
}

export type NTHSGroupMemberWithRole = NTHSGroupMember & {
  roleName: NTHSGroupRoleName
}

export type NTHSActiveGroupMember = Omit<
  NTHSGroupMemberWithRole,
  'firstName' | 'lastInitial' | 'deleted'
>

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
  | 'RECRUITMENT SPRINT'
  | 'MARKED SCHOOL AFFILIATION IN PROGRESS'
  | 'SUBMITTED ADVISOR CONTACT INFO'
  | 'ADVISOR VERIFIED'
  | 'SCHOOL AFFILIATION DENIED'
  | 'OPTED OUT'

export const NTHS_ACTIONS_TO_SCHOOL_AFFILIATION_STATUS_MAPPING: Partial<
  Record<NTHSActionName, NTHSSchoolAffiliationStatusName>
> = {
  'MARKED SCHOOL AFFILIATION IN PROGRESS': 'PENDING_SCHOOL_AFFILIATION',
  'SUBMITTED ADVISOR CONTACT INFO': 'PENDING_UPCHIEVE_VERIFICATION',
  'ADVISOR VERIFIED': 'AFFILIATED',
  'SCHOOL AFFILIATION DENIED': 'DENIED',
  'OPTED OUT': 'OPTED_OUT',
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

// The UNAFFILIATED status will get applied when a new group is founded by an
// applicant that had a valid school_id. This lets us guard against multiple
// multiple NTHS chapters (officially affiliated or not) for a given school.
export type NTHSSchoolAffiliationStatusName =
  | 'PENDING_SCHOOL_AFFILIATION'
  | 'PENDING_UPCHIEVE_VERIFICATION'
  | 'AFFILIATED'
  | 'DENIED'
  | 'OPTED_OUT'
  | 'UNAFFILIATED'

export type NTHSChapterStatusName = 'PENDING' | 'FAILED' | 'OFFICIAL'

export type NTHSChapterStatus = {
  groupId: Ulid
  statusName: NTHSChapterStatusName
  createdAt: Date
  statusId: number
}

export type NTHSGroupChapterStatusInfo = {
  groupId: Ulid
  statusName?: NTHSChapterStatusName
  statusId?: number
  schoolAffiliationStatusName?: NTHSSchoolAffiliationStatusName
  schoolAffiliationStatusId?: number
}

export enum NTHSCandidateApplicationStatus {
  applied = 'applied',
  approved = 'approved',
  denied = 'denied',
}

export function isValidStatus(
  status: string
): status is NTHSCandidateApplicationStatus {
  return Object.hasOwn(NTHSCandidateApplicationStatus, status)
}

export type NTHSChapterPeriodStarts = {
  weekStartsAt: Date
  lastTwoWeeksStartsAt: Date
  monthStartsAt: Date
}

export type NTHSPeriodHours = {
  thisWeek: number
  lastTwoWeeks: number
  thisMonth: number
}

export type NTHSChapterGoals = {
  hoursTutored: number
  membersTutoring: number
}

export type NTHSChapterImpactTotals = {
  studentsHelped: number
  sessionsCompleted: number
  hoursTutored: number
}

export type NTHSChapterTopTutor = {
  userId: Ulid
  firstName: string
  lastInitial: string
  sessionsCompleted: number
  hoursTutored: number
}

export type NTHSChapterImpact = {
  groupId: Ulid
  schoolYear: SchoolYear
  schoolYearToDate: NTHSChapterImpactTotals & { membersTutoring: number }
  allTime: NTHSChapterImpactTotals
  goals: NTHSChapterGoals
  topTutorThisMonth?: NTHSChapterTopTutor
  viewerHoursThisMonth: number
}

export type NTHSChapterRosterMember = {
  userId: Ulid
  firstName: string
  lastInitial: string
  roleName: NTHSGroupRoleName
  title?: string
  joinedAt: Date
  trainingComplete: boolean
  safetyApproved: boolean
  accountClosed: boolean
  sessionsThisYear: number
  hoursThisYear: number
  periodHours: NTHSPeriodHours
  lastActiveAt?: Date
}

export type NTHSChapterRoster = {
  groupId: Ulid
  schoolYear: SchoolYear
  members: NTHSChapterRosterMember[]
  topTutorThisMonth?: NTHSChapterTopTutor
}
