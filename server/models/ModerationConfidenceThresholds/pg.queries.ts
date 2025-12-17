/** Types generated for queries found in "server/models/ModerationConfidenceThresholds/confidence_thresholds.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetContextualConfidenceThresholds' parameters type */
export type IGetContextualConfidenceThresholdsParams = void;

/** 'GetContextualConfidenceThresholds' return type */
export interface IGetContextualConfidenceThresholdsResult {
  name: string;
  threshold: string | null;
}

/** 'GetContextualConfidenceThresholds' query type */
export interface IGetContextualConfidenceThresholdsQuery {
  params: IGetContextualConfidenceThresholdsParams;
  result: IGetContextualConfidenceThresholdsResult;
}

const getContextualConfidenceThresholdsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    mc.name,\n    ms.threshold\nFROM\n    upchieve.moderation_settings ms\n    JOIN upchieve.moderation_categories mc ON ms.moderation_category_id = mc.id\nWHERE\n    ms.moderation_type = 'contextual'"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     mc.name,
 *     ms.threshold
 * FROM
 *     upchieve.moderation_settings ms
 *     JOIN upchieve.moderation_categories mc ON ms.moderation_category_id = mc.id
 * WHERE
 *     ms.moderation_type = 'contextual'
 * ```
 */
export const getContextualConfidenceThresholds = new PreparedQuery<IGetContextualConfidenceThresholdsParams,IGetContextualConfidenceThresholdsResult>(getContextualConfidenceThresholdsIR);


