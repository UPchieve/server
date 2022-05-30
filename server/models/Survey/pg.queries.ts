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

const savePresessionSurveyIR: any = {"name":"savePresessionSurvey","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":142,"b":144,"line":4,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":152,"b":158,"line":5,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":166,"b":175,"line":6,"col":5}]}},{"name":"responseData","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":183,"b":195,"line":7,"col":5},{"a":287,"b":299,"line":12,"col":25}]}}],"usedParamSet":{"id":true,"userId":true,"sessionId":true,"responseData":true},"statement":{"body":"INSERT INTO pre_session_surveys (id, user_id, session_id, response_data, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    :sessionId!,\n    :responseData!,\n    NOW(),\n    NOW()\nON CONFLICT (session_id)\n    DO UPDATE SET\n        response_data = :responseData!,\n        updated_at = NOW()::date\n    RETURNING\n        id,\n        user_id,\n        session_id,\n        response_data,\n        created_at,\n        updated_at","loc":{"a":33,"b":458,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO pre_session_surveys (id, user_id, session_id, response_data, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :userId!,
 *     :sessionId!,
 *     :responseData!,
 *     NOW(),
 *     NOW()
 * ON CONFLICT (session_id)
 *     DO UPDATE SET
 *         response_data = :responseData!,
 *         updated_at = NOW()::date
 *     RETURNING
 *         id,
 *         user_id,
 *         session_id,
 *         response_data,
 *         created_at,
 *         updated_at
 * ```
 */
export const savePresessionSurvey = new PreparedQuery<ISavePresessionSurveyParams,ISavePresessionSurveyResult>(savePresessionSurveyIR);


/** 'GetPresessionSurveyLegacy' parameters type */
export interface IGetPresessionSurveyLegacyParams {
  sessionId: string;
  userId: string;
}

/** 'GetPresessionSurveyLegacy' return type */
export interface IGetPresessionSurveyLegacyResult {
  createdAt: Date;
  id: string;
  responseData: Json | null;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetPresessionSurveyLegacy' query type */
export interface IGetPresessionSurveyLegacyQuery {
  params: IGetPresessionSurveyLegacyParams;
  result: IGetPresessionSurveyLegacyResult;
}

const getPresessionSurveyLegacyIR: any = {"name":"getPresessionSurveyLegacy","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":645,"b":651,"line":34,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":675,"b":684,"line":35,"col":22}]}}],"usedParamSet":{"userId":true,"sessionId":true},"statement":{"body":"SELECT\n    id,\n    user_id,\n    session_id,\n    response_data,\n    created_at,\n    updated_at\nFROM\n    pre_session_surveys\nWHERE\n    user_id = :userId!\n    AND session_id = :sessionId!","loc":{"a":501,"b":684,"line":24,"col":0}}};

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
export const getPresessionSurveyLegacy = new PreparedQuery<IGetPresessionSurveyLegacyParams,IGetPresessionSurveyLegacyResult>(getPresessionSurveyLegacyIR);


/** Query 'GetPresessionSurvey' is invalid, so its result is assigned type 'never' */
export type IGetPresessionSurveyResult = never;

/** Query 'GetPresessionSurvey' is invalid, so its parameters are assigned type 'never' */
export type IGetPresessionSurveyParams = never;

const getPresessionSurveyIR: any = {"name":"getPresessionSurvey","params":[{"name":"subjectName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1459,"b":1470,"line":54,"col":23}]}}],"usedParamSet":{"subjectName":true},"statement":{"body":"select \nsurvey_questions.id,\nsurvey_questions.question_text, \nssq.display_priority, qt.name, sub.*\nfrom surveys_presession\njoin surveys on survey_id = surveys.id\njoin subjects on subject_id = subjects.id\njoin surveys_survey_questions ssq on ssq.survey_id = surveys.id\njoin survey_questions on ssq.survey_question_id = survey_questions.id\njoin question_types qt on qt.id = survey_questions.question_type_id\njoin lateral (\n    select array_agg(choice_text) as responses, array_agg(display_priority) as response_display_priority\n  from survey_questions_response_choices sqrc \n    join survey_response_choices src on src.id = sqrc.response_choice_id\n    where sqrc.survey_question_id = survey_questions.id\n) sub on true\nwhere subjects.name = :subjectName!","loc":{"a":720,"b":1470,"line":38,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * select 
 * survey_questions.id,
 * survey_questions.question_text, 
 * ssq.display_priority, qt.name, sub.*
 * from surveys_presession
 * join surveys on survey_id = surveys.id
 * join subjects on subject_id = subjects.id
 * join surveys_survey_questions ssq on ssq.survey_id = surveys.id
 * join survey_questions on ssq.survey_question_id = survey_questions.id
 * join question_types qt on qt.id = survey_questions.question_type_id
 * join lateral (
 *     select array_agg(choice_text) as responses, array_agg(display_priority) as response_display_priority
 *   from survey_questions_response_choices sqrc 
 *     join survey_response_choices src on src.id = sqrc.response_choice_id
 *     where sqrc.survey_question_id = survey_questions.id
 * ) sub on true
 * where subjects.name = :subjectName!
 * ```
 */
export const getPresessionSurvey = new PreparedQuery<IGetPresessionSurveyParams,IGetPresessionSurveyResult>(getPresessionSurveyIR);


