/** Types generated for queries found in "server/models/ModerationSettings/moderation_settings.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type moderation_types = 'contextual' | 'realtime_image';

/** 'GetModerationSettingsByType' parameters type */
export interface IGetModerationSettingsByTypeParams {
  moderationType: moderation_types;
}

/** 'GetModerationSettingsByType' return type */
export interface IGetModerationSettingsByTypeResult {
  name: string;
  penaltyWeight: number;
  threshold: string | null;
}

/** 'GetModerationSettingsByType' query type */
export interface IGetModerationSettingsByTypeQuery {
  params: IGetModerationSettingsByTypeParams;
  result: IGetModerationSettingsByTypeResult;
}

const getModerationSettingsByTypeIR: any = {"usedParamSet":{"moderationType":true},"params":[{"name":"moderationType","required":true,"transform":{"type":"scalar"},"locs":[{"a":194,"b":209}]}],"statement":"SELECT\n    mc.name,\n    ms.threshold,\n    ms.penalty_weight\nFROM\n    moderation_settings ms\n    JOIN moderation_categories mc ON ms.moderation_category_id = mc.id\nWHERE\n    ms.moderation_type = :moderationType!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     mc.name,
 *     ms.threshold,
 *     ms.penalty_weight
 * FROM
 *     moderation_settings ms
 *     JOIN moderation_categories mc ON ms.moderation_category_id = mc.id
 * WHERE
 *     ms.moderation_type = :moderationType!
 * ```
 */
export const getModerationSettingsByType = new PreparedQuery<IGetModerationSettingsByTypeParams,IGetModerationSettingsByTypeResult>(getModerationSettingsByTypeIR);


