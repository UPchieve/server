/** Types generated for queries found in "server/models/ModerationConfidenceThresholds/confidence_thresholds.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type moderation_types = 'contextual' | 'realtime_image';

/** 'GetConfidenceThresholdsByModerationType' parameters type */
export interface IGetConfidenceThresholdsByModerationTypeParams {
  moderationType: moderation_types;
}

/** 'GetConfidenceThresholdsByModerationType' return type */
export interface IGetConfidenceThresholdsByModerationTypeResult {
  name: string;
  threshold: string | null;
}

/** 'GetConfidenceThresholdsByModerationType' query type */
export interface IGetConfidenceThresholdsByModerationTypeQuery {
  params: IGetConfidenceThresholdsByModerationTypeParams;
  result: IGetConfidenceThresholdsByModerationTypeResult;
}

const getConfidenceThresholdsByModerationTypeIR: any = {"usedParamSet":{"moderationType":true},"params":[{"name":"moderationType","required":true,"transform":{"type":"scalar"},"locs":[{"a":171,"b":186}]}],"statement":"SELECT\n    mc.name,\n    ms.threshold\nFROM\n    moderation_settings ms\n    JOIN moderation_categories mc ON ms.moderation_category_id = mc.id\nWHERE\n    ms.moderation_type = :moderationType!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     mc.name,
 *     ms.threshold
 * FROM
 *     moderation_settings ms
 *     JOIN moderation_categories mc ON ms.moderation_category_id = mc.id
 * WHERE
 *     ms.moderation_type = :moderationType!
 * ```
 */
export const getConfidenceThresholdsByModerationType = new PreparedQuery<IGetConfidenceThresholdsByModerationTypeParams,IGetConfidenceThresholdsByModerationTypeResult>(getConfidenceThresholdsByModerationTypeIR);


