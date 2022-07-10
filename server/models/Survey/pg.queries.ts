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

const getPresessionSurveyIR: any = {"name":"getPresessionSurvey","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":639,"b":645,"line":34,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":669,"b":678,"line":35,"col":22}]}}],"usedParamSet":{"userId":true,"sessionId":true},"statement":{"body":"SELECT\n    id,\n    user_id,\n    session_id,\n    response_data,\n    created_at,\n    updated_at\nFROM\n    pre_session_surveys\nWHERE\n    user_id = :userId!\n    AND session_id = :sessionId!","loc":{"a":495,"b":678,"line":24,"col":0}}};

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


/** 'GetPresessionSurveyNew' parameters type */
export interface IGetPresessionSurveyNewParams {
  subjectName: string;
}

/** 'GetPresessionSurveyNew' return type */
export interface IGetPresessionSurveyNewResult {
  displayPriority: number;
  questionId: number;
  questionText: string;
  questionType: string;
  responseDisplayPriority: number;
  responseId: number;
  responseText: string;
}

/** 'GetPresessionSurveyNew' query type */
export interface IGetPresessionSurveyNewQuery {
  params: IGetPresessionSurveyNewParams;
  result: IGetPresessionSurveyNewResult;
}

const getPresessionSurveyNewIR: any = {"name":"getPresessionSurveyNew","params":[{"name":"subjectName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1627,"b":1638,"line":65,"col":21}]}}],"usedParamSet":{"subjectName":true},"statement":{"body":"SELECT\n    sq.id AS question_id,\n    sq.question_text,\n    ssq.display_priority,\n    qt.name AS question_type,\n    sub.response_id,\n    sub.response_text,\n    sub.response_display_priority\nFROM\n    surveys_context\n    JOIN surveys ON survey_id = surveys.id\n    JOIN subjects ON subject_id = subjects.id\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id\n    JOIN survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN question_types qt ON qt.id = sq.question_type_id\n    JOIN LATERAL (\n        SELECT\n            id AS response_id,\n            choice_text AS response_text,\n            display_priority AS response_display_priority\n        FROM\n            survey_questions_response_choices sqrc\n            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n        WHERE\n            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE\nWHERE\n    subjects.name = :subjectName!","loc":{"a":718,"b":1638,"line":39,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sq.id AS question_id,
 *     sq.question_text,
 *     ssq.display_priority,
 *     qt.name AS question_type,
 *     sub.response_id,
 *     sub.response_text,
 *     sub.response_display_priority
 * FROM
 *     surveys_context
 *     JOIN surveys ON survey_id = surveys.id
 *     JOIN subjects ON subject_id = subjects.id
 *     JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id
 *     JOIN survey_questions sq ON ssq.survey_question_id = sq.id
 *     JOIN question_types qt ON qt.id = sq.question_type_id
 *     JOIN LATERAL (
 *         SELECT
 *             id AS response_id,
 *             choice_text AS response_text,
 *             display_priority AS response_display_priority
 *         FROM
 *             survey_questions_response_choices sqrc
 *             JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
 *         WHERE
 *             sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE
 * WHERE
 *     subjects.name = :subjectName!
 * ```
 */
export const getPresessionSurveyNew = new PreparedQuery<IGetPresessionSurveyNewParams,IGetPresessionSurveyNewResult>(getPresessionSurveyNewIR);


/** 'GetPresessionSurveyResponse' parameters type */
export interface IGetPresessionSurveyResponseParams {
  sessionId: string;
}

/** 'GetPresessionSurveyResponse' return type */
export interface IGetPresessionSurveyResponseResult {
  displayImage: string | null;
  displayLabel: string | null;
  displayOrder: number;
  response: string | null;
  score: number | null;
}

/** 'GetPresessionSurveyResponse' query type */
export interface IGetPresessionSurveyResponseQuery {
  params: IGetPresessionSurveyResponseParams;
  result: IGetPresessionSurveyResponseResult;
}

const getPresessionSurveyResponseIR: any = {"name":"getPresessionSurveyResponse","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2536,"b":2545,"line":90,"col":21},{"a":2563,"b":2572,"line":91,"col":16}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    sq.response_display_text AS display_label,\n    (\n        CASE WHEN src.choice_text = 'Other' THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order,\n    src.display_image as display_image\nFROM\n    users_surveys AS us\n    JOIN sessions AS s ON s.student_id = us.user_id\n    JOIN survey_types AS st ON us.survey_type_id = st.id\n    JOIN users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'presession'\nORDER BY\n    ssq.display_priority ASC","loc":{"a":1683,"b":2641,"line":69,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sq.response_display_text AS display_label,
 *     (
 *         CASE WHEN src.choice_text = 'Other' THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order,
 *     src.display_image as display_image
 * FROM
 *     users_surveys AS us
 *     JOIN sessions AS s ON s.student_id = us.user_id
 *     JOIN survey_types AS st ON us.survey_type_id = st.id
 *     JOIN users_surveys_submissions AS uss ON us.id = uss.user_survey_id
 *     LEFT JOIN survey_response_choices AS src ON uss.survey_response_choice_id = src.id
 *     JOIN survey_questions AS sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 * WHERE
 *     us.session_id = :sessionId!
 *     AND s.id = :sessionId!
 *     AND st.name = 'presession'
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getPresessionSurveyResponse = new PreparedQuery<IGetPresessionSurveyResponseParams,IGetPresessionSurveyResponseResult>(getPresessionSurveyResponseIR);


