import {
  AdvisorPublic,
  NTHSActionPublic,
  NTHSGroupActionPublic,
  NTHSGroupMemberWithRolePublic,
  NTHSGroupPublic,
  NTHSGroupWithMemberInfoPublic,
  NTHSUserInfoPublic,
} from '../contracts/nths'
import {
  Advisor,
  NTHSAction,
  NTHSGroup,
  NTHSGroupAction,
  NTHSGroupMemberWithRole,
  NTHSGroupWithMemberInfo,
  NTHSUserInfo,
} from '../models/NTHSGroups'

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
