/** Types generated for queries found in "server/models/NTHSChecklistProgress/nths_checklist_progress.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetNthsChecklistProgressByGroupId' parameters type */
export interface IGetNthsChecklistProgressByGroupIdParams {
  nthsGroupId: string;
}

/** 'GetNthsChecklistProgressByGroupId' return type */
export interface IGetNthsChecklistProgressByGroupIdResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Stable key for the checklist item */
  itemKey: string;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Current checklist item status */
  status: string;
  /** not_pii */
  updatedAt: Date;
  /** pii: User who most recently updated the checklist item */
  updatedByUserId: string;
}

/** 'GetNthsChecklistProgressByGroupId' query type */
export interface IGetNthsChecklistProgressByGroupIdQuery {
  params: IGetNthsChecklistProgressByGroupIdParams;
  result: IGetNthsChecklistProgressByGroupIdResult;
}

const getNthsChecklistProgressByGroupIdIR: any = {"usedParamSet":{"nthsGroupId":true},"params":[{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":185,"b":197}]}],"statement":"SELECT\n    id,\n    nths_group_id,\n    item_key,\n    status,\n    updated_by_user_id,\n    created_at,\n    updated_at\nFROM\n    nths_group_checklist_item_progress\nWHERE\n    nths_group_id = :nthsGroupId!\nORDER BY\n    item_key"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     nths_group_id,
 *     item_key,
 *     status,
 *     updated_by_user_id,
 *     created_at,
 *     updated_at
 * FROM
 *     nths_group_checklist_item_progress
 * WHERE
 *     nths_group_id = :nthsGroupId!
 * ORDER BY
 *     item_key
 * ```
 */
export const getNthsChecklistProgressByGroupId = new PreparedQuery<IGetNthsChecklistProgressByGroupIdParams,IGetNthsChecklistProgressByGroupIdResult>(getNthsChecklistProgressByGroupIdIR);


/** 'UpsertNthsChecklistItemProgress' parameters type */
export interface IUpsertNthsChecklistItemProgressParams {
  itemKey: string;
  nthsGroupId: string;
  status: string;
  updatedByUserId: string;
}

/** 'UpsertNthsChecklistItemProgress' return type */
export interface IUpsertNthsChecklistItemProgressResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Stable key for the checklist item */
  itemKey: string;
  /** not_pii: Foreign key to upchieve.nths_groups */
  nthsGroupId: string;
  /** not_pii: Current checklist item status */
  status: string;
  /** not_pii */
  updatedAt: Date;
  /** pii: User who most recently updated the checklist item */
  updatedByUserId: string;
}

/** 'UpsertNthsChecklistItemProgress' query type */
export interface IUpsertNthsChecklistItemProgressQuery {
  params: IUpsertNthsChecklistItemProgressParams;
  result: IUpsertNthsChecklistItemProgressResult;
}

const upsertNthsChecklistItemProgressIR: any = {"usedParamSet":{"nthsGroupId":true,"itemKey":true,"status":true,"updatedByUserId":true},"params":[{"name":"nthsGroupId","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":125}]},{"name":"itemKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":136}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":146}]},{"name":"updatedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":165}]}],"statement":"INSERT INTO nths_group_checklist_item_progress (nths_group_id, item_key, status, updated_by_user_id)\n    VALUES (:nthsGroupId!, :itemKey!, :status!, :updatedByUserId!)\nON CONFLICT (nths_group_id, item_key)\n    DO UPDATE SET\n        status = EXCLUDED.status, updated_by_user_id = EXCLUDED.updated_by_user_id, updated_at = NOW()\n    RETURNING\n        id, nths_group_id, item_key, status, updated_by_user_id, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_group_checklist_item_progress (nths_group_id, item_key, status, updated_by_user_id)
 *     VALUES (:nthsGroupId!, :itemKey!, :status!, :updatedByUserId!)
 * ON CONFLICT (nths_group_id, item_key)
 *     DO UPDATE SET
 *         status = EXCLUDED.status, updated_by_user_id = EXCLUDED.updated_by_user_id, updated_at = NOW()
 *     RETURNING
 *         id, nths_group_id, item_key, status, updated_by_user_id, created_at, updated_at
 * ```
 */
export const upsertNthsChecklistItemProgress = new PreparedQuery<IUpsertNthsChecklistItemProgressParams,IUpsertNthsChecklistItemProgressResult>(upsertNthsChecklistItemProgressIR);


