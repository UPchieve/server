/** Types generated for queries found in "server/models/ModerationConfidenceThresholds/confidence_thresholds.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type moderation_types = 'contextual' | 'realtime_image';

/** 'GetConfidenceThreshold' parameters type */
export interface IGetConfidenceThresholdParams {
  moderationCategory: string;
  moderationType: moderation_types;
}

/** 'GetConfidenceThreshold' return type */
export interface IGetConfidenceThresholdResult {
  threshold: string | null;
}

/** 'GetConfidenceThreshold' query type */
export interface IGetConfidenceThresholdQuery {
  params: IGetConfidenceThresholdParams;
  result: IGetConfidenceThresholdResult;
}

const getConfidenceThresholdIR: any = {"usedParamSet":{"moderationCategory":true,"moderationType":true},"params":[{"name":"moderationCategory","required":true,"transform":{"type":"scalar"},"locs":[{"a":165,"b":184}]},{"name":"moderationType","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":230}]}],"statement":"SELECT\n    ms.threshold\nFROM\n    upchieve.moderation_settings ms\n    JOIN upchieve.moderation_categories mc ON ms.moderation_category_id = mc.id\nWHERE\n    mc.name = :moderationCategory!\n    AND ms.moderation_type = :moderationType!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ms.threshold
 * FROM
 *     upchieve.moderation_settings ms
 *     JOIN upchieve.moderation_categories mc ON ms.moderation_category_id = mc.id
 * WHERE
 *     mc.name = :moderationCategory!
 *     AND ms.moderation_type = :moderationType!
 * ```
 */
export const getConfidenceThreshold = new PreparedQuery<IGetConfidenceThresholdParams,IGetConfidenceThresholdResult>(getConfidenceThresholdIR);


