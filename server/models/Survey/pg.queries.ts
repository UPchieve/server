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


/** Query 'GetPresessionSurvey' is invalid, so its result is assigned type 'never' */
export type IGetPresessionSurveyResult = never;

/** Query 'GetPresessionSurvey' is invalid, so its parameters are assigned type 'never' */
export type IGetPresessionSurveyParams = never;

const getPresessionSurveyIR: any = {"name":"getPresessionSurvey","params":[{"name":"subjectName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1315,"b":1326,"line":44,"col":21}]}}],"usedParamSet":{"subjectName":true},"statement":{"body":"SELECT\n    survey_questions.question_text,\n    ssq.display_priority,\n    qt.name,\n    sub.*\nFROM\n    surveys_presession\n    JOIN surveys ON survey_id = surveys.id\n    JOIN subjects ON subject_id = subjects.id\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id\n    JOIN survey_questions ON ssq.survey_question_id = survey_questions.id\n    JOIN question_types qt ON qt.id = survey_questions.question_type_id\n    JOIN LATERAL (\n        SELECT\n            json_build_object('choiceText', choice_text, 'displayPriority', display_priority) AS responses\n        FROM\n            survey_questions_response_choices sqrc\n            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n        WHERE\n            sqrc.survey_question_id = survey_questions.id) sub ON TRUE\nWHERE\n    subjects.name = :subjectName!","loc":{"a":494,"b":1326,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     survey_questions.question_text,
 *     ssq.display_priority,
 *     qt.name,
 *     sub.*
 * FROM
 *     surveys_presession
 *     JOIN surveys ON survey_id = surveys.id
 *     JOIN subjects ON subject_id = subjects.id
 *     JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id
 *     JOIN survey_questions ON ssq.survey_question_id = survey_questions.id
 *     JOIN question_types qt ON qt.id = survey_questions.question_type_id
 *     JOIN LATERAL (
 *         SELECT
 *             json_build_object('choiceText', choice_text, 'displayPriority', display_priority) AS responses
 *         FROM
 *             survey_questions_response_choices sqrc
 *             JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
 *         WHERE
 *             sqrc.survey_question_id = survey_questions.id) sub ON TRUE
 * WHERE
 *     subjects.name = :subjectName!
 * ```
 */
export const getPresessionSurvey = new PreparedQuery<IGetPresessionSurveyParams,IGetPresessionSurveyResult>(getPresessionSurveyIR);


