/** Types generated for queries found in "server/models/Survey/pre_session_surveys.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'SavePresessionSurvey' parameters type */
export interface ISavePresessionSurveyParams {
  id: string;
  responseData: Json;
  sessionId: string;
  userId: string;
}

/** 'SavePresessionSurvey' return type */
export interface ISavePresessionSurveyResult {
  createdAt: Date;
  id: string;
  responseData: Json | null;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'SavePresessionSurvey' query type */
export interface ISavePresessionSurveyQuery {
  params: ISavePresessionSurveyParams;
  result: ISavePresessionSurveyResult;
}

const savePresessionSurveyIR: any = {"name":"savePresessionSurvey","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":143,"b":145,"line":3,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":149,"b":155,"line":3,"col":19}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":159,"b":168,"line":3,"col":29}]}},{"name":"responseData","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":172,"b":184,"line":3,"col":42},{"a":281,"b":293,"line":6,"col":25}]}}],"usedParamSet":{"id":true,"userId":true,"sessionId":true,"responseData":true},"statement":{"body":"INSERT INTO pre_session_surveys (id, user_id, session_id, response_data, created_at, updated_at)\n    VALUES (:id!, :userId!, :sessionId!, :responseData!, NOW()::date, NOW()::date)\nON CONFLICT (session_id)\n    DO UPDATE SET\n        response_data = :responseData!, updated_at = NOW()::date\n    RETURNING\n        id, user_id, session_id, response_data, created_at, updated_at","loc":{"a":33,"b":404,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO pre_session_surveys (id, user_id, session_id, response_data, created_at, updated_at)
 *     VALUES (:id!, :userId!, :sessionId!, :responseData!, NOW()::date, NOW()::date)
 * ON CONFLICT (session_id)
 *     DO UPDATE SET
 *         response_data = :responseData!, updated_at = NOW()::date
 *     RETURNING
 *         id, user_id, session_id, response_data, created_at, updated_at
 * ```
 */
export const savePresessionSurvey = new PreparedQuery<ISavePresessionSurveyParams,ISavePresessionSurveyResult>(savePresessionSurveyIR);


/** 'GetPresessionSurvey' parameters type */
export interface IGetPresessionSurveyParams {
  sessionId: string;
  userId: string;
}

/** 'GetPresessionSurvey' return type */
export interface IGetPresessionSurveyResult {
  createdAt: Date;
  id: string;
  responseData: Json | null;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetPresessionSurvey' query type */
export interface IGetPresessionSurveyQuery {
  params: IGetPresessionSurveyParams;
  result: IGetPresessionSurveyResult;
}

const getPresessionSurveyIR: any = {"name":"getPresessionSurvey","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":585,"b":591,"line":22,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":615,"b":624,"line":23,"col":22}]}}],"usedParamSet":{"userId":true,"sessionId":true},"statement":{"body":"SELECT\n    id,\n    user_id,\n    session_id,\n    response_data,\n    created_at,\n    updated_at\nFROM\n    pre_session_surveys\nWHERE\n    user_id = :userId!\n    AND session_id = :sessionId!","loc":{"a":441,"b":624,"line":12,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     session_id,
 *     response_data,
 *     created_at,
 *     updated_at
 * FROM
 *     pre_session_surveys
 * WHERE
 *     user_id = :userId!
 *     AND session_id = :sessionId!
 * ```
 */
export const getPresessionSurvey = new PreparedQuery<IGetPresessionSurveyParams,IGetPresessionSurveyResult>(getPresessionSurveyIR);


