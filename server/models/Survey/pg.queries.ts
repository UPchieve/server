/** Types generated for queries found in "server/models/Survey/surveys.sql" */
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


/** 'SaveUserSurvey' parameters type */
export interface ISaveUserSurveyParams {
  progressReportId: string | null | void;
  sessionId: string | null | void;
  surveyId: number;
  surveyTypeId: number;
  userId: string;
}

/** 'SaveUserSurvey' return type */
export interface ISaveUserSurveyResult {
  createdAt: Date;
  id: string;
  progressReportId: string | null;
  sessionId: string | null;
  surveyId: number;
  surveyTypeId: number;
  updatedAt: Date;
  userId: string;
}

/** 'SaveUserSurvey' query type */
export interface ISaveUserSurveyQuery {
  params: ISaveUserSurveyParams;
  result: ISaveUserSurveyResult;
}

const saveUserSurveyIR: any = {"name":"saveUserSurvey","params":[{"name":"surveyId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":647,"b":655,"line":27,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":663,"b":669,"line":28,"col":5}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":677,"b":685,"line":29,"col":5}]}},{"name":"progressReportId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":693,"b":708,"line":30,"col":5}]}},{"name":"surveyTypeId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":716,"b":728,"line":31,"col":5}]}}],"usedParamSet":{"surveyId":true,"userId":true,"sessionId":true,"progressReportId":true,"surveyTypeId":true},"statement":{"body":"INSERT INTO users_surveys (id, survey_id, user_id, session_id, progress_report_id, survey_type_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    :surveyId!,\n    :userId!,\n    :sessionId,\n    :progressReportId,\n    :surveyTypeId!,\n    NOW(),\n    NOW()\nON CONFLICT (survey_id,\n    user_id,\n    session_id,\n    survey_type_id)\n    DO UPDATE SET\n        updated_at = NOW()\n    RETURNING\n        id,\n        survey_id,\n        user_id,\n        session_id,\n        progress_report_id,\n        survey_type_id,\n        created_at,\n        updated_at","loc":{"a":490,"b":1041,"line":24,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_surveys (id, survey_id, user_id, session_id, progress_report_id, survey_type_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     :surveyId!,
 *     :userId!,
 *     :sessionId,
 *     :progressReportId,
 *     :surveyTypeId!,
 *     NOW(),
 *     NOW()
 * ON CONFLICT (survey_id,
 *     user_id,
 *     session_id,
 *     survey_type_id)
 *     DO UPDATE SET
 *         updated_at = NOW()
 *     RETURNING
 *         id,
 *         survey_id,
 *         user_id,
 *         session_id,
 *         progress_report_id,
 *         survey_type_id,
 *         created_at,
 *         updated_at
 * ```
 */
export const saveUserSurvey = new PreparedQuery<ISaveUserSurveyParams,ISaveUserSurveyResult>(saveUserSurveyIR);


/** 'SaveUserSurveySubmissions' parameters type */
export interface ISaveUserSurveySubmissionsParams {
  openResponse: string | null | void;
  questionId: number;
  responseChoiceId: number;
  userSurveyId: string;
}

/** 'SaveUserSurveySubmissions' return type */
export interface ISaveUserSurveySubmissionsResult {
  ok: string;
}

/** 'SaveUserSurveySubmissions' query type */
export interface ISaveUserSurveySubmissionsQuery {
  params: ISaveUserSurveySubmissionsParams;
  result: ISaveUserSurveySubmissionsResult;
}

const saveUserSurveySubmissionsIR: any = {"name":"saveUserSurveySubmissions","params":[{"name":"userSurveyId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1237,"b":1249,"line":54,"col":5}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1257,"b":1267,"line":55,"col":5}]}},{"name":"responseChoiceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1275,"b":1291,"line":56,"col":5}]}},{"name":"openResponse","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1299,"b":1310,"line":57,"col":5}]}}],"usedParamSet":{"userSurveyId":true,"questionId":true,"responseChoiceId":true,"openResponse":true},"statement":{"body":"INSERT INTO users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at)\nSELECT\n    :userSurveyId!,\n    :questionId!,\n    :responseChoiceId!,\n    :openResponse,\n    NOW(),\n    NOW()\nRETURNING\n    user_survey_id AS ok","loc":{"a":1084,"b":1367,"line":52,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at)
 * SELECT
 *     :userSurveyId!,
 *     :questionId!,
 *     :responseChoiceId!,
 *     :openResponse,
 *     NOW(),
 *     NOW()
 * RETURNING
 *     user_survey_id AS ok
 * ```
 */
export const saveUserSurveySubmissions = new PreparedQuery<ISaveUserSurveySubmissionsParams,ISaveUserSurveySubmissionsResult>(saveUserSurveySubmissionsIR);


/** 'GetPresessionSurveyForFeedback' parameters type */
export interface IGetPresessionSurveyForFeedbackParams {
  sessionId: string;
  userId: string;
}

/** 'GetPresessionSurveyForFeedback' return type */
export interface IGetPresessionSurveyForFeedbackResult {
  createdAt: Date;
  id: string;
  responseData: Json | null;
  sessionId: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetPresessionSurveyForFeedback' query type */
export interface IGetPresessionSurveyForFeedbackQuery {
  params: IGetPresessionSurveyForFeedbackParams;
  result: IGetPresessionSurveyForFeedbackResult;
}

const getPresessionSurveyForFeedbackIR: any = {"name":"getPresessionSurveyForFeedback","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1559,"b":1565,"line":75,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1589,"b":1598,"line":76,"col":22}]}}],"usedParamSet":{"userId":true,"sessionId":true},"statement":{"body":"SELECT\n    id,\n    user_id,\n    session_id,\n    response_data,\n    created_at,\n    updated_at\nFROM\n    pre_session_surveys\nWHERE\n    user_id = :userId!\n    AND session_id = :sessionId!","loc":{"a":1415,"b":1598,"line":65,"col":0}}};

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
export const getPresessionSurveyForFeedback = new PreparedQuery<IGetPresessionSurveyForFeedbackParams,IGetPresessionSurveyForFeedbackResult>(getPresessionSurveyForFeedbackIR);


/** 'GetStudentsPresessionGoal' parameters type */
export interface IGetStudentsPresessionGoalParams {
  sessionId: string;
}

/** 'GetStudentsPresessionGoal' return type */
export interface IGetStudentsPresessionGoalResult {
  goal: string | null;
}

/** 'GetStudentsPresessionGoal' query type */
export interface IGetStudentsPresessionGoalQuery {
  params: IGetStudentsPresessionGoalParams;
  result: IGetStudentsPresessionGoalResult;
}

const getStudentsPresessionGoalIR: any = {"name":"getStudentsPresessionGoal","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2078,"b":2087,"line":93,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    (\n        CASE WHEN src.choice_text = 'Other' THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS goal\nFROM\n    users_surveys\n    JOIN users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = 'What is your primary goal for today''s session?'","loc":{"a":1641,"b":2164,"line":80,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     (
 *         CASE WHEN src.choice_text = 'Other' THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS goal
 * FROM
 *     users_surveys
 *     JOIN users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
 *     JOIN survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id
 * WHERE
 *     users_surveys.session_id = :sessionId!
 *     AND sq.question_text = 'What is your primary goal for today''s session?'
 * ```
 */
export const getStudentsPresessionGoal = new PreparedQuery<IGetStudentsPresessionGoalParams,IGetStudentsPresessionGoalResult>(getStudentsPresessionGoalIR);


/** 'GetSimpleSurveyDefinition' parameters type */
export interface IGetSimpleSurveyDefinitionParams {
  subjectName: string | null | void;
  surveyType: string;
}

/** 'GetSimpleSurveyDefinition' return type */
export interface IGetSimpleSurveyDefinitionResult {
  displayPriority: number;
  questionId: number;
  questionText: string | null;
  questionType: string;
  responseDisplayImage: string | null;
  responseDisplayPriority: number;
  responseId: number;
  responseText: string;
  surveyId: number;
  surveyTypeId: number;
}

/** 'GetSimpleSurveyDefinition' query type */
export interface IGetSimpleSurveyDefinitionQuery {
  params: IGetSimpleSurveyDefinitionParams;
  result: IGetSimpleSurveyDefinitionResult;
}

const getSimpleSurveyDefinitionIR: any = {"name":"getSimpleSurveyDefinition","params":[{"name":"surveyType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3466,"b":3476,"line":130,"col":15}]}},{"name":"subjectName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3489,"b":3499,"line":131,"col":11},{"a":3529,"b":3539,"line":132,"col":13}]}}],"usedParamSet":{"surveyType":true,"subjectName":true},"statement":{"body":"SELECT\n    sq.id AS question_id,\n    FORMAT(sq.question_text, subjects.display_name) AS question_text,\n    ssq.display_priority,\n    qt.name AS question_type,\n    sub.response_id,\n    sub.response_text,\n    sub.response_display_priority,\n    sub.response_display_image,\n    surveys.id AS survey_id,\n    survey_types.id AS survey_type_id\nFROM\n    surveys_context\n    JOIN surveys ON survey_id = surveys.id\n    JOIN survey_types ON surveys_context.survey_type_id = survey_types.id\n    LEFT JOIN subjects ON subject_id = subjects.id\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id\n    JOIN survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN question_types qt ON qt.id = sq.question_type_id\n    JOIN upchieve.survey_types st ON st.id = surveys_context.survey_type_id\n    JOIN LATERAL (\n        SELECT\n            id AS response_id,\n            choice_text AS response_text,\n            display_priority AS response_display_priority,\n            display_image AS response_display_image\n        FROM\n            survey_questions_response_choices sqrc\n            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n        WHERE\n            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE\nWHERE\n    st.name = :surveyType!\n    AND ((:subjectName)::text IS NULL\n        OR (:subjectName)::text = subjects.name)\nORDER BY\n    ssq.display_priority ASC","loc":{"a":2207,"b":3601,"line":98,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sq.id AS question_id,
 *     FORMAT(sq.question_text, subjects.display_name) AS question_text,
 *     ssq.display_priority,
 *     qt.name AS question_type,
 *     sub.response_id,
 *     sub.response_text,
 *     sub.response_display_priority,
 *     sub.response_display_image,
 *     surveys.id AS survey_id,
 *     survey_types.id AS survey_type_id
 * FROM
 *     surveys_context
 *     JOIN surveys ON survey_id = surveys.id
 *     JOIN survey_types ON surveys_context.survey_type_id = survey_types.id
 *     LEFT JOIN subjects ON subject_id = subjects.id
 *     JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id
 *     JOIN survey_questions sq ON ssq.survey_question_id = sq.id
 *     JOIN question_types qt ON qt.id = sq.question_type_id
 *     JOIN upchieve.survey_types st ON st.id = surveys_context.survey_type_id
 *     JOIN LATERAL (
 *         SELECT
 *             id AS response_id,
 *             choice_text AS response_text,
 *             display_priority AS response_display_priority,
 *             display_image AS response_display_image
 *         FROM
 *             survey_questions_response_choices sqrc
 *             JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
 *         WHERE
 *             sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE
 * WHERE
 *     st.name = :surveyType!
 *     AND ((:subjectName)::text IS NULL
 *         OR (:subjectName)::text = subjects.name)
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getSimpleSurveyDefinition = new PreparedQuery<IGetSimpleSurveyDefinitionParams,IGetSimpleSurveyDefinitionResult>(getSimpleSurveyDefinitionIR);


/** 'GetPostsessionSurveyReplacementColumns' parameters type */
export interface IGetPostsessionSurveyReplacementColumnsParams {
  sessionId: string;
  surveyType: string;
  userRole: string;
}

/** 'GetPostsessionSurveyReplacementColumns' return type */
export interface IGetPostsessionSurveyReplacementColumnsResult {
  id: number;
  replacementText_1: string | null;
  replacementText_2: string | null;
}

/** 'GetPostsessionSurveyReplacementColumns' query type */
export interface IGetPostsessionSurveyReplacementColumnsQuery {
  params: IGetPostsessionSurveyReplacementColumnsParams;
  result: IGetPostsessionSurveyReplacementColumnsResult;
}

const getPostsessionSurveyReplacementColumnsIR: any = {"name":"getPostsessionSurveyReplacementColumns","params":[{"name":"surveyType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5655,"b":5665,"line":179,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5683,"b":5692,"line":180,"col":16}]}},{"name":"userRole","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5713,"b":5721,"line":181,"col":19}]}}],"usedParamSet":{"surveyType":true,"sessionId":true,"userRole":true},"statement":{"body":"SELECT\n    sq.id,\n    CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n        u_student.first_name\n    WHEN sq.replacement_column_1 = 'student_goal'\n        AND src.choice_text = 'Other' THEN\n        COALESCE(uss.open_response, 'get help')\n    WHEN sq.replacement_column_1 = 'student_goal'\n        AND src.choice_text <> 'Other' THEN\n        COALESCE(src.choice_text)\n    WHEN sq.replacement_column_1 = 'coach_name' THEN\n        u_volunteer.first_name\n    WHEN sq.replacement_column_1 = 'subject_name' THEN\n        subjects.display_name\n    END AS replacement_text_1,\n    CASE WHEN sq.replacement_column_2 = 'student_goal'\n        AND src.choice_text = 'Other' THEN\n        COALESCE(uss.open_response, 'get help')\n    WHEN sq.replacement_column_2 = 'student_goal'\n        AND src.choice_text <> 'OTHER' THEN\n        COALESCE(src.choice_text)\n    WHEN sq.replacement_column_2 = 'subject_name' THEN\n        subjects.display_name\n    END AS replacement_text_2\nFROM\n    upchieve.sessions s\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n    JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n    JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n    JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN upchieve.users u_student ON u_student.id = s.student_id\n    JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n    JOIN upchieve.users_surveys us ON us.session_id = s.id\n    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n        AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n    JOIN upchieve.surveys ON sc.survey_id = surveys.id\n    JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\nWHERE\n    st.name = :surveyType!\n    AND s.id = :sessionId!\n    AND ur.name = :userRole!","loc":{"a":3657,"b":5721,"line":138,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sq.id,
 *     CASE WHEN sq.replacement_column_1 = 'student_name' THEN
 *         u_student.first_name
 *     WHEN sq.replacement_column_1 = 'student_goal'
 *         AND src.choice_text = 'Other' THEN
 *         COALESCE(uss.open_response, 'get help')
 *     WHEN sq.replacement_column_1 = 'student_goal'
 *         AND src.choice_text <> 'Other' THEN
 *         COALESCE(src.choice_text)
 *     WHEN sq.replacement_column_1 = 'coach_name' THEN
 *         u_volunteer.first_name
 *     WHEN sq.replacement_column_1 = 'subject_name' THEN
 *         subjects.display_name
 *     END AS replacement_text_1,
 *     CASE WHEN sq.replacement_column_2 = 'student_goal'
 *         AND src.choice_text = 'Other' THEN
 *         COALESCE(uss.open_response, 'get help')
 *     WHEN sq.replacement_column_2 = 'student_goal'
 *         AND src.choice_text <> 'OTHER' THEN
 *         COALESCE(src.choice_text)
 *     WHEN sq.replacement_column_2 = 'subject_name' THEN
 *         subjects.display_name
 *     END AS replacement_text_2
 * FROM
 *     upchieve.sessions s
 *     JOIN upchieve.subjects ON s.subject_id = subjects.id
 *     JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id
 *     JOIN upchieve.survey_types st ON st.id = sc.survey_type_id
 *     JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id
 *     JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id
 *     JOIN upchieve.users u_student ON u_student.id = s.student_id
 *     JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id
 *     JOIN upchieve.users_surveys us ON us.session_id = s.id
 *     JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *     JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id
 *         AND sq_goal.question_text = 'What is your primary goal for today''s session?'
 *     JOIN upchieve.surveys ON sc.survey_id = surveys.id
 *     JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
 * WHERE
 *     st.name = :surveyType!
 *     AND s.id = :sessionId!
 *     AND ur.name = :userRole!
 * ```
 */
export const getPostsessionSurveyReplacementColumns = new PreparedQuery<IGetPostsessionSurveyReplacementColumnsParams,IGetPostsessionSurveyReplacementColumnsResult>(getPostsessionSurveyReplacementColumnsIR);


/** 'GetPostsessionSurveyDefinitionWithoutReplacementColumns' parameters type */
export interface IGetPostsessionSurveyDefinitionWithoutReplacementColumnsParams {
  sessionId: string;
  surveyType: string;
  userRole: string;
}

/** 'GetPostsessionSurveyDefinitionWithoutReplacementColumns' return type */
export interface IGetPostsessionSurveyDefinitionWithoutReplacementColumnsResult {
  displayPriority: number;
  name: string;
  questionId: number;
  questionText: string;
  questionType: string;
  responseDisplayImage: string | null;
  responseDisplayPriority: number;
  responseId: number;
  responseText: string;
  surveyId: number;
  surveyTypeId: number;
}

/** 'GetPostsessionSurveyDefinitionWithoutReplacementColumns' query type */
export interface IGetPostsessionSurveyDefinitionWithoutReplacementColumnsQuery {
  params: IGetPostsessionSurveyDefinitionWithoutReplacementColumnsParams;
  result: IGetPostsessionSurveyDefinitionWithoutReplacementColumnsResult;
}

const getPostsessionSurveyDefinitionWithoutReplacementColumnsIR: any = {"name":"getPostsessionSurveyDefinitionWithoutReplacementColumns","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7150,"b":7159,"line":220,"col":12}]}},{"name":"surveyType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7180,"b":7190,"line":221,"col":19}]}},{"name":"userRole","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7211,"b":7219,"line":222,"col":19}]}}],"usedParamSet":{"sessionId":true,"surveyType":true,"userRole":true},"statement":{"body":"SELECT\n    surveys.name,\n    sq.id AS question_id,\n    sq.question_text AS question_text,\n    ssq.display_priority,\n    qt.name AS question_type,\n    sub.response_id,\n    sub.response_text,\n    sub.response_display_priority,\n    sub.response_display_image,\n    surveys.id AS survey_id,\n    survey_types.id AS survey_type_id\nFROM\n    surveys_context\n    JOIN surveys ON survey_id = surveys.id\n    JOIN survey_types ON surveys_context.survey_type_id = survey_types.id\n    JOIN subjects ON subject_id = subjects.id\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id\n    JOIN survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN question_types qt ON qt.id = sq.question_type_id\n    JOIN upchieve.survey_types st ON st.id = surveys_context.survey_type_id\n    JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    JOIN upchieve.sessions s ON s.subject_id = subjects.id\n    JOIN LATERAL (\n        SELECT\n            id AS response_id,\n            choice_text AS response_text,\n            display_priority AS response_display_priority,\n            display_image AS response_display_image\n        FROM\n            survey_questions_response_choices sqrc\n            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n        WHERE\n            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE\nWHERE\n    s.id = :sessionId!\n    AND st.name = :surveyType!\n    AND ur.name = :userRole!","loc":{"a":5794,"b":7219,"line":185,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     surveys.name,
 *     sq.id AS question_id,
 *     sq.question_text AS question_text,
 *     ssq.display_priority,
 *     qt.name AS question_type,
 *     sub.response_id,
 *     sub.response_text,
 *     sub.response_display_priority,
 *     sub.response_display_image,
 *     surveys.id AS survey_id,
 *     survey_types.id AS survey_type_id
 * FROM
 *     surveys_context
 *     JOIN surveys ON survey_id = surveys.id
 *     JOIN survey_types ON surveys_context.survey_type_id = survey_types.id
 *     JOIN subjects ON subject_id = subjects.id
 *     JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id
 *     JOIN survey_questions sq ON ssq.survey_question_id = sq.id
 *     JOIN question_types qt ON qt.id = sq.question_type_id
 *     JOIN upchieve.survey_types st ON st.id = surveys_context.survey_type_id
 *     JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
 *     JOIN upchieve.sessions s ON s.subject_id = subjects.id
 *     JOIN LATERAL (
 *         SELECT
 *             id AS response_id,
 *             choice_text AS response_text,
 *             display_priority AS response_display_priority,
 *             display_image AS response_display_image
 *         FROM
 *             survey_questions_response_choices sqrc
 *             JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
 *         WHERE
 *             sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE
 * WHERE
 *     s.id = :sessionId!
 *     AND st.name = :surveyType!
 *     AND ur.name = :userRole!
 * ```
 */
export const getPostsessionSurveyDefinitionWithoutReplacementColumns = new PreparedQuery<IGetPostsessionSurveyDefinitionWithoutReplacementColumnsParams,IGetPostsessionSurveyDefinitionWithoutReplacementColumnsResult>(getPostsessionSurveyDefinitionWithoutReplacementColumnsIR);


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

const getPresessionSurveyResponseIR: any = {"name":"getPresessionSurveyResponse","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8333,"b":8342,"line":251,"col":21},{"a":8360,"b":8369,"line":252,"col":16}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    FORMAT(sq.response_display_text, subjects.display_name) AS display_label,\n    (\n        CASE WHEN src.choice_text = 'Other'\n            AND uss.open_response IS NULL THEN\n            'Other - ask them what their goal is!'\n        WHEN src.choice_text = 'Other' THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order,\n    src.display_image AS display_image\nFROM\n    users_surveys AS us\n    JOIN sessions AS s ON s.student_id = us.user_id\n    JOIN subjects ON s.subject_id = subjects.id\n    JOIN survey_types AS st ON us.survey_type_id = st.id\n    JOIN users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'presession'\nORDER BY\n    ssq.display_priority ASC","loc":{"a":7264,"b":8438,"line":226,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     FORMAT(sq.response_display_text, subjects.display_name) AS display_label,
 *     (
 *         CASE WHEN src.choice_text = 'Other'
 *             AND uss.open_response IS NULL THEN
 *             'Other - ask them what their goal is!'
 *         WHEN src.choice_text = 'Other' THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order,
 *     src.display_image AS display_image
 * FROM
 *     users_surveys AS us
 *     JOIN sessions AS s ON s.student_id = us.user_id
 *     JOIN subjects ON s.subject_id = subjects.id
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


/** 'GetStudentPostsessionSurveyResponse' parameters type */
export interface IGetStudentPostsessionSurveyResponseParams {
  sessionId: string;
}

/** 'GetStudentPostsessionSurveyResponse' return type */
export interface IGetStudentPostsessionSurveyResponseResult {
  displayLabel: string | null;
  displayOrder: number;
  questionText: string;
  response: string | null;
  score: number | null;
  userRole: string | null;
}

/** 'GetStudentPostsessionSurveyResponse' query type */
export interface IGetStudentPostsessionSurveyResponseQuery {
  params: IGetStudentPostsessionSurveyResponseParams;
  result: IGetStudentPostsessionSurveyResponseResult;
}

const getStudentPostsessionSurveyResponseIR: any = {"name":"getStudentPostsessionSurveyResponse","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10723,"b":10732,"line":302,"col":20},{"a":11971,"b":11980,"line":331,"col":21},{"a":11998,"b":12007,"line":332,"col":16}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"WITH replacement_column_cte AS (\n    SELECT\n        sq.id,\n        CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n            u_student.first_name\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text <> 'Other' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_1 = 'coach_name' THEN\n            u_volunteer.first_name\n        WHEN sq.replacement_column_1 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_1,\n        CASE WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text <> 'OTHER' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_2 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_2\n    FROM\n        upchieve.sessions s\n        JOIN upchieve.subjects ON s.subject_id = subjects.id\n        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n        JOIN upchieve.users u_student ON u_student.id = s.student_id\n        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n        JOIN upchieve.users_surveys us ON us.session_id = s.id\n        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n            AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n        JOIN upchieve.surveys ON sc.survey_id = surveys.id\n        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    WHERE\n        st.name = 'postsession'\n        AND s.id = :sessionId!\n        AND ur.name = 'student'\n)\nSELECT\n    'student' AS user_role,\n    sq.question_text,\n    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            OR qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order\nFROM\n    upchieve.users_surveys AS us\n    JOIN upchieve.sessions AS s ON s.student_id = us.user_id\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id\n    JOIN replacement_column_cte rcc ON rcc.id = sq.id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'postsession'\nORDER BY\n    ssq.display_priority ASC","loc":{"a":8491,"b":12077,"line":259,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH replacement_column_cte AS (
 *     SELECT
 *         sq.id,
 *         CASE WHEN sq.replacement_column_1 = 'student_name' THEN
 *             u_student.first_name
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text <> 'Other' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_1 = 'coach_name' THEN
 *             u_volunteer.first_name
 *         WHEN sq.replacement_column_1 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_1,
 *         CASE WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text <> 'OTHER' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_2 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_2
 *     FROM
 *         upchieve.sessions s
 *         JOIN upchieve.subjects ON s.subject_id = subjects.id
 *         JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id
 *         JOIN upchieve.survey_types st ON st.id = sc.survey_type_id
 *         JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id
 *         JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id
 *         JOIN upchieve.users u_student ON u_student.id = s.student_id
 *         JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id
 *         JOIN upchieve.users_surveys us ON us.session_id = s.id
 *         JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *         JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *         JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id
 *             AND sq_goal.question_text = 'What is your primary goal for today''s session?'
 *         JOIN upchieve.surveys ON sc.survey_id = surveys.id
 *         JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
 *     WHERE
 *         st.name = 'postsession'
 *         AND s.id = :sessionId!
 *         AND ur.name = 'student'
 * )
 * SELECT
 *     'student' AS user_role,
 *     sq.question_text,
 *     FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,
 *     (
 *         CASE WHEN (src.choice_text = 'Other'
 *             OR qt.name = 'free response') THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order
 * FROM
 *     upchieve.users_surveys AS us
 *     JOIN upchieve.sessions AS s ON s.student_id = us.user_id
 *     JOIN upchieve.subjects ON s.subject_id = subjects.id
 *     JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id
 *     JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id
 *     LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 *     LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id
 *     JOIN replacement_column_cte rcc ON rcc.id = sq.id
 * WHERE
 *     us.session_id = :sessionId!
 *     AND s.id = :sessionId!
 *     AND st.name = 'postsession'
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getStudentPostsessionSurveyResponse = new PreparedQuery<IGetStudentPostsessionSurveyResponseParams,IGetStudentPostsessionSurveyResponseResult>(getStudentPostsessionSurveyResponseIR);


/** 'GetVolunteerPostsessionSurveyResponse' parameters type */
export interface IGetVolunteerPostsessionSurveyResponseParams {
  sessionId: string;
}

/** 'GetVolunteerPostsessionSurveyResponse' return type */
export interface IGetVolunteerPostsessionSurveyResponseResult {
  displayLabel: string | null;
  displayOrder: number;
  questionText: string;
  response: string | null;
  score: number | null;
  userRole: string | null;
}

/** 'GetVolunteerPostsessionSurveyResponse' query type */
export interface IGetVolunteerPostsessionSurveyResponseQuery {
  params: IGetVolunteerPostsessionSurveyResponseParams;
  result: IGetVolunteerPostsessionSurveyResponseResult;
}

const getVolunteerPostsessionSurveyResponseIR: any = {"name":"getVolunteerPostsessionSurveyResponse","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14364,"b":14373,"line":382,"col":20},{"a":15618,"b":15627,"line":411,"col":21},{"a":15645,"b":15654,"line":412,"col":16}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"WITH replacement_column_cte AS (\n    SELECT\n        sq.id,\n        CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n            u_student.first_name\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text <> 'Other' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_1 = 'coach_name' THEN\n            u_volunteer.first_name\n        WHEN sq.replacement_column_1 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_1,\n        CASE WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text <> 'OTHER' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_2 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_2\n    FROM\n        upchieve.sessions s\n        JOIN upchieve.subjects ON s.subject_id = subjects.id\n        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n        JOIN upchieve.users u_student ON u_student.id = s.student_id\n        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n        JOIN upchieve.users_surveys us ON us.session_id = s.id\n        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n            AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n        JOIN upchieve.surveys ON sc.survey_id = surveys.id\n        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    WHERE\n        st.name = 'postsession'\n        AND s.id = :sessionId!\n        AND ur.name = 'volunteer'\n)\nSELECT\n    'volunteer' AS user_role,\n    sq.question_text,\n    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            OR qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order\nFROM\n    upchieve.users_surveys AS us\n    JOIN upchieve.sessions AS s ON s.volunteer_id = us.user_id\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id\n    JOIN replacement_column_cte rcc ON rcc.id = sq.id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'postsession'\nORDER BY\n    ssq.display_priority ASC","loc":{"a":12132,"b":15724,"line":339,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH replacement_column_cte AS (
 *     SELECT
 *         sq.id,
 *         CASE WHEN sq.replacement_column_1 = 'student_name' THEN
 *             u_student.first_name
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_1 = 'student_goal'
 *             AND src.choice_text <> 'Other' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_1 = 'coach_name' THEN
 *             u_volunteer.first_name
 *         WHEN sq.replacement_column_1 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_1,
 *         CASE WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text = 'Other' THEN
 *             COALESCE(uss.open_response, 'get help')
 *         WHEN sq.replacement_column_2 = 'student_goal'
 *             AND src.choice_text <> 'OTHER' THEN
 *             COALESCE(src.choice_text)
 *         WHEN sq.replacement_column_2 = 'subject_name' THEN
 *             subjects.display_name
 *         END AS replacement_text_2
 *     FROM
 *         upchieve.sessions s
 *         JOIN upchieve.subjects ON s.subject_id = subjects.id
 *         JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id
 *         JOIN upchieve.survey_types st ON st.id = sc.survey_type_id
 *         JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id
 *         JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id
 *         JOIN upchieve.users u_student ON u_student.id = s.student_id
 *         JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id
 *         JOIN upchieve.users_surveys us ON us.session_id = s.id
 *         JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *         JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *         JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id
 *             AND sq_goal.question_text = 'What is your primary goal for today''s session?'
 *         JOIN upchieve.surveys ON sc.survey_id = surveys.id
 *         JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
 *     WHERE
 *         st.name = 'postsession'
 *         AND s.id = :sessionId!
 *         AND ur.name = 'volunteer'
 * )
 * SELECT
 *     'volunteer' AS user_role,
 *     sq.question_text,
 *     FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,
 *     (
 *         CASE WHEN (src.choice_text = 'Other'
 *             OR qt.name = 'free response') THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order
 * FROM
 *     upchieve.users_surveys AS us
 *     JOIN upchieve.sessions AS s ON s.volunteer_id = us.user_id
 *     JOIN upchieve.subjects ON s.subject_id = subjects.id
 *     JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id
 *     JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id
 *     LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 *     LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id
 *     JOIN replacement_column_cte rcc ON rcc.id = sq.id
 * WHERE
 *     us.session_id = :sessionId!
 *     AND s.id = :sessionId!
 *     AND st.name = 'postsession'
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getVolunteerPostsessionSurveyResponse = new PreparedQuery<IGetVolunteerPostsessionSurveyResponseParams,IGetVolunteerPostsessionSurveyResponseResult>(getVolunteerPostsessionSurveyResponseIR);


/** 'GetStudentSessionRating' parameters type */
export interface IGetStudentSessionRatingParams {
  sessionId: string;
}

/** 'GetStudentSessionRating' return type */
export interface IGetStudentSessionRatingResult {
  score: number;
}

/** 'GetStudentSessionRating' query type */
export interface IGetStudentSessionRatingQuery {
  params: IGetStudentSessionRatingParams;
  result: IGetStudentSessionRatingResult;
}

const getStudentSessionRatingIR: any = {"name":"getStudentSessionRating","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16101,"b":16110,"line":427,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    score\nFROM\n    upchieve.users_surveys\n    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'","loc":{"a":15765,"b":16218,"line":419,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     score
 * FROM
 *     upchieve.users_surveys
 *     JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 * WHERE
 *     users_surveys.session_id = :sessionId!
 *     AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
 * ```
 */
export const getStudentSessionRating = new PreparedQuery<IGetStudentSessionRatingParams,IGetStudentSessionRatingResult>(getStudentSessionRatingIR);


/** 'GetVolunteerSessionRating' parameters type */
export interface IGetVolunteerSessionRatingParams {
  sessionId: string;
}

/** 'GetVolunteerSessionRating' return type */
export interface IGetVolunteerSessionRatingResult {
  score: number;
}

/** 'GetVolunteerSessionRating' query type */
export interface IGetVolunteerSessionRatingQuery {
  params: IGetVolunteerSessionRatingParams;
  result: IGetVolunteerSessionRatingResult;
}

const getVolunteerSessionRatingIR: any = {"name":"getVolunteerSessionRating","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16597,"b":16606,"line":440,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    score\nFROM\n    upchieve.users_surveys\n    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'","loc":{"a":16261,"b":16721,"line":432,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     score
 * FROM
 *     upchieve.users_surveys
 *     JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 * WHERE
 *     users_surveys.session_id = :sessionId!
 *     AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
 * ```
 */
export const getVolunteerSessionRating = new PreparedQuery<IGetVolunteerSessionRatingParams,IGetVolunteerSessionRatingResult>(getVolunteerSessionRatingIR);


/** 'DeleteDuplicateUserSurveys' parameters type */
export type IDeleteDuplicateUserSurveysParams = void;

/** 'DeleteDuplicateUserSurveys' return type */
export type IDeleteDuplicateUserSurveysResult = void;

/** 'DeleteDuplicateUserSurveys' query type */
export interface IDeleteDuplicateUserSurveysQuery {
  params: IDeleteDuplicateUserSurveysParams;
  result: IDeleteDuplicateUserSurveysResult;
}

const deleteDuplicateUserSurveysIR: any = {"name":"deleteDuplicateUserSurveys","params":[],"usedParamSet":{},"statement":{"body":"DELETE FROM upchieve.users_surveys\nWHERE id IN (\n        SELECT\n            id\n        FROM (\n            SELECT\n                id,\n                ROW_NUMBER() OVER (PARTITION BY user_id, session_id, survey_id, survey_type_id ORDER BY created_at DESC) AS row_num,\n                created_at\n            FROM\n                users_surveys) t\n        WHERE\n            t.row_num > 1)","loc":{"a":16765,"b":17147,"line":445,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM upchieve.users_surveys
 * WHERE id IN (
 *         SELECT
 *             id
 *         FROM (
 *             SELECT
 *                 id,
 *                 ROW_NUMBER() OVER (PARTITION BY user_id, session_id, survey_id, survey_type_id ORDER BY created_at DESC) AS row_num,
 *                 created_at
 *             FROM
 *                 users_surveys) t
 *         WHERE
 *             t.row_num > 1)
 * ```
 */
export const deleteDuplicateUserSurveys = new PreparedQuery<IDeleteDuplicateUserSurveysParams,IDeleteDuplicateUserSurveysResult>(deleteDuplicateUserSurveysIR);


/** 'GetProgressReportSurveyResponse' parameters type */
export interface IGetProgressReportSurveyResponseParams {
  progressReportId: string;
  userId: string;
}

/** 'GetProgressReportSurveyResponse' return type */
export interface IGetProgressReportSurveyResponseResult {
  displayImage: string | null;
  displayLabel: string | null;
  displayOrder: number;
  response: string | null;
  score: number | null;
  userSurveyId: string;
}

/** 'GetProgressReportSurveyResponse' query type */
export interface IGetProgressReportSurveyResponseQuery {
  params: IGetProgressReportSurveyResponseParams;
  result: IGetProgressReportSurveyResponseResult;
}

const getProgressReportSurveyResponseIR: any = {"name":"getProgressReportSurveyResponse","params":[{"name":"progressReportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17423,"b":17439,"line":469,"col":33}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18698,"b":18704,"line":501,"col":22}]}}],"usedParamSet":{"progressReportId":true,"userId":true},"statement":{"body":"WITH latest_users_surveys AS (\n    SELECT\n        us.user_id,\n        us.progress_report_id,\n        MAX(us.created_at) AS latest_created_at\n    FROM\n        upchieve.users_surveys us\n    WHERE\n        us.progress_report_id = :progressReportId!\n    GROUP BY\n        us.user_id,\n        us.progress_report_id\n)\nSELECT\n    us.id AS user_survey_id,\n    FORMAT(sq.question_text) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            AND qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order,\n    src.display_image AS display_image\nFROM\n    upchieve.users_surveys us\n    INNER JOIN latest_users_surveys lus ON us.user_id = lus.user_id\n        AND us.progress_report_id = lus.progress_report_id\n        AND us.created_at = lus.latest_created_at\n    JOIN upchieve.survey_types st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types qt ON qt.id = sq.question_type_id\nWHERE\n    st.name = 'progress-report'\n    AND us.user_id = :userId!\nORDER BY\n    ssq.display_priority ASC","loc":{"a":17196,"b":18742,"line":461,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH latest_users_surveys AS (
 *     SELECT
 *         us.user_id,
 *         us.progress_report_id,
 *         MAX(us.created_at) AS latest_created_at
 *     FROM
 *         upchieve.users_surveys us
 *     WHERE
 *         us.progress_report_id = :progressReportId!
 *     GROUP BY
 *         us.user_id,
 *         us.progress_report_id
 * )
 * SELECT
 *     us.id AS user_survey_id,
 *     FORMAT(sq.question_text) AS display_label,
 *     (
 *         CASE WHEN (src.choice_text = 'Other'
 *             AND qt.name = 'free response') THEN
 *             uss.open_response
 *         ELSE
 *             src.choice_text
 *         END) AS response,
 *     COALESCE(src.score, 0) AS score,
 *     ssq.display_priority AS display_order,
 *     src.display_image AS display_image
 * FROM
 *     upchieve.users_surveys us
 *     INNER JOIN latest_users_surveys lus ON us.user_id = lus.user_id
 *         AND us.progress_report_id = lus.progress_report_id
 *         AND us.created_at = lus.latest_created_at
 *     JOIN upchieve.survey_types st ON us.survey_type_id = st.id
 *     JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *     LEFT JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     LEFT JOIN upchieve.surveys_survey_questions ssq ON us.survey_id = ssq.survey_id
 *         AND uss.survey_question_id = ssq.survey_question_id
 *     LEFT JOIN upchieve.question_types qt ON qt.id = sq.question_type_id
 * WHERE
 *     st.name = 'progress-report'
 *     AND us.user_id = :userId!
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getProgressReportSurveyResponse = new PreparedQuery<IGetProgressReportSurveyResponseParams,IGetProgressReportSurveyResponseResult>(getProgressReportSurveyResponseIR);


/** 'GetStudentPostsessionSurveyGoalQuestionRatings' parameters type */
export interface IGetStudentPostsessionSurveyGoalQuestionRatingsParams {
  userId: string;
}

/** 'GetStudentPostsessionSurveyGoalQuestionRatings' return type */
export interface IGetStudentPostsessionSurveyGoalQuestionRatingsResult {
  createdAt: Date;
  score: number;
  sessionId: string | null;
  surveyResponseChoiceId: number | null;
  userId: string;
}

/** 'GetStudentPostsessionSurveyGoalQuestionRatings' query type */
export interface IGetStudentPostsessionSurveyGoalQuestionRatingsQuery {
  params: IGetStudentPostsessionSurveyGoalQuestionRatingsParams;
  result: IGetStudentPostsessionSurveyGoalQuestionRatingsResult;
}

const getStudentPostsessionSurveyGoalQuestionRatingsIR: any = {"name":"getStudentPostsessionSurveyGoalQuestionRatings","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19276,"b":19282,"line":520,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    us.user_id,\n    us.session_id,\n    us.created_at,\n    uss.survey_response_choice_id,\n    src.score\nFROM\n    upchieve.users_surveys us\n    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_types st ON st.id = us.survey_type_id\nWHERE\n    us.user_id = :userId!\n    AND st.name = 'postsession'\n    AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'\n    AND src.choice_text IN ('Not at all', 'Sorta but not really', 'I guess so', 'I''m def closer to my goal', 'GOAL ACHIEVED')","loc":{"a":18806,"b":19549,"line":507,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     us.user_id,
 *     us.session_id,
 *     us.created_at,
 *     uss.survey_response_choice_id,
 *     src.score
 * FROM
 *     upchieve.users_surveys us
 *     JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
 *     JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
 *     JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
 *     JOIN upchieve.survey_types st ON st.id = us.survey_type_id
 * WHERE
 *     us.user_id = :userId!
 *     AND st.name = 'postsession'
 *     AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
 *     AND src.choice_text IN ('Not at all', 'Sorta but not really', 'I guess so', 'I''m def closer to my goal', 'GOAL ACHIEVED')
 * ```
 */
export const getStudentPostsessionSurveyGoalQuestionRatings = new PreparedQuery<IGetStudentPostsessionSurveyGoalQuestionRatingsParams,IGetStudentPostsessionSurveyGoalQuestionRatingsResult>(getStudentPostsessionSurveyGoalQuestionRatingsIR);


