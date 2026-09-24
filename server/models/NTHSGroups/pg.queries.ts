/** Types generated for queries found in "server/models/NTHSGroups/nths_groups.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'GetGroupsByUser' parameters type */
export interface IGetGroupsByUserParams {
  userId: string;
}

/** 'GetGroupsByUser' return type */
export interface IGetGroupsByUserResult {
  /** not_pii: Primary key */
  groupId: string;
  /** not_pii: Unique URL-safe slug */
  groupKey: string;
  /** not_pii: Human-readable name */
  groupName: string;
  hasSchoolOnRecord: boolean | null;
  /** not_pii: Short invite code for joining the NTHS group */
  inviteCode: string;
  /** not_pii: Timestamp when the member joined the group */
  joinedAt: Date;
  /** not_pii: Title of the user in the NTHS group */
  memberTitle: string | null;
  /** not_pii: Human-readable name */
  roleName: string | null;
  /** not_pii: Human-readable name */
  schoolAffiliationStatus: string;
}

/** 'GetGroupsByUser' query type */
export interface IGetGroupsByUserQuery {
  params: IGetGroupsByUserParams;
  result: IGetGroupsByUserResult;
}

const getGroupsByUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":456,"b":463},{"a":817,"b":824}]}],"statement":"SELECT\n    ngm.title AS member_title,\n    ngm.joined_at,\n    ng.id AS group_id,\n    ng.name AS group_name,\n    ng.key AS group_key,\n    ng.invite_code,\n    roles.name AS role_name,\n    aff_statuses.name AS school_affiliation_status,\n    aff.school_id IS NOT NULL AS has_school_on_record\nFROM\n    nths_group_members ngm\n    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id\n    INNER JOIN nths_group_member_roles member_roles ON member_roles.user_id = :userId!\n        AND member_roles.nths_group_id = ng.id\n    INNER JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n    LEFT JOIN nths_group_school_affiliation aff ON aff.nths_group_id = ngm.nths_group_id\n    LEFT JOIN nths_school_affiliation_statuses aff_statuses ON aff_statuses.id = aff.nths_school_affiliation_status_id\nWHERE\n    ngm.user_id = :userId!\n    AND ngm.deactivated_at IS NULL"};

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
 *     aff_statuses.name AS school_affiliation_status,
 *     aff.school_id IS NOT NULL AS has_school_on_record
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
  /** not_pii: Short invite code for joining the NTHS group */
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Unique URL-safe slug */
  key: string;
  /** not_pii: Human-readable name */
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Short invite code for joining the NTHS group */
  inviteCode: string;
  /** not_pii: Unique URL-safe slug */
  key: string;
  /** not_pii: Human-readable name */
  name: string;
}

/** 'GetGroupById' query type */
export interface IGetGroupByIdQuery {
  params: IGetGroupByIdParams;
  result: IGetGroupByIdResult;
}

const getGroupByIdIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":110}]}],"statement":"SELECT\n    id,\n    name,\n    KEY,\n    created_at,\n    invite_code\nFROM\n    nths_groups\nWHERE\n    id = :groupId!                                                                                                                                                        "};

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
  /** not_pii: Human-readable name */
  chapterName: string;
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  nthsGroupId: string | null;
  /** not_pii: Primary key */
  userId: string;
}

/** 'GetNthsGroupAdminsContactInfo' query type */
export interface IGetNthsGroupAdminsContactInfoQuery {
  params: IGetNthsGroupAdminsContactInfoParams;
  result: IGetNthsGroupAdminsContactInfoResult;
}

const getNthsGroupAdminsContactInfoIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":99},{"a":482,"b":490}]}],"statement":"SELECT\n    u.id AS user_id,\n    u.first_name,\n    u.email,\n    g.name AS chapter_name,\n    :groupId!::uuid AS nths_group_id\nFROM\n    nths_group_member_roles mr\n    JOIN nths_group_roles roles ON roles.id = mr.role_id\n    JOIN nths_groups g ON g.id = mr.nths_group_id\n    JOIN users u ON U.id = mr.user_id\n    JOIN nths_group_members ngm ON ngm.user_id = mr.user_id\n        AND ngm.nths_group_id = mr.nths_group_id\n        AND ngm.deactivated_at IS NULL\nWHERE\n    mr.nths_group_id = :groupId!::uuid\n    AND roles.name = 'admin'\n    AND u.deleted IS NOT TRUE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     u.id AS user_id,
 *     u.first_name,
 *     u.email,
 *     g.name AS chapter_name,
 *     :groupId!::uuid AS nths_group_id
 * FROM
 *     nths_group_member_roles mr
 *     JOIN nths_group_roles roles ON roles.id = mr.role_id
 *     JOIN nths_groups g ON g.id = mr.nths_group_id
 *     JOIN users u ON U.id = mr.user_id
 *     JOIN nths_group_members ngm ON ngm.user_id = mr.user_id
 *         AND ngm.nths_group_id = mr.nths_group_id
 *         AND ngm.deactivated_at IS NULL
 * WHERE
 *     mr.nths_group_id = :groupId!::uuid
 *     AND roles.name = 'admin'
 *     AND u.deleted IS NOT TRUE
 * ```
 */
export const getNthsGroupAdminsContactInfo = new PreparedQuery<IGetNthsGroupAdminsContactInfoParams,IGetNthsGroupAdminsContactInfoResult>(getNthsGroupAdminsContactInfoIR);


/** 'GetAdvisorContactInfo' parameters type */
export interface IGetAdvisorContactInfoParams {
  groupId: string;
}

/** 'GetAdvisorContactInfo' return type */
export interface IGetAdvisorContactInfoResult {
  /** not_pii: Human-readable name */
  chapterName: string;
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  /** pii: Last name */
  lastName: string;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
}

/** 'GetAdvisorContactInfo' query type */
export interface IGetAdvisorContactInfoQuery {
  params: IGetAdvisorContactInfoParams;
  result: IGetAdvisorContactInfoResult;
}

const getAdvisorContactInfoIR: any = {"usedParamSet":{"groupId":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":205,"b":213}]}],"statement":"SELECT\n    first_name,\n    last_name,\n    email,\n    nths_group_id,\n    g.name AS chapter_name\nFROM\n    nths_advisors\n    JOIN nths_groups g ON g.id = nths_advisors.nths_group_id\nWHERE\n    nths_group_id = :groupId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     first_name,
 *     last_name,
 *     email,
 *     nths_group_id,
 *     g.name AS chapter_name
 * FROM
 *     nths_advisors
 *     JOIN nths_groups g ON g.id = nths_advisors.nths_group_id
 * WHERE
 *     nths_group_id = :groupId!
 * ```
 */
export const getAdvisorContactInfo = new PreparedQuery<IGetAdvisorContactInfoParams,IGetAdvisorContactInfoResult>(getAdvisorContactInfoIR);


/** 'JoinGroupById' parameters type */
export interface IJoinGroupByIdParams {
  groupId: string;
  title: string;
  userId: string;
}

/** 'JoinGroupById' return type */
export interface IJoinGroupByIdResult {
  /** not_pii: Timestamp when the membership was deactivated */
  deactivatedAt: Date | null;
  /** not_pii: Timestamp when the member joined the group */
  joinedAt: Date;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Title of the user in the NTHS group */
  title: string | null;
  /** not_pii: Timestamp when the record was last updated */
  updatedAt: Date;
  /** not_pii: Foreign key to upchieve.users */
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
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Foreign key to upchieve.nths_group_roles */
  roleId: number | null;
  /** not_pii: Timestamp when the record was last updated */
  updatedAt: Date;
  /** not_pii: Foreign key to upchieve.users */
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
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Foreign key to upchieve.nths_group_roles */
  roleId: number | null;
  roleName: string | null;
  /** not_pii: Timestamp when the record was last updated */
  updatedAt: Date;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'UpsertNthsGroupMemberRole' query type */
export interface IUpsertNthsGroupMemberRoleQuery {
  params: IUpsertNthsGroupMemberRoleParams;
  result: IUpsertNthsGroupMemberRoleResult;
}

const upsertNthsGroupMemberRoleIR: any = {"usedParamSet":{"userId":true,"nthsGroupId":true,"roleName":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":88}]},{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":107}]},{"name":"roleName","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":187},{"a":344,"b":352}]}],"statement":"INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)\nSELECT\n    :userId!,\n    :nthsGroupId!,\n    roles.id\nFROM\n    nths_group_roles roles\nWHERE\n    roles.name = :roleName!\nON CONFLICT (user_id,\n    nths_group_id)\n    DO UPDATE SET\n        role_id = EXCLUDED.role_id,\n        updated_at = NOW()\n    RETURNING\n        *,\n        :roleName AS role_name                                                                                                                                                 "};

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


/** 'GetActiveGroupMember' parameters type */
export interface IGetActiveGroupMemberParams {
  nthsGroupId: string;
  userId: string;
}

/** 'GetActiveGroupMember' return type */
export interface IGetActiveGroupMemberResult {
  /** not_pii: Timestamp when the membership was deactivated */
  deactivatedAt: Date | null;
  /** not_pii: Timestamp when the member joined the group */
  joinedAt: Date;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Human-readable name */
  roleName: string | null;
  /** not_pii: Title of the user in the NTHS group */
  title: string | null;
  /** not_pii: Timestamp when the record was last updated */
  updatedAt: Date;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetActiveGroupMember' query type */
export interface IGetActiveGroupMemberQuery {
  params: IGetActiveGroupMemberParams;
  result: IGetActiveGroupMemberResult;
}

const getActiveGroupMemberIR: any = {"usedParamSet":{"userId":true,"nthsGroupId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":302,"b":309}]},{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":337,"b":349}]}],"statement":"SELECT\n    m.*,\n    roles.name AS role_name\nFROM\n    nths_group_members m\n    JOIN nths_group_member_roles member_roles ON member_roles.user_id = m.user_id\n        AND member_roles.nths_group_id = m.nths_group_id\n    JOIN nths_group_roles roles ON roles.id = member_roles.role_id\nWHERE\n    m.user_id = :userId!\n    AND m.nths_group_id = :nthsGroupId!\n    AND m.deactivated_at IS NULL"};

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
 *     AND m.deactivated_at IS NULL
 * ```
 */
export const getActiveGroupMember = new PreparedQuery<IGetActiveGroupMemberParams,IGetActiveGroupMemberResult>(getActiveGroupMemberIR);


/** 'GetGroupMembers' parameters type */
export interface IGetGroupMembersParams {
  excludeClosedAccounts?: boolean | null | void;
  groupId: string;
  includeDeactivated?: boolean | null | void;
}

/** 'GetGroupMembers' return type */
export interface IGetGroupMembersResult {
  /** not_pii: Timestamp when the membership was deactivated */
  deactivatedAt: Date | null;
  deleted: boolean | null;
  /** pii: First name */
  firstName: string;
  /** not_pii: Timestamp when the member joined the group */
  joinedAt: Date;
  lastInitial: string | null;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Human-readable name */
  roleName: string | null;
  /** not_pii: Title of the user in the NTHS group */
  title: string | null;
  /** not_pii: Timestamp when the record was last updated */
  updatedAt: Date;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetGroupMembers' query type */
export interface IGetGroupMembersQuery {
  params: IGetGroupMembersParams;
  result: IGetGroupMembersResult;
}

const getGroupMembersIR: any = {"usedParamSet":{"groupId":true,"includeDeactivated":true,"excludeClosedAccounts":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":271,"b":279},{"a":466,"b":474}]},{"name":"includeDeactivated","required":false,"transform":{"type":"scalar"},"locs":[{"a":485,"b":503}]},{"name":"excludeClosedAccounts","required":false,"transform":{"type":"scalar"},"locs":[{"a":561,"b":582}]}],"statement":"SELECT\n    ngm.*,\n    roles.name AS role_name,\n    LEFT (users.last_name,\n        1) AS last_initial,\n    users.first_name,\n    users.deleted IS TRUE AS deleted\nFROM\n    nths_group_members ngm\n    JOIN nths_group_member_roles member_roles ON member_roles.nths_group_id = :groupId!\n        AND member_roles.user_id = ngm.user_id\n    JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n    JOIN users ON users.id = ngm.user_id\nWHERE\n    ngm.nths_group_id = :groupId!\n    AND (:includeDeactivated IS TRUE\n        OR ngm.deactivated_at IS NULL)\n    AND (:excludeClosedAccounts IS NOT TRUE\n        OR users.deleted IS NOT TRUE)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ngm.*,
 *     roles.name AS role_name,
 *     LEFT (users.last_name,
 *         1) AS last_initial,
 *     users.first_name,
 *     users.deleted IS TRUE AS deleted
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
 *     AND (:excludeClosedAccounts IS NOT TRUE
 *         OR users.deleted IS NOT TRUE)
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Short invite code for joining the NTHS group */
  inviteCode: string;
  /** not_pii: Unique URL-safe slug */
  key: string;
  /** not_pii: Human-readable name */
  name: string;
  /** not_pii: Whether the NTHS chapter is receiving support from a partnership coordinator */
  receivingCoordinatorSupport: boolean;
  /** not_pii */
  updatedAt: Date;
}

/** 'CreateGroup' query type */
export interface ICreateGroupQuery {
  params: ICreateGroupParams;
  result: ICreateGroupResult;
}

const createGroupIR: any = {"usedParamSet":{"inviteCode":true,"name":true,"key":true},"params":[{"name":"inviteCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":94}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":97,"b":102}]},{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":109}]}],"statement":"INSERT INTO nths_groups (id, invite_code, name, KEY)\n    VALUES (generate_ulid (), :inviteCode!, :name!, :key!)\nRETURNING\n    *                                                                                                                             "};

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

const deactivateGroupMemberIR: any = {"usedParamSet":{"userId":true,"groupId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":112}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":146}]}],"statement":"UPDATE\n    nths_group_members\nSET\n    deactivated_at = NOW(),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\n    AND nths_group_id = :groupId!\n    AND deactivated_at IS NULL"};

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
 *     AND deactivated_at IS NULL
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Short invite code for joining the NTHS group */
  inviteCode: string;
  /** not_pii: Unique URL-safe slug */
  key: string;
  /** not_pii: Human-readable name */
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
  /** not_pii: Foreign key to upchieve.nths_actions */
  actionId: number | null;
  actionName: string | null;
  /** not_pii */
  createdAt: Date;
  /** not_pii: Foreign key to upchieve.nths_groups */
  groupId: string | null;
  /** not_pii: Primary key */
  id: number;
}

/** 'InsertNthsGroupAction' query type */
export interface IInsertNthsGroupActionQuery {
  params: IInsertNthsGroupActionParams;
  result: IInsertNthsGroupActionResult;
}

const insertNthsGroupActionIR: any = {"usedParamSet":{"groupId":true,"actionName":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":74,"b":82}]},{"name":"actionName","required":true,"transform":{"type":"scalar"},"locs":[{"a":155,"b":166},{"a":270,"b":281}]}],"statement":"INSERT INTO nths_group_actions (nths_group_id, nths_action_id)\nSELECT\n    :groupId!,\n    actions.id\nFROM\n    nths_actions actions\nWHERE\n    actions.name = :actionName!\nRETURNING\n    id,\n    nths_group_id AS group_id,\n    nths_action_id AS action_id,\n    created_at,\n    :actionName! AS action_name                                                                                                                                  "};

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


/** 'DeleteNthsGroupAction' parameters type */
export interface IDeleteNthsGroupActionParams {
  actionName: string;
  groupId: string;
}

/** 'DeleteNthsGroupAction' return type */
export type IDeleteNthsGroupActionResult = void;

/** 'DeleteNthsGroupAction' query type */
export interface IDeleteNthsGroupActionQuery {
  params: IDeleteNthsGroupActionParams;
  result: IDeleteNthsGroupActionResult;
}

const deleteNthsGroupActionIR: any = {"usedParamSet":{"groupId":true,"actionName":true},"params":[{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":53,"b":61}]},{"name":"actionName","required":true,"transform":{"type":"scalar"},"locs":[{"a":192,"b":203}]}],"statement":"DELETE FROM nths_group_actions\nWHERE nths_group_id = :groupId!\n    AND nths_action_id IN (\n        SELECT\n            id\n        FROM\n            nths_actions\n        WHERE\n            name = :actionName!)"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM nths_group_actions
 * WHERE nths_group_id = :groupId!
 *     AND nths_action_id IN (
 *         SELECT
 *             id
 *         FROM
 *             nths_actions
 *         WHERE
 *             name = :actionName!)
 * ```
 */
export const deleteNthsGroupAction = new PreparedQuery<IDeleteNthsGroupActionParams,IDeleteNthsGroupActionResult>(deleteNthsGroupActionIR);


/** 'GetAllNthsGroupActionsByGroupId' parameters type */
export interface IGetAllNthsGroupActionsByGroupIdParams {
  groupId: string;
}

/** 'GetAllNthsGroupActionsByGroupId' return type */
export interface IGetAllNthsGroupActionsByGroupIdResult {
  /** not_pii: Foreign key to upchieve.nths_actions */
  actionId: number | null;
  /** not_pii: Human-readable name */
  actionName: string;
  /** not_pii */
  createdAt: Date;
  /** not_pii: Foreign key to upchieve.nths_groups */
  groupId: string | null;
  /** not_pii: Primary key */
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
  /** not_pii: Primary key */
  id: number;
  /** not_pii: Human-readable name */
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Foreign key to upchieve.nths_school_affiliation_statuses */
  nthsSchoolAffiliationStatusId: number;
  /** not_pii: Foreign key to upchieve.schools */
  schoolId: string | null;
  status: string | null;
  /** not_pii */
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


/** 'InsertSchoolAffiliation' parameters type */
export interface IInsertSchoolAffiliationParams {
  nthsGroupId: string;
  schoolId: string;
  status: string;
}

/** 'InsertSchoolAffiliation' return type */
export interface IInsertSchoolAffiliationResult {
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
}

/** 'InsertSchoolAffiliation' query type */
export interface IInsertSchoolAffiliationQuery {
  params: IInsertSchoolAffiliationParams;
  result: IInsertSchoolAffiliationResult;
}

const insertSchoolAffiliationIR: any = {"usedParamSet":{"nthsGroupId":true,"schoolId":true,"status":true},"params":[{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":115,"b":127}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":160}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":239,"b":246}]}],"statement":"INSERT INTO nths_group_school_affiliation (nths_group_id, nths_school_affiliation_status_id, school_id)\nSELECT\n    :nthsGroupId!,\n    statuses.id,\n    :schoolId!\nFROM\n    nths_school_affiliation_statuses statuses\nWHERE\n    statuses.name = :status!\nRETURNING\n    nths_group_id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_school_affiliation (nths_group_id, nths_school_affiliation_status_id, school_id)
 * SELECT
 *     :nthsGroupId!,
 *     statuses.id,
 *     :schoolId!
 * FROM
 *     nths_school_affiliation_statuses statuses
 * WHERE
 *     statuses.name = :status!
 * RETURNING
 *     nths_group_id
 * ```
 */
export const insertSchoolAffiliation = new PreparedQuery<IInsertSchoolAffiliationParams,IInsertSchoolAffiliationResult>(insertSchoolAffiliationIR);


/** 'InsertNthsAdvisor' parameters type */
export interface IInsertNthsAdvisorParams {
  email: string;
  firstName: string;
  lastName: string;
  nthsGroupId: string;
  phone?: string | null | void;
  phoneExtension?: string | null | void;
  schoolId?: string | null | void;
  title: string;
}

/** 'InsertNthsAdvisor' return type */
export interface IInsertNthsAdvisorResult {
  /** not_pii */
  createdAt: Date;
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  /** not_pii: Primary key */
  id: string;
  /** pii: Last name */
  lastName: string;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** pii: Phone number */
  phone: string | null;
  /** pii: Phone extension for the contact */
  phoneExtension: string | null;
  /** not_pii: Foreign key to upchieve.schools */
  schoolId: string | null;
  /** pii: Professional title of the NTHS advisor */
  title: string;
  /** not_pii */
  updatedAt: Date;
  /** not_pii: Whether the advisor has been verified */
  verified: boolean;
}

/** 'InsertNthsAdvisor' query type */
export interface IInsertNthsAdvisorQuery {
  params: IInsertNthsAdvisorParams;
  result: IInsertNthsAdvisorResult;
}

const insertNthsAdvisorIR: any = {"usedParamSet":{"nthsGroupId":true,"firstName":true,"lastName":true,"email":true,"phone":true,"phoneExtension":true,"title":true,"schoolId":true},"params":[{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":160}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":163,"b":173}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":176,"b":185}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":188,"b":194}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":202}]},{"name":"phoneExtension","required":false,"transform":{"type":"scalar"},"locs":[{"a":205,"b":219}]},{"name":"title","required":true,"transform":{"type":"scalar"},"locs":[{"a":222,"b":228}]},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":231,"b":239}]}],"statement":"INSERT INTO nths_advisors (id, nths_group_id, first_name, last_name, email, phone, phone_extension, title, school_id)\n    VALUES (generate_ulid (), :nthsGroupId!, :firstName!, :lastName!, :email!, :phone, :phoneExtension, :title!, :schoolId)\nRETURNING\n    *                                                                                                                                                                                                                                             "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_advisors (id, nths_group_id, first_name, last_name, email, phone, phone_extension, title, school_id)
 *     VALUES (generate_ulid (), :nthsGroupId!, :firstName!, :lastName!, :email!, :phone, :phoneExtension, :title!, :schoolId)
 * RETURNING
 *     *                                                                                                                                                                                                                                             
 * ```
 */
export const insertNthsAdvisor = new PreparedQuery<IInsertNthsAdvisorParams,IInsertNthsAdvisorResult>(insertNthsAdvisorIR);


/** 'AddSchoolToSchoolAffiliation' parameters type */
export interface IAddSchoolToSchoolAffiliationParams {
  nthsGroupId: string;
  schoolId?: string | null | void;
}

/** 'AddSchoolToSchoolAffiliation' return type */
export interface IAddSchoolToSchoolAffiliationResult {
  mismatched: boolean | null;
  /** not_pii: Foreign key to upchieve.schools */
  schoolId: string | null;
}

/** 'AddSchoolToSchoolAffiliation' query type */
export interface IAddSchoolToSchoolAffiliationQuery {
  params: IAddSchoolToSchoolAffiliationParams;
  result: IAddSchoolToSchoolAffiliationResult;
}

const addSchoolToSchoolAffiliationIR: any = {"usedParamSet":{"schoolId":true,"nthsGroupId":true},"params":[{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":81,"b":89},{"a":185,"b":193},{"a":248,"b":256}]},{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":154}]}],"statement":"UPDATE\n    nths_group_school_affiliation\nSET\n    school_id = COALESCE(school_id, :schoolId),\n    updated_at = NOW()\nWHERE\n    nths_group_id = :nthsGroupId!\nRETURNING\n    school_id,\n    :schoolId::uuid IS NOT NULL\n    AND school_id IS DISTINCT FROM :schoolId AS mismatched"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     nths_group_school_affiliation
 * SET
 *     school_id = COALESCE(school_id, :schoolId),
 *     updated_at = NOW()
 * WHERE
 *     nths_group_id = :nthsGroupId!
 * RETURNING
 *     school_id,
 *     :schoolId::uuid IS NOT NULL
 *     AND school_id IS DISTINCT FROM :schoolId AS mismatched
 * ```
 */
export const addSchoolToSchoolAffiliation = new PreparedQuery<IAddSchoolToSchoolAffiliationParams,IAddSchoolToSchoolAffiliationResult>(addSchoolToSchoolAffiliationIR);


/** 'GetLatestNthsChapterStatus' parameters type */
export interface IGetLatestNthsChapterStatusParams {
  groupId: string;
}

/** 'GetLatestNthsChapterStatus' return type */
export interface IGetLatestNthsChapterStatusResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Foreign key to upchieve.nths_groups */
  groupId: string;
  /** not_pii: Foreign key to upchieve.nths_chapter_statuses */
  statusId: number;
  /** not_pii: Human-readable name */
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
  /** not_pii */
  createdAt: Date;
  /** not_pii: Foreign key to upchieve.nths_groups */
  groupId: string;
  /** not_pii: Foreign key to upchieve.nths_chapter_statuses */
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
  /** not_pii: Primary key */
  groupId: string;
  /** not_pii: Foreign key to upchieve.nths_school_affiliation_statuses */
  schoolAffiliationStatusId: number;
  /** not_pii: Human-readable name */
  schoolAffiliationStatusName: string;
  /** not_pii: Foreign key to upchieve.nths_chapter_statuses */
  statusId: number;
  /** not_pii: Human-readable name */
  statusName: string;
}

/** 'GetAllNthsGroupsWithStatus' query type */
export interface IGetAllNthsGroupsWithStatusQuery {
  params: IGetAllNthsGroupsWithStatusParams;
  result: IGetAllNthsGroupsWithStatusResult;
}

const getAllNthsGroupsWithStatusIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    groups.id AS group_id,\n    chapter_status.nths_chapter_status_id AS status_id,\n    chapter_statuses.name AS status_name,\n    school_aff.nths_school_affiliation_status_id AS school_affiliation_status_id,\n    school_aff_statuses.name AS school_affiliation_status_name\nFROM\n    nths_groups GROUPS\n    LEFT JOIN nths_chapters_statuses chapter_status ON chapter_status.nths_group_id = groups.id\n    LEFT JOIN nths_chapter_statuses chapter_statuses ON chapter_statuses.id = chapter_status.nths_chapter_status_id\n    LEFT JOIN nths_group_school_affiliation school_aff ON school_aff.nths_group_id = groups.id\n    LEFT JOIN nths_school_affiliation_statuses school_aff_statuses ON school_aff_statuses.id = school_aff.nths_school_affiliation_status_id                                                                                                                                                                                                                                                                                                                                                               "};

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


/** 'GetNthsChapterImpact' parameters type */
export interface IGetNthsChapterImpactParams {
  endsAt: DateOrString;
  groupId: string;
  minSessionLength: number;
  startsAt: DateOrString;
}

/** 'GetNthsChapterImpact' return type */
export interface IGetNthsChapterImpactResult {
  hoursTutoredAllTime: number | null;
  hoursTutoredThisYear: number | null;
  membersTutoringThisYear: number | null;
  sessionsCompletedAllTime: number | null;
  sessionsCompletedThisYear: number | null;
  studentsHelpedAllTime: number | null;
  studentsHelpedThisYear: number | null;
}

/** 'GetNthsChapterImpact' query type */
export interface IGetNthsChapterImpactQuery {
  params: IGetNthsChapterImpactParams;
  result: IGetNthsChapterImpactResult;
}

const getNthsChapterImpactIR: any = {"usedParamSet":{"startsAt":true,"endsAt":true,"minSessionLength":true,"groupId":true},"params":[{"name":"startsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":68},{"a":276,"b":285},{"a":513,"b":522},{"a":809,"b":818}]},{"name":"endsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":113},{"a":323,"b":330},{"a":568,"b":575},{"a":856,"b":863}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":1153,"b":1170}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1440,"b":1448}]}],"statement":"SELECT\n    count(*) FILTER (WHERE s.volunteer_joined_at >= :startsAt!\n        AND s.volunteer_joined_at < :endsAt!)::int AS sessions_completed_this_year,\n    count(*)::int AS sessions_completed_all_time,\n    count(DISTINCT s.student_id) FILTER (WHERE s.volunteer_joined_at >= :startsAt!\n        AND s.volunteer_joined_at < :endsAt!)::int AS students_helped_this_year,\n    count(DISTINCT s.student_id)::int AS students_helped_all_time,\n    round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :startsAt!\n                AND s.volunteer_joined_at < :endsAt!), 0) / 3600000::numeric, 2)::float AS hours_tutored_this_year,\n    round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_tutored_all_time,\n    count(DISTINCT m.user_id) FILTER (WHERE s.volunteer_joined_at >= :startsAt!\n        AND s.volunteer_joined_at < :endsAt!\n        AND m.deactivated_at IS NULL\n        AND u.deleted IS NOT TRUE)::int AS members_tutoring_this_year\nFROM\n    nths_group_members m\n    JOIN users u ON u.id = m.user_id\n    JOIN sessions s ON s.volunteer_id = m.user_id\n        AND s.ended_at IS NOT NULL\n        AND s.time_tutored > :minSessionLength!::int\n        AND s.volunteer_joined_at >= m.joined_at\n        AND (m.deactivated_at IS NULL\n            OR s.volunteer_joined_at < m.deactivated_at)\n    JOIN users student ON student.id = s.student_id\n        AND student.test_user IS FALSE\nWHERE\n    m.nths_group_id = :groupId!\n    AND u.test_user IS FALSE                                                                                                                                      "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
 *         AND s.volunteer_joined_at < :endsAt!)::int AS sessions_completed_this_year,
 *     count(*)::int AS sessions_completed_all_time,
 *     count(DISTINCT s.student_id) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
 *         AND s.volunteer_joined_at < :endsAt!)::int AS students_helped_this_year,
 *     count(DISTINCT s.student_id)::int AS students_helped_all_time,
 *     round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
 *                 AND s.volunteer_joined_at < :endsAt!), 0) / 3600000::numeric, 2)::float AS hours_tutored_this_year,
 *     round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_tutored_all_time,
 *     count(DISTINCT m.user_id) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
 *         AND s.volunteer_joined_at < :endsAt!
 *         AND m.deactivated_at IS NULL
 *         AND u.deleted IS NOT TRUE)::int AS members_tutoring_this_year
 * FROM
 *     nths_group_members m
 *     JOIN users u ON u.id = m.user_id
 *     JOIN sessions s ON s.volunteer_id = m.user_id
 *         AND s.ended_at IS NOT NULL
 *         AND s.time_tutored > :minSessionLength!::int
 *         AND s.volunteer_joined_at >= m.joined_at
 *         AND (m.deactivated_at IS NULL
 *             OR s.volunteer_joined_at < m.deactivated_at)
 *     JOIN users student ON student.id = s.student_id
 *         AND student.test_user IS FALSE
 * WHERE
 *     m.nths_group_id = :groupId!
 *     AND u.test_user IS FALSE                                                                                                                                      
 * ```
 */
export const getNthsChapterImpact = new PreparedQuery<IGetNthsChapterImpactParams,IGetNthsChapterImpactResult>(getNthsChapterImpactIR);


/** 'GetNthsChapterRoster' parameters type */
export interface IGetNthsChapterRosterParams {
  endsAt: DateOrString;
  groupId: string;
  lastTwoWeeksStartsAt: DateOrString;
  minSessionLength: number;
  monthStartsAt: DateOrString;
  periodEndsAt: DateOrString;
  startsAt: DateOrString;
  weekStartsAt: DateOrString;
}

/** 'GetNthsChapterRoster' return type */
export interface IGetNthsChapterRosterResult {
  accountClosed: boolean | null;
  /** pii: First name */
  firstName: string;
  hoursAllTime: number | null;
  hoursLastTwoWeeks: number | null;
  hoursThisMonth: number | null;
  hoursThisWeek: number | null;
  hoursThisYear: number | null;
  /** not_pii: Timestamp when the member joined the group */
  joinedAt: Date;
  lastActiveAt: Date | null;
  lastInitial: string | null;
  /** not_pii: Human-readable name */
  roleName: string | null;
  safetyApproved: boolean | null;
  sessionsAllTime: number | null;
  sessionsLastTwoWeeks: number | null;
  sessionsThisMonth: number | null;
  sessionsThisWeek: number | null;
  sessionsThisYear: number | null;
  /** not_pii: Title of the user in the NTHS group */
  title: string | null;
  trainingComplete: boolean | null;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetNthsChapterRoster' query type */
export interface IGetNthsChapterRosterQuery {
  params: IGetNthsChapterRosterParams;
  result: IGetNthsChapterRosterResult;
}

const getNthsChapterRosterIR: any = {"usedParamSet":{"startsAt":true,"endsAt":true,"weekStartsAt":true,"periodEndsAt":true,"lastTwoWeeksStartsAt":true,"monthStartsAt":true,"minSessionLength":true,"groupId":true},"params":[{"name":"startsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":1032,"b":1041},{"a":1219,"b":1228}]},{"name":"endsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":1091,"b":1098},{"a":1286,"b":1293}]},{"name":"weekStartsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":1440,"b":1453},{"a":2226,"b":2239}]},{"name":"periodEndsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":1511,"b":1524},{"a":1750,"b":1763},{"a":1987,"b":2000},{"a":2289,"b":2302},{"a":2468,"b":2481},{"a":2645,"b":2658}]},{"name":"lastTwoWeeksStartsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":1671,"b":1692},{"a":2397,"b":2418}]},{"name":"monthStartsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":1915,"b":1929},{"a":2581,"b":2595}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":3079,"b":3096}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":3300,"b":3308}]}],"statement":"SELECT\n    m.user_id,\n    m.title,\n    m.joined_at,\n    u.first_name,\n    LEFT (u.last_name,\n        1) AS last_initial,\n    roles.name AS role_name,\n    COALESCE(vp.onboarded, FALSE) AS training_complete,\n    COALESCE(vp.approved, FALSE) AS safety_approved,\n    u.deleted IS TRUE AS account_closed,\n    act.sessions_this_year,\n    act.hours_this_year,\n    act.hours_this_week,\n    act.hours_last_two_weeks,\n    act.hours_this_month,\n    act.hours_all_time,\n    act.sessions_this_week,\n    act.sessions_last_two_weeks,\n    act.sessions_this_month,\n    act.sessions_all_time,\n    act.last_active_at\nFROM\n    nths_group_members m\n    JOIN users u ON u.id = m.user_id\n    JOIN nths_group_member_roles member_roles ON member_roles.user_id = m.user_id\n        AND member_roles.nths_group_id = m.nths_group_id\n    JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n    LEFT JOIN volunteer_profiles vp ON vp.user_id = m.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            count(*) FILTER (WHERE s.volunteer_joined_at >= :startsAt!\n                    AND s.volunteer_joined_at < :endsAt!)::int AS sessions_this_year,\n                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :startsAt!\n                            AND s.volunteer_joined_at < :endsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_year,\n                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :weekStartsAt!\n                            AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_week,\n                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :lastTwoWeeksStartsAt!\n                            AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_last_two_weeks,\n                round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :monthStartsAt!\n                            AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_month,\n                round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_all_time,\n                count(*) FILTER (WHERE s.volunteer_joined_at >= :weekStartsAt!\n                    AND s.volunteer_joined_at < :periodEndsAt!)::int AS sessions_this_week,\n                count(*) FILTER (WHERE s.volunteer_joined_at >= :lastTwoWeeksStartsAt!\n                    AND s.volunteer_joined_at < :periodEndsAt!)::int AS sessions_last_two_weeks,\n                count(*) FILTER (WHERE s.volunteer_joined_at >= :monthStartsAt!\n                    AND s.volunteer_joined_at < :periodEndsAt!)::int AS sessions_this_month,\n                count(*)::int AS sessions_all_time,\n                max(s.volunteer_joined_at) AS last_active_at\n            FROM\n                sessions s\n            JOIN users student ON student.id = s.student_id\n                AND student.test_user IS FALSE\n        WHERE\n            s.volunteer_id = m.user_id\n            AND s.ended_at IS NOT NULL\n            AND s.time_tutored > :minSessionLength!::int\n            AND s.volunteer_joined_at >= m.joined_at\n            AND (m.deactivated_at IS NULL\n                OR s.volunteer_joined_at < m.deactivated_at)) act ON TRUE\nWHERE\n    m.nths_group_id = :groupId!\n    AND m.deactivated_at IS NULL\n    AND u.test_user IS FALSE\nORDER BY\n    u.first_name,\n    m.user_id                                                                                                                                                                                               "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     m.user_id,
 *     m.title,
 *     m.joined_at,
 *     u.first_name,
 *     LEFT (u.last_name,
 *         1) AS last_initial,
 *     roles.name AS role_name,
 *     COALESCE(vp.onboarded, FALSE) AS training_complete,
 *     COALESCE(vp.approved, FALSE) AS safety_approved,
 *     u.deleted IS TRUE AS account_closed,
 *     act.sessions_this_year,
 *     act.hours_this_year,
 *     act.hours_this_week,
 *     act.hours_last_two_weeks,
 *     act.hours_this_month,
 *     act.hours_all_time,
 *     act.sessions_this_week,
 *     act.sessions_last_two_weeks,
 *     act.sessions_this_month,
 *     act.sessions_all_time,
 *     act.last_active_at
 * FROM
 *     nths_group_members m
 *     JOIN users u ON u.id = m.user_id
 *     JOIN nths_group_member_roles member_roles ON member_roles.user_id = m.user_id
 *         AND member_roles.nths_group_id = m.nths_group_id
 *     JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 *     LEFT JOIN volunteer_profiles vp ON vp.user_id = m.user_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             count(*) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
 *                     AND s.volunteer_joined_at < :endsAt!)::int AS sessions_this_year,
 *                 round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :startsAt!
 *                             AND s.volunteer_joined_at < :endsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_year,
 *                 round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :weekStartsAt!
 *                             AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_week,
 *                 round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :lastTwoWeeksStartsAt!
 *                             AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_last_two_weeks,
 *                 round(COALESCE(sum(s.time_tutored) FILTER (WHERE s.volunteer_joined_at >= :monthStartsAt!
 *                             AND s.volunteer_joined_at < :periodEndsAt!), 0) / 3600000::numeric, 2)::float AS hours_this_month,
 *                 round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_all_time,
 *                 count(*) FILTER (WHERE s.volunteer_joined_at >= :weekStartsAt!
 *                     AND s.volunteer_joined_at < :periodEndsAt!)::int AS sessions_this_week,
 *                 count(*) FILTER (WHERE s.volunteer_joined_at >= :lastTwoWeeksStartsAt!
 *                     AND s.volunteer_joined_at < :periodEndsAt!)::int AS sessions_last_two_weeks,
 *                 count(*) FILTER (WHERE s.volunteer_joined_at >= :monthStartsAt!
 *                     AND s.volunteer_joined_at < :periodEndsAt!)::int AS sessions_this_month,
 *                 count(*)::int AS sessions_all_time,
 *                 max(s.volunteer_joined_at) AS last_active_at
 *             FROM
 *                 sessions s
 *             JOIN users student ON student.id = s.student_id
 *                 AND student.test_user IS FALSE
 *         WHERE
 *             s.volunteer_id = m.user_id
 *             AND s.ended_at IS NOT NULL
 *             AND s.time_tutored > :minSessionLength!::int
 *             AND s.volunteer_joined_at >= m.joined_at
 *             AND (m.deactivated_at IS NULL
 *                 OR s.volunteer_joined_at < m.deactivated_at)) act ON TRUE
 * WHERE
 *     m.nths_group_id = :groupId!
 *     AND m.deactivated_at IS NULL
 *     AND u.test_user IS FALSE
 * ORDER BY
 *     u.first_name,
 *     m.user_id                                                                                                                                                                                               
 * ```
 */
export const getNthsChapterRoster = new PreparedQuery<IGetNthsChapterRosterParams,IGetNthsChapterRosterResult>(getNthsChapterRosterIR);


/** 'GetNthsChapterTopTutor' parameters type */
export interface IGetNthsChapterTopTutorParams {
  endsAt: DateOrString;
  groupId: string;
  minSessionLength: number;
  startsAt: DateOrString;
}

/** 'GetNthsChapterTopTutor' return type */
export interface IGetNthsChapterTopTutorResult {
  /** pii: First name */
  firstName: string;
  hoursTutored: number | null;
  lastInitial: string | null;
  sessionsCompleted: number | null;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'GetNthsChapterTopTutor' query type */
export interface IGetNthsChapterTopTutorQuery {
  params: IGetNthsChapterTopTutorParams;
  result: IGetNthsChapterTopTutorResult;
}

const getNthsChapterTopTutorIR: any = {"usedParamSet":{"minSessionLength":true,"startsAt":true,"endsAt":true,"groupId":true},"params":[{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":390,"b":407}]},{"name":"startsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":595,"b":604}]},{"name":"endsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":642,"b":649}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":770,"b":778}]}],"statement":"SELECT\n    m.user_id,\n    u.first_name,\n    LEFT (u.last_name,\n        1) AS last_initial,\n    count(*)::int AS sessions_completed,\n    round(sum(s.time_tutored) / 3600000::numeric, 2)::float AS hours_tutored\nFROM\n    nths_group_members m\n    JOIN users u ON u.id = m.user_id\n    JOIN sessions s ON s.volunteer_id = m.user_id\n        AND s.ended_at IS NOT NULL\n        AND s.time_tutored > :minSessionLength!::int\n        AND s.volunteer_joined_at >= m.joined_at\n        AND (m.deactivated_at IS NULL\n            OR s.volunteer_joined_at < m.deactivated_at)\n        AND s.volunteer_joined_at >= :startsAt!\n        AND s.volunteer_joined_at < :endsAt!\n    JOIN users student ON student.id = s.student_id\n        AND student.test_user IS FALSE\nWHERE\n    m.nths_group_id = :groupId!\n    AND m.deactivated_at IS NULL\n    AND (m.title IS DISTINCT FROM 'President'\n        OR NOT EXISTS (\n            SELECT\n                1\n            FROM\n                nths_group_member_roles member_roles\n                JOIN nths_group_roles roles ON roles.id = member_roles.role_id\n            WHERE\n                member_roles.user_id = m.user_id\n                AND member_roles.nths_group_id = m.nths_group_id\n                AND roles.name = 'admin'))\n    AND u.test_user IS FALSE\n    AND u.deleted IS NOT TRUE\nGROUP BY\n    m.user_id,\n    u.first_name,\n    u.last_name\nORDER BY\n    sum(s.time_tutored) DESC,\n    sessions_completed DESC,\n    m.user_id\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     m.user_id,
 *     u.first_name,
 *     LEFT (u.last_name,
 *         1) AS last_initial,
 *     count(*)::int AS sessions_completed,
 *     round(sum(s.time_tutored) / 3600000::numeric, 2)::float AS hours_tutored
 * FROM
 *     nths_group_members m
 *     JOIN users u ON u.id = m.user_id
 *     JOIN sessions s ON s.volunteer_id = m.user_id
 *         AND s.ended_at IS NOT NULL
 *         AND s.time_tutored > :minSessionLength!::int
 *         AND s.volunteer_joined_at >= m.joined_at
 *         AND (m.deactivated_at IS NULL
 *             OR s.volunteer_joined_at < m.deactivated_at)
 *         AND s.volunteer_joined_at >= :startsAt!
 *         AND s.volunteer_joined_at < :endsAt!
 *     JOIN users student ON student.id = s.student_id
 *         AND student.test_user IS FALSE
 * WHERE
 *     m.nths_group_id = :groupId!
 *     AND m.deactivated_at IS NULL
 *     AND (m.title IS DISTINCT FROM 'President'
 *         OR NOT EXISTS (
 *             SELECT
 *                 1
 *             FROM
 *                 nths_group_member_roles member_roles
 *                 JOIN nths_group_roles roles ON roles.id = member_roles.role_id
 *             WHERE
 *                 member_roles.user_id = m.user_id
 *                 AND member_roles.nths_group_id = m.nths_group_id
 *                 AND roles.name = 'admin'))
 *     AND u.test_user IS FALSE
 *     AND u.deleted IS NOT TRUE
 * GROUP BY
 *     m.user_id,
 *     u.first_name,
 *     u.last_name
 * ORDER BY
 *     sum(s.time_tutored) DESC,
 *     sessions_completed DESC,
 *     m.user_id
 * LIMIT 1
 * ```
 */
export const getNthsChapterTopTutor = new PreparedQuery<IGetNthsChapterTopTutorParams,IGetNthsChapterTopTutorResult>(getNthsChapterTopTutorIR);


/** 'GetNthsChapterMemberHoursTutored' parameters type */
export interface IGetNthsChapterMemberHoursTutoredParams {
  endsAt: DateOrString;
  groupId: string;
  minSessionLength: number;
  startsAt: DateOrString;
  userId: string;
}

/** 'GetNthsChapterMemberHoursTutored' return type */
export interface IGetNthsChapterMemberHoursTutoredResult {
  hoursTutored: number | null;
}

/** 'GetNthsChapterMemberHoursTutored' query type */
export interface IGetNthsChapterMemberHoursTutoredQuery {
  params: IGetNthsChapterMemberHoursTutoredParams;
  result: IGetNthsChapterMemberHoursTutoredResult;
}

const getNthsChapterMemberHoursTutoredIR: any = {"usedParamSet":{"minSessionLength":true,"startsAt":true,"endsAt":true,"groupId":true,"userId":true},"params":[{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":241,"b":258}]},{"name":"startsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":446,"b":455}]},{"name":"endsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":493,"b":500}]},{"name":"groupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":621,"b":629}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":651,"b":658}]}],"statement":"SELECT\n    round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_tutored\nFROM\n    nths_group_members m\n    JOIN sessions s ON s.volunteer_id = m.user_id\n        AND s.ended_at IS NOT NULL\n        AND s.time_tutored > :minSessionLength!::int\n        AND s.volunteer_joined_at >= m.joined_at\n        AND (m.deactivated_at IS NULL\n            OR s.volunteer_joined_at < m.deactivated_at)\n        AND s.volunteer_joined_at >= :startsAt!\n        AND s.volunteer_joined_at < :endsAt!\n    JOIN users student ON student.id = s.student_id\n        AND student.test_user IS FALSE\nWHERE\n    m.nths_group_id = :groupId!\n    AND m.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     round(COALESCE(sum(s.time_tutored), 0) / 3600000::numeric, 2)::float AS hours_tutored
 * FROM
 *     nths_group_members m
 *     JOIN sessions s ON s.volunteer_id = m.user_id
 *         AND s.ended_at IS NOT NULL
 *         AND s.time_tutored > :minSessionLength!::int
 *         AND s.volunteer_joined_at >= m.joined_at
 *         AND (m.deactivated_at IS NULL
 *             OR s.volunteer_joined_at < m.deactivated_at)
 *         AND s.volunteer_joined_at >= :startsAt!
 *         AND s.volunteer_joined_at < :endsAt!
 *     JOIN users student ON student.id = s.student_id
 *         AND student.test_user IS FALSE
 * WHERE
 *     m.nths_group_id = :groupId!
 *     AND m.user_id = :userId!
 * ```
 */
export const getNthsChapterMemberHoursTutored = new PreparedQuery<IGetNthsChapterMemberHoursTutoredParams,IGetNthsChapterMemberHoursTutoredResult>(getNthsChapterMemberHoursTutoredIR);


