import {
  AdvisorPublic,
  NTHSActionPublic,
  NTHSGroupActionPublic,
  NTHSGroupMemberWithRolePublic,
  NTHSGroupPublic,
  NTHSGroupWithMemberInfoPublic,
  NTHSUserInfoPublic,
  NTHSChapterImpactPublic,
  NTHSChapterRosterMemberPublic,
  NTHSChapterRosterPublic,
  NTHSChapterTopTutorPublic,
  NTHSSchoolYearPublic,
} from '../contracts/nths-group'
import { NTHSCandidateApplicationPublic } from '../contracts/nths-application'
import {
  Advisor,
  NTHSAction,
  NTHSGroup,
  NTHSGroupAction,
  NTHSGroupMemberWithRole,
  NTHSGroupWithMemberInfo,
  NTHSUserInfo,
  NTHSChapterImpact,
  NTHSChapterRoster,
  NTHSChapterRosterMember,
  NTHSChapterTopTutor,
} from '../models/NTHSGroups'
import { NTHSCandidateApplication } from '../models/NTHSApplication'
import { SchoolYear } from '../utils/school-year'

export function toNTHSGroupPublic(group: NTHSGroup): NTHSGroupPublic {
  return {
    id: group.id,
    name: group.name,
    key: group.key,
    inviteCode: group.inviteCode,
    createdAt: group.createdAt?.toISOString(),
  }
}

export function toNTHSUserInfoPublic(
  userInfo: NTHSUserInfo
): NTHSUserInfoPublic {
  return {
    title: userInfo.title,
    joinedAt: userInfo.joinedAt.toISOString(),
    roleName: userInfo.roleName,
  }
}

export function toNTHSGroupWithMemberInfoPublic(
  group: NTHSGroupWithMemberInfo
): NTHSGroupWithMemberInfoPublic {
  return {
    groupInfo: toNTHSGroupPublic(group.groupInfo),
    memberInfo: toNTHSUserInfoPublic(group.memberInfo),
    // TODO: remove all of the below fields after the frontend is pointing to these nested fields
    memberTitle: group.memberTitle,
    joinedAt: group.joinedAt.toISOString(),
    groupId: group.groupId,
    groupName: group.groupName,
    groupKey: group.groupKey,
    inviteCode: group.inviteCode,
    roleName: group.roleName,
    schoolAffiliationStatus: group.schoolAffiliationStatus ?? null,
    hasSchoolOnRecord: group.hasSchoolOnRecord,
  }
}

export function toNTHSGroupMemberWithRolePublic(
  member: NTHSGroupMemberWithRole
): NTHSGroupMemberWithRolePublic {
  return {
    nthsGroupId: member.nthsGroupId,
    userId: member.userId,
    title: member.title,
    joinedAt: member.joinedAt.toISOString(),
    deactivatedAt: member.deactivatedAt?.toISOString(),
    firstName: member.firstName,
    lastInitial: member.lastInitial,
    roleName: member.roleName,
    accountClosed: member.deleted,
  }
}

export function toNTHSGroupActionPublic(
  action: NTHSGroupAction
): NTHSGroupActionPublic {
  return {
    id: action.id,
    groupId: action.groupId,
    actionId: action.actionId,
    actionName: action.actionName,
    createdAt: action.createdAt.toISOString(),
  }
}

export function toNTHSActionPublic(action: NTHSAction): NTHSActionPublic {
  return {
    id: action.id,
    name: action.name,
  }
}

// deniedNotes is omitted: it is staff-authored and the applicant learns the
// decision by email.
export function toNTHSCandidateApplicationPublic(
  application: NTHSCandidateApplication
): NTHSCandidateApplicationPublic {
  return {
    id: application.id,
    status: application.status,
    schoolId: application.schoolId,
    unlistedSchool: application.unlistedSchool,
    formVersion: application.formVersion,
    responses: application.responses,
    decidedAt: application.decidedAt?.toISOString(),
    createdAt: application.createdAt.toISOString(),
  }
}

export function toNTHSAdvisorPublic(advisor: Advisor): AdvisorPublic {
  return {
    id: advisor.id,
    nthsGroupId: advisor.nthsGroupId,
    schoolId: advisor?.schoolId,
    firstName: advisor.firstName,
    lastName: advisor.lastName,
    email: advisor.email,
    title: advisor.title,
    phone: advisor.phone,
    phoneExtension: advisor.phoneExtension,
  }
}

export function toNTHSSchoolYearPublic(
  schoolYear: SchoolYear
): NTHSSchoolYearPublic {
  return {
    label: schoolYear.label,
    startsAt: schoolYear.startsAt.toISOString(),
    endsAt: schoolYear.endsAt.toISOString(),
  }
}

export function toNTHSChapterImpactPublic(
  impact: NTHSChapterImpact
): NTHSChapterImpactPublic {
  return {
    groupId: impact.groupId,
    schoolYear: toNTHSSchoolYearPublic(impact.schoolYear),
    schoolYearToDate: impact.schoolYearToDate,
    allTime: impact.allTime,
    goals: impact.goals,
    topTutorThisMonth:
      impact.topTutorThisMonth &&
      toNTHSChapterTopTutorPublic(impact.topTutorThisMonth),
    viewerHoursThisMonth: impact.viewerHoursThisMonth,
  }
}

export function toNTHSChapterRosterMemberPublic(
  member: NTHSChapterRosterMember
): NTHSChapterRosterMemberPublic {
  return {
    userId: member.userId,
    firstName: member.firstName,
    lastInitial: member.lastInitial,
    roleName: member.roleName,
    title: member.title,
    joinedAt: member.joinedAt.toISOString(),
    trainingComplete: member.trainingComplete,
    safetyApproved: member.safetyApproved,
    accountClosed: member.accountClosed,
    sessionsThisYear: member.sessionsThisYear,
    hoursThisYear: member.hoursThisYear,
    periodHours: member.periodHours,
    lastActiveAt: member.lastActiveAt?.toISOString(),
  }
}

export function toNTHSChapterTopTutorPublic(
  topTutor: NTHSChapterTopTutor
): NTHSChapterTopTutorPublic {
  return {
    userId: topTutor.userId,
    firstName: topTutor.firstName,
    lastInitial: topTutor.lastInitial,
    hoursTutored: topTutor.hoursTutored,
    sessionsCompleted: topTutor.sessionsCompleted,
  }
}

export function toNTHSChapterRosterPublic(
  roster: NTHSChapterRoster
): NTHSChapterRosterPublic {
  return {
    groupId: roster.groupId,
    schoolYear: toNTHSSchoolYearPublic(roster.schoolYear),
    members: roster.members.map(toNTHSChapterRosterMemberPublic),
    topTutorThisMonth:
      roster.topTutorThisMonth &&
      toNTHSChapterTopTutorPublic(roster.topTutorThisMonth),
  }
}
