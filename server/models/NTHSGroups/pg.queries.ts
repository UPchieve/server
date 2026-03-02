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
  schoolAffiliationStatus: string;
}

/** 'GetGroupsByUser' query type */
export interface IGetGroupsByUserQuery {
  params: IGetGroupsByUserParams;
  result: IGetGroupsByUserResult;
}

const getGroupsByUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":401,"b":408},{"a":762,"b":769}]}],"statement":"SELECT\n    ngm.title AS member_title,\n    ngm.joined_at,\n    ng.id AS group_id,\n    ng.name AS group_name,\n    ng.key AS group_key,\n    ng.invite_code,\n    roles.name AS role_name,\n    aff_statuses.name AS school_affiliation_status\nFROM\n    nths_group_members ngm\n    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id\n    INNER JOIN nths_group_member_roles member_roles ON member_roles.user_id = :userId!\n        AND member_roles.nths_group_id = ng.id\n    INNER JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n    LEFT JOIN nths_group_school_affiliation aff ON aff.nths_group_id = ngm.nths_group_id\n    LEFT JOIN nths_school_affiliation_statuses aff_statuses ON aff_statuses.id = aff.nths_school_affiliation_status_id\nWHERE\n    ngm.user_id = :userId!\n    AND ngm.deactivated_at IS NULL"};

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
 *     roles.name AS role_name,
 *     aff_statuses.name AS school_affiliation_status
 * FROM
 *     nths_group_members ngm
 *     INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id
 *     INNER JOIN nths_group_member_roles member_roles ON member_roles.user_id = :userId!
 *         AND member_roles.nths_group_id = ng.id
 *     INNER JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 *     LEFT JOIN nths_group_school_affiliation aff ON aff.nths_group_id = ngm.nths_group_id
 *     LEFT JOIN nths_school_affiliation_statuses aff_statuses ON aff_statuses.id = aff.nths_school_affiliation_status_id
 * WHERE
 *     ngm.user_id = :userId!
 *     AND ngm.deactivated_at IS NULL
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


/** 'GetGroupById' parameters type */
export interface IGetGroupByIdParams {
  groupId: string;
}

/** 'GetGroupById' return type */
export interface IGetGroupByIdResult {
  createdAt: Date;
  id: string;
  inviteCode: string;
  key: string;
  name: string;
}

/** 'GetGroupById' query type */
export interface IGetGroupByIdQuery {
  params: IGetGroupByIdParams;
  result: IGetGroupByIdResult;
}

const getGroupByIdIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":110}]}],"statement":"SELECT\n    id,\n    name,\n    KEY,\n    created_at,\n    invite_code\nFROM\n    nths_groups\nWHERE\n    id = :groupId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name,
 *     KEY,
 *     created_at,
 *     invite_code
 * FROM
 *     nths_groups
 * WHERE
 *     id = :groupId!
 * ```
 */
export const getGroupById = new PreparedQuery<IGetGroupByIdParams,IGetGroupByIdResult>(getGroupByIdIR);


/** 'GetNthsGroupAdminsContactInfo' parameters type */
export interface IGetNthsGroupAdminsContactInfoParams {
  groupId: string;
}

/** 'GetNthsGroupAdminsContactInfo' return type */
export interface IGetNthsGroupAdminsContactInfoResult {
  email: string;
  firstName: string;
  id: string;
  nthsGroupId: string | null;
}

/** 'GetNthsGroupAdminsContactInfo' query type */
export interface IGetNthsGroupAdminsContactInfoQuery {
  params: IGetNthsGroupAdminsContactInfoParams;
  result: IGetNthsGroupAdminsContactInfoResult;
}

const getNthsGroupAdminsContactInfoIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":52,"b":60},{"a":245,"b":253}]}],"statement":"SELECT\n    u.id,\n    u.first_name,\n    u.email,\n    :groupId!::uuid AS nths_group_id\nFROM\n    nths_group_member_roles mr\n    JOIN nths_group_roles roles ON roles.id = mr.role_id\n    JOIN users u ON U.id = mr.user_id\nWHERE\n    mr.nths_group_id = :groupId!::uuid\n    AND roles.name = 'admin'"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     u.id,
 *     u.first_name,
 *     u.email,
 *     :groupId!::uuid AS nths_group_id
 * FROM
 *     nths_group_member_roles mr
 *     JOIN nths_group_roles roles ON roles.id = mr.role_id
 *     JOIN users u ON U.id = mr.user_id
 * WHERE
 *     mr.nths_group_id = :groupId!::uuid
 *     AND roles.name = 'admin'
 * ```
 */
export const getNthsGroupAdminsContactInfo = new PreparedQuery<IGetNthsGroupAdminsContactInfoParams,IGetNthsGroupAdminsContactInfoResult>(getNthsGroupAdminsContactInfoIR);


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
  includeDeactivated?: boolean | null | void;
}

/** 'GetGroupMembers' return type */
export interface IGetGroupMembersResult {
  deactivatedAt: Date | null;
  firstName: string;
  joinedAt: Date;
  lastInitial: string | null;
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

const getGroupMembersIR: any = {"usedParamSet":{"groupId":true,"includeDeactivated":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":233,"b":241},{"a":428,"b":436}]},{"name":"includeDeactivated","required":false,"transform":{"type":"scalar"},"locs":[{"a":447,"b":465}]}],"statement":"SELECT\n    ngm.*,\n    roles.name AS role_name,\n    LEFT (users.last_name,\n        1) AS last_initial,\n    users.first_name\nFROM\n    nths_group_members ngm\n    JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!\n        AND member_roles.user_id = ngm.user_id\n    JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n    JOIN users ON users.id = ngm.user_id\nWHERE\n    ngm.nths_group_id = :groupId!\n    AND (:includeDeactivated IS TRUE\n        OR ngm.deactivated_at IS NULL)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ngm.*,
 *     roles.name AS role_name,
 *     LEFT (users.last_name,
 *         1) AS last_initial,
 *     users.first_name
 * FROM
 *     nths_group_members ngm
 *     JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!
 *         AND member_roles.user_id = ngm.user_id
 *     JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 *     JOIN users ON users.id = ngm.user_id
 * WHERE
 *     ngm.nths_group_id = :groupId!
 *     AND (:includeDeactivated IS TRUE
 *         OR ngm.deactivated_at IS NULL)
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


/** 'DeactivateGroupMember' parameters type */
export interface IDeactivateGroupMemberParams {
  groupId: string;
  userId: string;
}

/** 'DeactivateGroupMember' return type */
export type IDeactivateGroupMemberResult = void;

/** 'DeactivateGroupMember' query type */
export interface IDeactivateGroupMemberQuery {
  params: IDeactivateGroupMemberParams;
  result: IDeactivateGroupMemberResult;
}

const deactivateGroupMemberIR: any = {"usedParamSet":{"userId":true,"groupId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":112}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":146}]}],"statement":"UPDATE\n    nths_group_members\nSET\n    deactivated_at = NOW(),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\n    AND nths_group_id = :groupId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     nths_group_members
 * SET
 *     deactivated_at = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 *     AND nths_group_id = :groupId!
 * ```
 */
export const deactivateGroupMember = new PreparedQuery<IDeactivateGroupMemberParams,IDeactivateGroupMemberResult>(deactivateGroupMemberIR);


/** 'UpdateGroupName' parameters type */
export interface IUpdateGroupNameParams {
  groupId: string;
  name: string;
}

/** 'UpdateGroupName' return type */
export interface IUpdateGroupNameResult {
  createdAt: Date;
  id: string;
  inviteCode: string;
  key: string;
  name: string;
}

/** 'UpdateGroupName' query type */
export interface IUpdateGroupNameQuery {
  params: IUpdateGroupNameParams;
  result: IUpdateGroupNameResult;
}

const updateGroupNameIR: any = {"usedParamSet":{"name":true,"groupId":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":38,"b":43}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":92}]}],"statement":"UPDATE\n    nths_groups\nSET\n    name = :name!,\n    updated_at = NOW()\nWHERE\n    id = :groupId!\nRETURNING\n    id,\n    name,\n    KEY,\n    created_at,\n    invite_code"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     nths_groups
 * SET
 *     name = :name!,
 *     updated_at = NOW()
 * WHERE
 *     id = :groupId!
 * RETURNING
 *     id,
 *     name,
 *     KEY,
 *     created_at,
 *     invite_code
 * ```
 */
export const updateGroupName = new PreparedQuery<IUpdateGroupNameParams,IUpdateGroupNameResult>(updateGroupNameIR);


/** 'InsertNthsGroupAction' parameters type */
export interface IInsertNthsGroupActionParams {
  actionName: string;
  groupId: string;
}

/** 'InsertNthsGroupAction' return type */
export interface IInsertNthsGroupActionResult {
  actionId: number | null;
  actionName: string | null;
  createdAt: Date;
  groupId: string | null;
  id: number;
}

/** 'InsertNthsGroupAction' query type */
export interface IInsertNthsGroupActionQuery {
  params: IInsertNthsGroupActionParams;
  result: IInsertNthsGroupActionResult;
}

const insertNthsGroupActionIR: any = {"usedParamSet":{"groupId":true,"actionName":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":74,"b":82}]},{"name":"actionName","required":true,"transform":{"type":"scalar"},"locs":[{"a":155,"b":166},{"a":270,"b":281}]}],"statement":"INSERT INTO nths_group_actions (nths_group_id, nths_action_id)\nSELECT\n    :groupId!,\n    actions.id\nFROM\n    nths_actions actions\nWHERE\n    actions.name = :actionName!\nRETURNING\n    id,\n    nths_group_id AS group_id,\n    nths_action_id AS action_id,\n    created_at,\n    :actionName! AS action_name"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_actions (nths_group_id, nths_action_id)
 * SELECT
 *     :groupId!,
 *     actions.id
 * FROM
 *     nths_actions actions
 * WHERE
 *     actions.name = :actionName!
 * RETURNING
 *     id,
 *     nths_group_id AS group_id,
 *     nths_action_id AS action_id,
 *     created_at,
 *     :actionName! AS action_name
 * ```
 */
export const insertNthsGroupAction = new PreparedQuery<IInsertNthsGroupActionParams,IInsertNthsGroupActionResult>(insertNthsGroupActionIR);


/** 'GetAllNthsGroupActionsByGroupId' parameters type */
export interface IGetAllNthsGroupActionsByGroupIdParams {
  groupId: string;
}

/** 'GetAllNthsGroupActionsByGroupId' return type */
export interface IGetAllNthsGroupActionsByGroupIdResult {
  actionId: number | null;
  actionName: string;
  createdAt: Date;
  groupId: string | null;
  id: number;
}

/** 'GetAllNthsGroupActionsByGroupId' query type */
export interface IGetAllNthsGroupActionsByGroupIdQuery {
  params: IGetAllNthsGroupActionsByGroupIdParams;
  result: IGetAllNthsGroupActionsByGroupIdResult;
}

const getAllNthsGroupActionsByGroupIdIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":266,"b":274}]}],"statement":"SELECT\n    nga.id,\n    nga.nths_group_id AS group_id,\n    nga.nths_action_id AS action_id,\n    nga.created_at,\n    actions.name AS action_name\nFROM\n    nths_group_actions nga\n    JOIN nths_actions actions ON actions.id = nga.nths_action_id\nWHERE\n    nths_group_id = :groupId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     nga.id,
 *     nga.nths_group_id AS group_id,
 *     nga.nths_action_id AS action_id,
 *     nga.created_at,
 *     actions.name AS action_name
 * FROM
 *     nths_group_actions nga
 *     JOIN nths_actions actions ON actions.id = nga.nths_action_id
 * WHERE
 *     nths_group_id = :groupId!
 * ```
 */
export const getAllNthsGroupActionsByGroupId = new PreparedQuery<IGetAllNthsGroupActionsByGroupIdParams,IGetAllNthsGroupActionsByGroupIdResult>(getAllNthsGroupActionsByGroupIdIR);


/** 'GetNthsActions' parameters type */
export type IGetNthsActionsParams = void;

/** 'GetNthsActions' return type */
export interface IGetNthsActionsResult {
  id: number;
  name: string;
}

/** 'GetNthsActions' query type */
export interface IGetNthsActionsQuery {
  params: IGetNthsActionsParams;
  result: IGetNthsActionsResult;
}

const getNthsActionsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    actions.id,\n    actions.name\nFROM\n    nths_actions actions"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     actions.id,
 *     actions.name
 * FROM
 *     nths_actions actions
 * ```
 */
export const getNthsActions = new PreparedQuery<IGetNthsActionsParams,IGetNthsActionsResult>(getNthsActionsIR);


/** 'UpsertSchoolAffiliationStatus' parameters type */
export interface IUpsertSchoolAffiliationStatusParams {
  nthsGroupId: string;
  status: string;
}

/** 'UpsertSchoolAffiliationStatus' return type */
export interface IUpsertSchoolAffiliationStatusResult {
  createdAt: Date;
  nthsGroupId: string;
  nthsSchoolAffiliationStatusId: number;
  schoolId: string | null;
  status: string | null;
  updatedAt: Date;
}

/** 'UpsertSchoolAffiliationStatus' query type */
export interface IUpsertSchoolAffiliationStatusQuery {
  params: IUpsertSchoolAffiliationStatusParams;
  result: IUpsertSchoolAffiliationStatusResult;
}

const upsertSchoolAffiliationStatusIR: any = {"usedParamSet":{"nthsGroupId":true,"status":true},"params":[{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":116}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":212,"b":219},{"a":415,"b":422}]}],"statement":"INSERT INTO nths_group_school_affiliation (nths_group_id, nths_school_affiliation_status_id)\nSELECT\n    :nthsGroupId!,\n    statuses.id\nFROM\n    nths_school_affiliation_statuses statuses\nWHERE\n    statuses.name = :status!\nON CONFLICT (nths_group_id)\n    DO UPDATE SET\n        nths_school_affiliation_status_id = EXCLUDED.nths_school_affiliation_status_id,\n        updated_at = NOW()\n    RETURNING\n        *,\n        :status! AS status"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_school_affiliation (nths_group_id, nths_school_affiliation_status_id)
 * SELECT
 *     :nthsGroupId!,
 *     statuses.id
 * FROM
 *     nths_school_affiliation_statuses statuses
 * WHERE
 *     statuses.name = :status!
 * ON CONFLICT (nths_group_id)
 *     DO UPDATE SET
 *         nths_school_affiliation_status_id = EXCLUDED.nths_school_affiliation_status_id,
 *         updated_at = NOW()
 *     RETURNING
 *         *,
 *         :status! AS status
 * ```
 */
export const upsertSchoolAffiliationStatus = new PreparedQuery<IUpsertSchoolAffiliationStatusParams,IUpsertSchoolAffiliationStatusResult>(upsertSchoolAffiliationStatusIR);


/** 'InsertNthsAdvisor' parameters type */
export interface IInsertNthsAdvisorParams {
  email: string;
  firstName: string;
  lastName: string;
  nthsGroupId: string;
  phone?: string | null | void;
  phoneExtension?: string | null | void;
  schoolId: string;
  title: string;
}

/** 'InsertNthsAdvisor' return type */
export interface IInsertNthsAdvisorResult {
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  nthsGroupId: string;
  phone: string;
  phoneExtension: string | null;
  schoolId: string | null;
  title: string;
  updatedAt: Date;
  verified: boolean;
}

/** 'InsertNthsAdvisor' query type */
export interface IInsertNthsAdvisorQuery {
  params: IInsertNthsAdvisorParams;
  result: IInsertNthsAdvisorResult;
}

const insertNthsAdvisorIR: any = {"usedParamSet":{"nthsGroupId":true,"firstName":true,"lastName":true,"email":true,"phone":true,"phoneExtension":true,"title":true,"schoolId":true},"params":[{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":160}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":163,"b":173}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":176,"b":185}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":188,"b":194}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":202}]},{"name":"phoneExtension","required":false,"transform":{"type":"scalar"},"locs":[{"a":205,"b":219}]},{"name":"title","required":true,"transform":{"type":"scalar"},"locs":[{"a":222,"b":228}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":231,"b":240}]}],"statement":"INSERT INTO nths_advisors (id, nths_group_id, first_name, last_name, email, phone, phone_extension, title, school_id)\n    VALUES (generate_ulid (), :nthsGroupId!, :firstName!, :lastName!, :email!, :phone, :phoneExtension, :title!, :schoolId!)\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_advisors (id, nths_group_id, first_name, last_name, email, phone, phone_extension, title, school_id)
 *     VALUES (generate_ulid (), :nthsGroupId!, :firstName!, :lastName!, :email!, :phone, :phoneExtension, :title!, :schoolId!)
 * RETURNING
 *     *
 * ```
 */
export const insertNthsAdvisor = new PreparedQuery<IInsertNthsAdvisorParams,IInsertNthsAdvisorResult>(insertNthsAdvisorIR);


/** 'AddSchoolToSchoolAffiliation' parameters type */
export interface IAddSchoolToSchoolAffiliationParams {
  nthsGroupId: string;
  schoolId: string;
}

/** 'AddSchoolToSchoolAffiliation' return type */
export type IAddSchoolToSchoolAffiliationResult = void;

/** 'AddSchoolToSchoolAffiliation' query type */
export interface IAddSchoolToSchoolAffiliationQuery {
  params: IAddSchoolToSchoolAffiliationParams;
  result: IAddSchoolToSchoolAffiliationResult;
}

const addSchoolToSchoolAffiliationIR: any = {"usedParamSet":{"schoolId":true,"nthsGroupId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":61,"b":70}]},{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":134}]}],"statement":"UPDATE\n    nths_group_school_affiliation\nSET\n    school_id = :schoolId!,\n    updated_at = NOW()\nWHERE\n    nths_group_id = :nthsGroupId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     nths_group_school_affiliation
 * SET
 *     school_id = :schoolId!,
 *     updated_at = NOW()
 * WHERE
 *     nths_group_id = :nthsGroupId!
 * ```
 */
export const addSchoolToSchoolAffiliation = new PreparedQuery<IAddSchoolToSchoolAffiliationParams,IAddSchoolToSchoolAffiliationResult>(addSchoolToSchoolAffiliationIR);


/** 'GetLatestNthsChapterStatus' parameters type */
export interface IGetLatestNthsChapterStatusParams {
  groupId: string;
}

/** 'GetLatestNthsChapterStatus' return type */
export interface IGetLatestNthsChapterStatusResult {
  createdAt: Date;
  groupId: string;
  statusId: number;
  statusName: string;
}

/** 'GetLatestNthsChapterStatus' query type */
export interface IGetLatestNthsChapterStatusQuery {
  params: IGetLatestNthsChapterStatusParams;
  result: IGetLatestNthsChapterStatusResult;
}

const getLatestNthsChapterStatusIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":261,"b":269}]}],"statement":"WITH ranked_by_timestamp AS (\n    SELECT\n        nths_group_id AS group_id,\n        nths_chapter_status_id,\n        created_at,\n        ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn\n    FROM\n        nths_chapters_statuses\n    WHERE\n        nths_group_id = :groupId!\n    LIMIT 1\n)\nSELECT\n    cs.group_id,\n    cs.nths_chapter_status_id AS status_id,\n    cs.created_at,\n    statuses.name AS status_name\nFROM\n    ranked_by_timestamp cs\n    JOIN nths_chapter_statuses statuses ON statuses.id = cs.nths_chapter_status_id\nWHERE\n    cs.rn = 1"};

/**
 * Query generated from SQL:
 * ```
 * WITH ranked_by_timestamp AS (
 *     SELECT
 *         nths_group_id AS group_id,
 *         nths_chapter_status_id,
 *         created_at,
 *         ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
 *     FROM
 *         nths_chapters_statuses
 *     WHERE
 *         nths_group_id = :groupId!
 *     LIMIT 1
 * )
 * SELECT
 *     cs.group_id,
 *     cs.nths_chapter_status_id AS status_id,
 *     cs.created_at,
 *     statuses.name AS status_name
 * FROM
 *     ranked_by_timestamp cs
 *     JOIN nths_chapter_statuses statuses ON statuses.id = cs.nths_chapter_status_id
 * WHERE
 *     cs.rn = 1
 * ```
 */
export const getLatestNthsChapterStatus = new PreparedQuery<IGetLatestNthsChapterStatusParams,IGetLatestNthsChapterStatusResult>(getLatestNthsChapterStatusIR);


/** 'InsertStatusForNthsChapter' parameters type */
export interface IInsertStatusForNthsChapterParams {
  groupId: string;
  statusName: string;
}

/** 'InsertStatusForNthsChapter' return type */
export interface IInsertStatusForNthsChapterResult {
  createdAt: Date;
  groupId: string;
  statusId: number;
  statusName: string | null;
}

/** 'InsertStatusForNthsChapter' query type */
export interface IInsertStatusForNthsChapterQuery {
  params: IInsertStatusForNthsChapterParams;
  result: IInsertStatusForNthsChapterResult;
}

const insertStatusForNthsChapterIR: any = {"usedParamSet":{"groupId":true,"statusName":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":94}]},{"name":"statusName","required":true,"transform":{"type":"scalar"},"locs":[{"a":179,"b":190},{"a":294,"b":305}]}],"statement":"INSERT INTO nths_chapters_statuses (nths_group_id, nths_chapter_status_id)\nSELECT\n    :groupId!,\n    statuses.id\nFROM\n    nths_chapter_statuses statuses\nWHERE\n    statuses.name = :statusName!\nRETURNING\n    nths_group_id AS group_id,\n    nths_chapter_status_id AS status_id,\n    created_at,\n    :statusName! AS status_name"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_chapters_statuses (nths_group_id, nths_chapter_status_id)
 * SELECT
 *     :groupId!,
 *     statuses.id
 * FROM
 *     nths_chapter_statuses statuses
 * WHERE
 *     statuses.name = :statusName!
 * RETURNING
 *     nths_group_id AS group_id,
 *     nths_chapter_status_id AS status_id,
 *     created_at,
 *     :statusName! AS status_name
 * ```
 */
export const insertStatusForNthsChapter = new PreparedQuery<IInsertStatusForNthsChapterParams,IInsertStatusForNthsChapterResult>(insertStatusForNthsChapterIR);


/** 'GetAllNthsGroupsWithStatus' parameters type */
export type IGetAllNthsGroupsWithStatusParams = void;

/** 'GetAllNthsGroupsWithStatus' return type */
export interface IGetAllNthsGroupsWithStatusResult {
  groupId: string;
  schoolAffiliationStatusId: number;
  schoolAffiliationStatusName: string;
  statusId: number;
  statusName: string;
}

/** 'GetAllNthsGroupsWithStatus' query type */
export interface IGetAllNthsGroupsWithStatusQuery {
  params: IGetAllNthsGroupsWithStatusParams;
  result: IGetAllNthsGroupsWithStatusResult;
}

const getAllNthsGroupsWithStatusIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    groups.id AS group_id,\n    chapter_status.nths_chapter_status_id AS status_id,\n    chapter_statuses.name AS status_name,\n    school_aff.nths_school_affiliation_status_id AS school_affiliation_status_id,\n    school_aff_statuses.name AS school_affiliation_status_name\nFROM\n    nths_groups GROUPS\n    LEFT JOIN nths_chapters_statuses chapter_status ON chapter_status.nths_group_id = groups.id\n    LEFT JOIN nths_chapter_statuses chapter_statuses ON chapter_statuses.id = chapter_status.nths_chapter_status_id\n    LEFT JOIN nths_group_school_affiliation school_aff ON school_aff.nths_group_id = groups.id\n    LEFT JOIN nths_school_affiliation_statuses school_aff_statuses ON school_aff_statuses.id = school_aff.nths_school_affiliation_status_id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     groups.id AS group_id,
 *     chapter_status.nths_chapter_status_id AS status_id,
 *     chapter_statuses.name AS status_name,
 *     school_aff.nths_school_affiliation_status_id AS school_affiliation_status_id,
 *     school_aff_statuses.name AS school_affiliation_status_name
 * FROM
 *     nths_groups GROUPS
 *     LEFT JOIN nths_chapters_statuses chapter_status ON chapter_status.nths_group_id = groups.id
 *     LEFT JOIN nths_chapter_statuses chapter_statuses ON chapter_statuses.id = chapter_status.nths_chapter_status_id
 *     LEFT JOIN nths_group_school_affiliation school_aff ON school_aff.nths_group_id = groups.id
 *     LEFT JOIN nths_school_affiliation_statuses school_aff_statuses ON school_aff_statuses.id = school_aff.nths_school_affiliation_status_id
 * ```
 */
export const getAllNthsGroupsWithStatus = new PreparedQuery<IGetAllNthsGroupsWithStatusParams,IGetAllNthsGroupsWithStatusResult>(getAllNthsGroupsWithStatusIR);


