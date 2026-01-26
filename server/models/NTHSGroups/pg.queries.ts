/** Types generated for queries found in "server/models/NTHSGroups/nths_groups.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetGroupsByUser' parameters type */
export interface IGetGroupsByUserParams {
  userId: string;
}

/** 'GetGroupsByUser' return type */
export interface IGetGroupsByUserResult {
  groupId: string;
  groupKey: string;
  groupName: string;
  inviteCode: string;
  joinedAt: Date;
  memberTitle: string | null;
  roleName: string | null;
}

/** 'GetGroupsByUser' query type */
export interface IGetGroupsByUserQuery {
  params: IGetGroupsByUserParams;
  result: IGetGroupsByUserResult;
}

const getGroupsByUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":349,"b":356},{"a":502,"b":509}]}],"statement":"SELECT\n    ngm.title AS member_title,\n    ngm.joined_at,\n    ng.id AS group_id,\n    ng.name AS group_name,\n    ng.key AS group_key,\n    ng.invite_code,\n    roles.name AS role_name\nFROM\n    nths_group_members ngm\n    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id\n    INNER JOIN nths_group_member_roles member_roles ON member_roles.user_id = :userId!\n        AND member_roles.nths_group_id = ng.id\n    INNER JOIN nths_group_roles roles ON roles.id = member_roles.role_id\nWHERE\n    ngm.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ngm.title AS member_title,
 *     ngm.joined_at,
 *     ng.id AS group_id,
 *     ng.name AS group_name,
 *     ng.key AS group_key,
 *     ng.invite_code,
 *     roles.name AS role_name
 * FROM
 *     nths_group_members ngm
 *     INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id
 *     INNER JOIN nths_group_member_roles member_roles ON member_roles.user_id = :userId!
 *         AND member_roles.nths_group_id = ng.id
 *     INNER JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 * WHERE
 *     ngm.user_id = :userId!
 * ```
 */
export const getGroupsByUser = new PreparedQuery<IGetGroupsByUserParams,IGetGroupsByUserResult>(getGroupsByUserIR);


/** 'GetInviteCodeForGroup' parameters type */
export interface IGetInviteCodeForGroupParams {
  id: string;
}

/** 'GetInviteCodeForGroup' return type */
export interface IGetInviteCodeForGroupResult {
  inviteCode: string;
}

/** 'GetInviteCodeForGroup' query type */
export interface IGetInviteCodeForGroupQuery {
  params: IGetInviteCodeForGroupParams;
  result: IGetInviteCodeForGroupResult;
}

const getInviteCodeForGroupIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":62}]}],"statement":"SELECT\n    invite_code\nFROM\n    nths_groups\nWHERE\n    id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     invite_code
 * FROM
 *     nths_groups
 * WHERE
 *     id = :id!
 * ```
 */
export const getInviteCodeForGroup = new PreparedQuery<IGetInviteCodeForGroupParams,IGetInviteCodeForGroupResult>(getInviteCodeForGroupIR);


/** 'GetGroupByInviteCode' parameters type */
export interface IGetGroupByInviteCodeParams {
  inviteCode: string;
}

/** 'GetGroupByInviteCode' return type */
export interface IGetGroupByInviteCodeResult {
  createdAt: Date;
  id: string;
  key: string;
  name: string;
}

/** 'GetGroupByInviteCode' query type */
export interface IGetGroupByInviteCodeQuery {
  params: IGetGroupByInviteCodeParams;
  result: IGetGroupByInviteCodeResult;
}

const getGroupByInviteCodeIR: any = {"usedParamSet":{"inviteCode":true},"params":[{"name":"inviteCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":105}]}],"statement":"SELECT\n    id,\n    name,\n    KEY,\n    created_at\nFROM\n    nths_groups\nWHERE\n    invite_code = :inviteCode!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name,
 *     KEY,
 *     created_at
 * FROM
 *     nths_groups
 * WHERE
 *     invite_code = :inviteCode!
 * ```
 */
export const getGroupByInviteCode = new PreparedQuery<IGetGroupByInviteCodeParams,IGetGroupByInviteCodeResult>(getGroupByInviteCodeIR);


/** 'JoinGroupById' parameters type */
export interface IJoinGroupByIdParams {
  groupId: string;
  title: string;
  userId: string;
}

/** 'JoinGroupById' return type */
export interface IJoinGroupByIdResult {
  deactivatedAt: Date | null;
  joinedAt: Date;
  nthsGroupId: string;
  title: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'JoinGroupById' query type */
export interface IJoinGroupByIdQuery {
  params: IJoinGroupByIdParams;
  result: IJoinGroupByIdResult;
}

const joinGroupByIdIR: any = {"usedParamSet":{"groupId":true,"userId":true,"title":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":89}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":99}]},{"name":"title","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":108}]}],"statement":"INSERT INTO nths_group_members (\"nths_group_id\", \"user_id\", \"title\")\n    VALUES (:groupId!, :userId!, :title!)\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_members ("nths_group_id", "user_id", "title")
 *     VALUES (:groupId!, :userId!, :title!)
 * RETURNING
 *     *
 * ```
 */
export const joinGroupById = new PreparedQuery<IJoinGroupByIdParams,IJoinGroupByIdResult>(joinGroupByIdIR);


/** 'GetAllNthsUsers' parameters type */
export type IGetAllNthsUsersParams = void;

/** 'GetAllNthsUsers' return type */
export interface IGetAllNthsUsersResult {
  deactivatedAt: Date | null;
  joinedAt: Date;
  nthsGroupId: string;
  title: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'GetAllNthsUsers' query type */
export interface IGetAllNthsUsersQuery {
  params: IGetAllNthsUsersParams;
  result: IGetAllNthsUsersResult;
}

const getAllNthsUsersIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    *\nFROM\n    nths_group_members"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     nths_group_members
 * ```
 */
export const getAllNthsUsers = new PreparedQuery<IGetAllNthsUsersParams,IGetAllNthsUsersResult>(getAllNthsUsersIR);


/** 'InsertNthsGroupMemberRole' parameters type */
export interface IInsertNthsGroupMemberRoleParams {
  nthsGroupId: string;
  roleName: string;
  userId: string;
}

/** 'InsertNthsGroupMemberRole' return type */
export interface IInsertNthsGroupMemberRoleResult {
  nthsGroupId: string;
  roleId: number | null;
  updatedAt: Date;
  userId: string;
}

/** 'InsertNthsGroupMemberRole' query type */
export interface IInsertNthsGroupMemberRoleQuery {
  params: IInsertNthsGroupMemberRoleParams;
  result: IInsertNthsGroupMemberRoleResult;
}

const insertNthsGroupMemberRoleIR: any = {"usedParamSet":{"userId":true,"nthsGroupId":true,"roleName":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":88}]},{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":107}]},{"name":"roleName","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":187}]}],"statement":"INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)\nSELECT\n    :userId!,\n    :nthsGroupId!,\n    roles.id\nFROM\n    nths_group_roles roles\nWHERE\n    roles.name = :roleName!\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)
 * SELECT
 *     :userId!,
 *     :nthsGroupId!,
 *     roles.id
 * FROM
 *     nths_group_roles roles
 * WHERE
 *     roles.name = :roleName!
 * RETURNING
 *     *
 * ```
 */
export const insertNthsGroupMemberRole = new PreparedQuery<IInsertNthsGroupMemberRoleParams,IInsertNthsGroupMemberRoleResult>(insertNthsGroupMemberRoleIR);


/** 'UpsertNthsGroupMemberRole' parameters type */
export interface IUpsertNthsGroupMemberRoleParams {
  nthsGroupId: string;
  roleName: string;
  userId: string;
}

/** 'UpsertNthsGroupMemberRole' return type */
export interface IUpsertNthsGroupMemberRoleResult {
  nthsGroupId: string;
  roleId: number | null;
  roleName: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'UpsertNthsGroupMemberRole' query type */
export interface IUpsertNthsGroupMemberRoleQuery {
  params: IUpsertNthsGroupMemberRoleParams;
  result: IUpsertNthsGroupMemberRoleResult;
}

const upsertNthsGroupMemberRoleIR: any = {"usedParamSet":{"userId":true,"nthsGroupId":true,"roleName":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":88}]},{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":107}]},{"name":"roleName","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":187},{"a":344,"b":352}]}],"statement":"INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)\nSELECT\n    :userId!,\n    :nthsGroupId!,\n    roles.id\nFROM\n    nths_group_roles roles\nWHERE\n    roles.name = :roleName!\nON CONFLICT (user_id,\n    nths_group_id)\n    DO UPDATE SET\n        role_id = EXCLUDED.role_id,\n        updated_at = NOW()\n    RETURNING\n        *,\n        :roleName AS role_name"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)
 * SELECT
 *     :userId!,
 *     :nthsGroupId!,
 *     roles.id
 * FROM
 *     nths_group_roles roles
 * WHERE
 *     roles.name = :roleName!
 * ON CONFLICT (user_id,
 *     nths_group_id)
 *     DO UPDATE SET
 *         role_id = EXCLUDED.role_id,
 *         updated_at = NOW()
 *     RETURNING
 *         *,
 *         :roleName AS role_name
 * ```
 */
export const upsertNthsGroupMemberRole = new PreparedQuery<IUpsertNthsGroupMemberRoleParams,IUpsertNthsGroupMemberRoleResult>(upsertNthsGroupMemberRoleIR);


/** 'GetGroupMember' parameters type */
export interface IGetGroupMemberParams {
  nthsGroupId: string;
  userId: string;
}

/** 'GetGroupMember' return type */
export interface IGetGroupMemberResult {
  deactivatedAt: Date | null;
  joinedAt: Date;
  nthsGroupId: string;
  roleName: string | null;
  title: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'GetGroupMember' query type */
export interface IGetGroupMemberQuery {
  params: IGetGroupMemberParams;
  result: IGetGroupMemberResult;
}

const getGroupMemberIR: any = {"usedParamSet":{"userId":true,"nthsGroupId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":302,"b":309}]},{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":337,"b":349}]}],"statement":"SELECT\n    m.*,\n    roles.name AS role_name\nFROM\n    nths_group_members m\n    JOIN nths_group_member_roles member_roles ON member_roles.user_id = m.user_id\n        AND member_roles.nths_group_id = m.nths_group_id\n    JOIN nths_group_roles roles ON roles.id = member_roles.role_id\nWHERE\n    m.user_id = :userId!\n    AND m.nths_group_id = :nthsGroupId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     m.*,
 *     roles.name AS role_name
 * FROM
 *     nths_group_members m
 *     JOIN nths_group_member_roles member_roles ON member_roles.user_id = m.user_id
 *         AND member_roles.nths_group_id = m.nths_group_id
 *     JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 * WHERE
 *     m.user_id = :userId!
 *     AND m.nths_group_id = :nthsGroupId!
 * ```
 */
export const getGroupMember = new PreparedQuery<IGetGroupMemberParams,IGetGroupMemberResult>(getGroupMemberIR);


/** 'GetGroupMembers' parameters type */
export interface IGetGroupMembersParams {
  groupId: string;
}

/** 'GetGroupMembers' return type */
export interface IGetGroupMembersResult {
  deactivatedAt: Date | null;
  email: string;
  firstName: string;
  joinedAt: Date;
  nthsGroupId: string;
  roleName: string | null;
  title: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'GetGroupMembers' query type */
export interface IGetGroupMembersQuery {
  params: IGetGroupMembersParams;
  result: IGetGroupMembersResult;
}

const getGroupMembersIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":195,"b":203},{"a":390,"b":398}]}],"statement":"SELECT\n    ngm.*,\n    roles.name AS role_name,\n    users.email,\n    users.first_name\nFROM\n    nths_group_members ngm\n    JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!\n        AND member_roles.user_id = ngm.user_id\n    JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n    JOIN users ON users.id = ngm.user_id\nWHERE\n    ngm.nths_group_id = :groupId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ngm.*,
 *     roles.name AS role_name,
 *     users.email,
 *     users.first_name
 * FROM
 *     nths_group_members ngm
 *     JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!
 *         AND member_roles.user_id = ngm.user_id
 *     JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 *     JOIN users ON users.id = ngm.user_id
 * WHERE
 *     ngm.nths_group_id = :groupId!
 * ```
 */
export const getGroupMembers = new PreparedQuery<IGetGroupMembersParams,IGetGroupMembersResult>(getGroupMembersIR);


/** 'GroupsCount' parameters type */
export type IGroupsCountParams = void;

/** 'GroupsCount' return type */
export interface IGroupsCountResult {
  count: string | null;
}

/** 'GroupsCount' query type */
export interface IGroupsCountQuery {
  params: IGroupsCountParams;
  result: IGroupsCountResult;
}

const groupsCountIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    count(*)\nFROM\n    nths_groups"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*)
 * FROM
 *     nths_groups
 * ```
 */
export const groupsCount = new PreparedQuery<IGroupsCountParams,IGroupsCountResult>(groupsCountIR);


/** 'CreateGroup' parameters type */
export interface ICreateGroupParams {
  inviteCode: string;
  key: string;
  name: string;
}

/** 'CreateGroup' return type */
export interface ICreateGroupResult {
  createdAt: Date;
  id: string;
  inviteCode: string;
  key: string;
  name: string;
  updatedAt: Date;
}

/** 'CreateGroup' query type */
export interface ICreateGroupQuery {
  params: ICreateGroupParams;
  result: ICreateGroupResult;
}

const createGroupIR: any = {"usedParamSet":{"inviteCode":true,"name":true,"key":true},"params":[{"name":"inviteCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":94}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":97,"b":102}]},{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":109}]}],"statement":"INSERT INTO nths_groups (id, invite_code, name, KEY)\n    VALUES (generate_ulid (), :inviteCode!, :name!, :key!)\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_groups (id, invite_code, name, KEY)
 *     VALUES (generate_ulid (), :inviteCode!, :name!, :key!)
 * RETURNING
 *     *
 * ```
 */
export const createGroup = new PreparedQuery<ICreateGroupParams,ICreateGroupResult>(createGroupIR);


