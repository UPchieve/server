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
  inviteCode: string | null;
  joinedAt: Date;
  memberTitle: string | null;
}

/** 'GetGroupsByUser' query type */
export interface IGetGroupsByUserQuery {
  params: IGetGroupsByUserParams;
  result: IGetGroupsByUserResult;
}

const getGroupsByUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":266,"b":273}]}],"statement":"SELECT\n    ngm.title AS member_title,\n    ngm.joined_at,\n    ng.id AS group_id,\n    ng.name AS group_name,\n    ng.key AS group_key,\n    ng.invite_code\nFROM\n    nths_group_members ngm\n    INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id\nWHERE\n    ngm.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ngm.title AS member_title,
 *     ngm.joined_at,
 *     ng.id AS group_id,
 *     ng.name AS group_name,
 *     ng.key AS group_key,
 *     ng.invite_code
 * FROM
 *     nths_group_members ngm
 *     INNER JOIN nths_groups ng ON ng.id = ngm.nths_group_id
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
  inviteCode: string | null;
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


