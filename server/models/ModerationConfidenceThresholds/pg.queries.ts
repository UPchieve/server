/** Types generated for queries found in "server/models/ModerationConfidenceThresholds/confidene_thresholds.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetConfidenceRating' parameters type */
export interface IGetConfidenceRatingParams {
  flagReason: string;
}

/** 'GetConfidenceRating' return type */
export interface IGetConfidenceRatingResult {
  confidenceRating: number;
}

/** 'GetConfidenceRating' query type */
export interface IGetConfidenceRatingQuery {
  params: IGetConfidenceRatingParams;
  result: IGetConfidenceRatingResult;
}

const getConfidenceRatingIR: any = {"usedParamSet":{"flagReason":true},"params":[{"name":"flagReason","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":105}]}],"statement":"SELECT confidence_rating FROM contextual_moderation_confidence_thresholds WHERE flag_reason = :flagReason!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT confidence_rating FROM contextual_moderation_confidence_thresholds WHERE flag_reason = :flagReason!
 * ```
 */
export const getConfidenceRating = new PreparedQuery<IGetConfidenceRatingParams,IGetConfidenceRatingResult>(getConfidenceRatingIR);


