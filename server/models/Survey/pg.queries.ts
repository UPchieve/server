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
  sessionId: string;
  surveyId: number;
  surveyTypeId: number;
  userId: string;
}

/** 'SaveUserSurvey' return type */
export interface ISaveUserSurveyResult {
  createdAt: Date;
  id: string;
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

const saveUserSurveyIR: any = {"name":"saveUserSurvey","params":[{"name":"surveyId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":627,"b":635,"line":27,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":643,"b":649,"line":28,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":657,"b":666,"line":29,"col":5}]}},{"name":"surveyTypeId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":674,"b":686,"line":30,"col":5}]}}],"usedParamSet":{"surveyId":true,"userId":true,"sessionId":true,"surveyTypeId":true},"statement":{"body":"INSERT INTO users_surveys (id, survey_id, user_id, session_id, survey_type_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    :surveyId!,\n    :userId!,\n    :sessionId!,\n    :surveyTypeId!,\n    NOW(),\n    NOW()\nRETURNING\n    id,\n    survey_id,\n    user_id,\n    session_id,\n    survey_type_id,\n    created_at,\n    updated_at","loc":{"a":490,"b":821,"line":24,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_surveys (id, survey_id, user_id, session_id, survey_type_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     :surveyId!,
 *     :userId!,
 *     :sessionId!,
 *     :surveyTypeId!,
 *     NOW(),
 *     NOW()
 * RETURNING
 *     id,
 *     survey_id,
 *     user_id,
 *     session_id,
 *     survey_type_id,
 *     created_at,
 *     updated_at
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

const saveUserSurveySubmissionsIR: any = {"name":"saveUserSurveySubmissions","params":[{"name":"userSurveyId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1017,"b":1029,"line":46,"col":5}]}},{"name":"questionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1037,"b":1047,"line":47,"col":5}]}},{"name":"responseChoiceId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1055,"b":1071,"line":48,"col":5}]}},{"name":"openResponse","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1079,"b":1090,"line":49,"col":5}]}}],"usedParamSet":{"userSurveyId":true,"questionId":true,"responseChoiceId":true,"openResponse":true},"statement":{"body":"INSERT INTO users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at)\nSELECT\n    :userSurveyId!,\n    :questionId!,\n    :responseChoiceId!,\n    :openResponse,\n    NOW(),\n    NOW()\nRETURNING\n    user_survey_id AS ok","loc":{"a":864,"b":1147,"line":44,"col":0}}};

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

const getPresessionSurveyForFeedbackIR: any = {"name":"getPresessionSurveyForFeedback","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1339,"b":1345,"line":67,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1369,"b":1378,"line":68,"col":22}]}}],"usedParamSet":{"userId":true,"sessionId":true},"statement":{"body":"SELECT\n    id,\n    user_id,\n    session_id,\n    response_data,\n    created_at,\n    updated_at\nFROM\n    pre_session_surveys\nWHERE\n    user_id = :userId!\n    AND session_id = :sessionId!","loc":{"a":1195,"b":1378,"line":57,"col":0}}};

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

const getStudentsPresessionGoalIR: any = {"name":"getStudentsPresessionGoal","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1858,"b":1867,"line":85,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    (\n        CASE WHEN src.choice_text = 'Other' THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS goal\nFROM\n    users_surveys\n    JOIN users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = 'What is your primary goal for today''s session?'","loc":{"a":1421,"b":1944,"line":72,"col":0}}};

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


/** 'GetPresessionSurveyDefinition' parameters type */
export interface IGetPresessionSurveyDefinitionParams {
  subjectName: string;
  surveyType: string;
}

/** 'GetPresessionSurveyDefinition' return type */
export interface IGetPresessionSurveyDefinitionResult {
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

/** 'GetPresessionSurveyDefinition' query type */
export interface IGetPresessionSurveyDefinitionQuery {
  params: IGetPresessionSurveyDefinitionParams;
  result: IGetPresessionSurveyDefinitionResult;
}

const getPresessionSurveyDefinitionIR: any = {"name":"getPresessionSurveyDefinition","params":[{"name":"subjectName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3251,"b":3262,"line":122,"col":21}]}},{"name":"surveyType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3283,"b":3293,"line":123,"col":19}]}}],"usedParamSet":{"subjectName":true,"surveyType":true},"statement":{"body":"SELECT\n    sq.id AS question_id,\n    FORMAT(sq.question_text, subjects.display_name) AS question_text,\n    ssq.display_priority,\n    qt.name AS question_type,\n    sub.response_id,\n    sub.response_text,\n    sub.response_display_priority,\n    sub.response_display_image,\n    surveys.id AS survey_id,\n    survey_types.id AS survey_type_id\nFROM\n    surveys_context\n    JOIN surveys ON survey_id = surveys.id\n    JOIN survey_types ON surveys_context.survey_type_id = survey_types.id\n    JOIN subjects ON subject_id = subjects.id\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id\n    JOIN survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN question_types qt ON qt.id = sq.question_type_id\n    JOIN upchieve.survey_types st ON st.id = surveys_context.survey_type_id\n    JOIN LATERAL (\n        SELECT\n            id AS response_id,\n            choice_text AS response_text,\n            display_priority AS response_display_priority,\n            display_image AS response_display_image\n        FROM\n            survey_questions_response_choices sqrc\n            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n        WHERE\n            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE\nWHERE\n    subjects.name = :subjectName!\n    AND st.name = :surveyType!\nORDER BY\n    ssq.display_priority ASC","loc":{"a":1991,"b":3331,"line":90,"col":0}}};

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
 *     JOIN subjects ON subject_id = subjects.id
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
 *     subjects.name = :subjectName!
 *     AND st.name = :surveyType!
 * ORDER BY
 *     ssq.display_priority ASC
 * ```
 */
export const getPresessionSurveyDefinition = new PreparedQuery<IGetPresessionSurveyDefinitionParams,IGetPresessionSurveyDefinitionResult>(getPresessionSurveyDefinitionIR);


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

const getPostsessionSurveyReplacementColumnsIR: any = {"name":"getPostsessionSurveyReplacementColumns","params":[{"name":"surveyType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5385,"b":5395,"line":170,"col":15}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5413,"b":5422,"line":171,"col":16}]}},{"name":"userRole","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5443,"b":5451,"line":172,"col":19}]}}],"usedParamSet":{"surveyType":true,"sessionId":true,"userRole":true},"statement":{"body":"SELECT\n    sq.id,\n    CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n        u_student.first_name\n    WHEN sq.replacement_column_1 = 'student_goal'\n        AND src.choice_text = 'Other' THEN\n        COALESCE(uss.open_response, 'get help')\n    WHEN sq.replacement_column_1 = 'student_goal'\n        AND src.choice_text <> 'Other' THEN\n        COALESCE(src.choice_text)\n    WHEN sq.replacement_column_1 = 'coach_name' THEN\n        u_volunteer.first_name\n    WHEN sq.replacement_column_1 = 'subject_name' THEN\n        subjects.display_name\n    END AS replacement_text_1,\n    CASE WHEN sq.replacement_column_2 = 'student_goal'\n        AND src.choice_text = 'Other' THEN\n        COALESCE(uss.open_response, 'get help')\n    WHEN sq.replacement_column_2 = 'student_goal'\n        AND src.choice_text <> 'OTHER' THEN\n        COALESCE(src.choice_text)\n    WHEN sq.replacement_column_2 = 'subject_name' THEN\n        subjects.display_name\n    END AS replacement_text_2\nFROM\n    upchieve.sessions s\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n    JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n    JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n    JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN upchieve.users u_student ON u_student.id = s.student_id\n    JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n    JOIN upchieve.users_surveys us ON us.session_id = s.id\n    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n        AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n    JOIN upchieve.surveys ON sc.survey_id = surveys.id\n    JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\nWHERE\n    st.name = :surveyType!\n    AND s.id = :sessionId!\n    AND ur.name = :userRole!","loc":{"a":3387,"b":5451,"line":129,"col":0}}};

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

const getPostsessionSurveyDefinitionWithoutReplacementColumnsIR: any = {"name":"getPostsessionSurveyDefinitionWithoutReplacementColumns","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6880,"b":6889,"line":211,"col":12}]}},{"name":"surveyType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6910,"b":6920,"line":212,"col":19}]}},{"name":"userRole","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6941,"b":6949,"line":213,"col":19}]}}],"usedParamSet":{"sessionId":true,"surveyType":true,"userRole":true},"statement":{"body":"SELECT\n    surveys.name,\n    sq.id AS question_id,\n    sq.question_text AS question_text,\n    ssq.display_priority,\n    qt.name AS question_type,\n    sub.response_id,\n    sub.response_text,\n    sub.response_display_priority,\n    sub.response_display_image,\n    surveys.id AS survey_id,\n    survey_types.id AS survey_type_id\nFROM\n    surveys_context\n    JOIN surveys ON survey_id = surveys.id\n    JOIN survey_types ON surveys_context.survey_type_id = survey_types.id\n    JOIN subjects ON subject_id = subjects.id\n    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id\n    JOIN survey_questions sq ON ssq.survey_question_id = sq.id\n    JOIN question_types qt ON qt.id = sq.question_type_id\n    JOIN upchieve.survey_types st ON st.id = surveys_context.survey_type_id\n    JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    JOIN upchieve.sessions s ON s.subject_id = subjects.id\n    JOIN LATERAL (\n        SELECT\n            id AS response_id,\n            choice_text AS response_text,\n            display_priority AS response_display_priority,\n            display_image AS response_display_image\n        FROM\n            survey_questions_response_choices sqrc\n            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id\n        WHERE\n            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE\nWHERE\n    s.id = :sessionId!\n    AND st.name = :surveyType!\n    AND ur.name = :userRole!","loc":{"a":5524,"b":6949,"line":176,"col":0}}};

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

const getPresessionSurveyResponseIR: any = {"name":"getPresessionSurveyResponse","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8063,"b":8072,"line":242,"col":21},{"a":8090,"b":8099,"line":243,"col":16}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    FORMAT(sq.response_display_text, subjects.display_name) AS display_label,\n    (\n        CASE WHEN src.choice_text = 'Other'\n            AND uss.open_response IS NULL THEN\n            'Other - ask them what their goal is!'\n        WHEN src.choice_text = 'Other' THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order,\n    src.display_image AS display_image\nFROM\n    users_surveys AS us\n    JOIN sessions AS s ON s.student_id = us.user_id\n    JOIN subjects ON s.subject_id = subjects.id\n    JOIN survey_types AS st ON us.survey_type_id = st.id\n    JOIN users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'presession'\nORDER BY\n    ssq.display_priority ASC","loc":{"a":6994,"b":8168,"line":217,"col":0}}};

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

const getStudentPostsessionSurveyResponseIR: any = {"name":"getStudentPostsessionSurveyResponse","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10453,"b":10462,"line":293,"col":20},{"a":11701,"b":11710,"line":322,"col":21},{"a":11728,"b":11737,"line":323,"col":16}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"WITH replacement_column_cte AS (\n    SELECT\n        sq.id,\n        CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n            u_student.first_name\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text <> 'Other' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_1 = 'coach_name' THEN\n            u_volunteer.first_name\n        WHEN sq.replacement_column_1 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_1,\n        CASE WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text <> 'OTHER' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_2 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_2\n    FROM\n        upchieve.sessions s\n        JOIN upchieve.subjects ON s.subject_id = subjects.id\n        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n        JOIN upchieve.users u_student ON u_student.id = s.student_id\n        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n        JOIN upchieve.users_surveys us ON us.session_id = s.id\n        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n            AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n        JOIN upchieve.surveys ON sc.survey_id = surveys.id\n        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    WHERE\n        st.name = 'postsession'\n        AND s.id = :sessionId!\n        AND ur.name = 'student'\n)\nSELECT\n    'student' AS user_role,\n    sq.question_text,\n    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            OR qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order\nFROM\n    upchieve.users_surveys AS us\n    JOIN upchieve.sessions AS s ON s.student_id = us.user_id\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id\n    JOIN replacement_column_cte rcc ON rcc.id = sq.id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'postsession'\nORDER BY\n    ssq.display_priority ASC","loc":{"a":8221,"b":11807,"line":250,"col":0}}};

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

const getVolunteerPostsessionSurveyResponseIR: any = {"name":"getVolunteerPostsessionSurveyResponse","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14094,"b":14103,"line":373,"col":20},{"a":15348,"b":15357,"line":402,"col":21},{"a":15375,"b":15384,"line":403,"col":16}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"WITH replacement_column_cte AS (\n    SELECT\n        sq.id,\n        CASE WHEN sq.replacement_column_1 = 'student_name' THEN\n            u_student.first_name\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_1 = 'student_goal'\n            AND src.choice_text <> 'Other' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_1 = 'coach_name' THEN\n            u_volunteer.first_name\n        WHEN sq.replacement_column_1 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_1,\n        CASE WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text = 'Other' THEN\n            COALESCE(uss.open_response, 'get help')\n        WHEN sq.replacement_column_2 = 'student_goal'\n            AND src.choice_text <> 'OTHER' THEN\n            COALESCE(src.choice_text)\n        WHEN sq.replacement_column_2 = 'subject_name' THEN\n            subjects.display_name\n        END AS replacement_text_2\n    FROM\n        upchieve.sessions s\n        JOIN upchieve.subjects ON s.subject_id = subjects.id\n        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id\n        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id\n        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id\n        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id\n        JOIN upchieve.users u_student ON u_student.id = s.student_id\n        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id\n        JOIN upchieve.users_surveys us ON us.session_id = s.id\n        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id\n        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\n        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id\n            AND sq_goal.question_text = 'What is your primary goal for today''s session?'\n        JOIN upchieve.surveys ON sc.survey_id = surveys.id\n        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id\n    WHERE\n        st.name = 'postsession'\n        AND s.id = :sessionId!\n        AND ur.name = 'volunteer'\n)\nSELECT\n    'volunteer' AS user_role,\n    sq.question_text,\n    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,\n    (\n        CASE WHEN (src.choice_text = 'Other'\n            OR qt.name = 'free response') THEN\n            uss.open_response\n        ELSE\n            src.choice_text\n        END) AS response,\n    COALESCE(src.score, 0) AS score,\n    ssq.display_priority AS display_order\nFROM\n    upchieve.users_surveys AS us\n    JOIN upchieve.sessions AS s ON s.volunteer_id = us.user_id\n    JOIN upchieve.subjects ON s.subject_id = subjects.id\n    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id\n    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id\n    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id\n    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id\n    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id\n        AND uss.survey_question_id = ssq.survey_question_id\n    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id\n    JOIN replacement_column_cte rcc ON rcc.id = sq.id\nWHERE\n    us.session_id = :sessionId!\n    AND s.id = :sessionId!\n    AND st.name = 'postsession'\nORDER BY\n    ssq.display_priority ASC","loc":{"a":11862,"b":15454,"line":330,"col":0}}};

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

const getStudentSessionRatingIR: any = {"name":"getStudentSessionRating","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15831,"b":15840,"line":418,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    score\nFROM\n    upchieve.users_surveys\n    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'","loc":{"a":15495,"b":15948,"line":410,"col":0}}};

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

const getVolunteerSessionRatingIR: any = {"name":"getVolunteerSessionRating","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":16327,"b":16336,"line":431,"col":32}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    score\nFROM\n    upchieve.users_surveys\n    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id\n    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id\n    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id\nWHERE\n    users_surveys.session_id = :sessionId!\n    AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'","loc":{"a":15991,"b":16451,"line":423,"col":0}}};

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


