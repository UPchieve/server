/** Types generated for queries found in "server/models/UserSessionMetrics/user_session_metrics.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateUsmByUserId' parameters type */
export interface ICreateUsmByUserIdParams {
  userId: string;
}

/** 'CreateUsmByUserId' return type */
export interface ICreateUsmByUserIdResult {
  absentStudent: number;
  absentVolunteer: number;
  commentFromStudent: number;
  commentFromVolunteer: number;
  createdAt: Date;
  hasBeenUnmatched: number;
  hasHadTechnicalIssues: number;
  lowCoachRatingFromStudent: number;
  lowSessionRatingFromCoach: number;
  lowSessionRatingFromStudent: number;
  onlyLookingForAnswers: number;
  reported: number;
  rudeOrInappropriate: number;
  updatedAt: Date;
  userId: string;
}

/** 'CreateUsmByUserId' query type */
export interface ICreateUsmByUserIdQuery {
  params: ICreateUsmByUserIdParams;
  result: ICreateUsmByUserIdResult;
}

const createUsmByUserIdIR: any = {"name":"createUSMByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":109,"b":115,"line":4,"col":5},{"a":274,"b":280,"line":14,"col":23}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO user_session_metrics (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_session_metrics\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    created_at,\n    updated_at","loc":{"a":30,"b":663,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_session_metrics (user_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     NOW(),
 *     NOW()
 * WHERE
 *     NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             user_session_metrics
 *         WHERE
 *             user_id = :userId!)
 * RETURNING
 *     user_id,
 *     absent_student,
 *     absent_volunteer,
 *     low_session_rating_from_coach,
 *     low_session_rating_from_student,
 *     low_coach_rating_from_student,
 *     only_looking_for_answers,
 *     rude_or_inappropriate,
 *     comment_from_student,
 *     comment_from_volunteer,
 *     has_been_unmatched,
 *     has_had_technical_issues,
 *     reported,
 *     created_at,
 *     updated_at
 * ```
 */
export const createUsmByUserId = new PreparedQuery<ICreateUsmByUserIdParams,ICreateUsmByUserIdResult>(createUsmByUserIdIR);


/** 'GetUsmByUserId' parameters type */
export interface IGetUsmByUserIdParams {
  userId: string;
}

/** 'GetUsmByUserId' return type */
export interface IGetUsmByUserIdResult {
  absentStudent: number;
  absentVolunteer: number;
  commentFromStudent: number;
  commentFromVolunteer: number;
  createdAt: Date;
  hasBeenUnmatched: number;
  hasHadTechnicalIssues: number;
  lowCoachRatingFromStudent: number;
  lowSessionRatingFromCoach: number;
  lowSessionRatingFromStudent: number;
  onlyLookingForAnswers: number;
  reported: number;
  rudeOrInappropriate: number;
  updatedAt: Date;
  userId: string;
}

/** 'GetUsmByUserId' query type */
export interface IGetUsmByUserIdQuery {
  params: IGetUsmByUserIdParams;
  result: IGetUsmByUserIdResult;
}

const getUsmByUserIdIR: any = {"name":"getUSMByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1125,"b":1131,"line":53,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    created_at,\n    updated_at\nFROM\n    user_session_metrics\nWHERE\n    user_id = :userId!","loc":{"a":695,"b":1131,"line":34,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     absent_student,
 *     absent_volunteer,
 *     low_session_rating_from_coach,
 *     low_session_rating_from_student,
 *     low_coach_rating_from_student,
 *     only_looking_for_answers,
 *     rude_or_inappropriate,
 *     comment_from_student,
 *     comment_from_volunteer,
 *     has_been_unmatched,
 *     has_had_technical_issues,
 *     reported,
 *     created_at,
 *     updated_at
 * FROM
 *     user_session_metrics
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getUsmByUserId = new PreparedQuery<IGetUsmByUserIdParams,IGetUsmByUserIdResult>(getUsmByUserIdIR);


/** 'ExecuteUsmUpdatesByUserId' parameters type */
export interface IExecuteUsmUpdatesByUserIdParams {
  absentStudent: number;
  absentVolunteer: number;
  commentFromStudent: number;
  commentFromVolunteer: number;
  hasBeenUnmatched: number;
  hasHadTechnicalIssues: number;
  lowCoachRatingFromStudent: number;
  lowSessionRatingFromCoach: number;
  lowSessionRatingFromStudent: number;
  onlyLookingForAnswers: number;
  reported: number;
  rudeOrInappropriate: number;
  userId: string;
}

/** 'ExecuteUsmUpdatesByUserId' return type */
export interface IExecuteUsmUpdatesByUserIdResult {
  ok: string;
}

/** 'ExecuteUsmUpdatesByUserId' query type */
export interface IExecuteUsmUpdatesByUserIdQuery {
  params: IExecuteUsmUpdatesByUserIdParams;
  result: IExecuteUsmUpdatesByUserIdResult;
}

const executeUsmUpdatesByUserIdIR: any = {"name":"executeUSMUpdatesByUserId","params":[{"name":"absentStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1241,"b":1254,"line":60,"col":31}]}},{"name":"absentVolunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1307,"b":1322,"line":61,"col":33}]}},{"name":"lowSessionRatingFromCoach","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1390,"b":1415,"line":62,"col":46}]}},{"name":"lowSessionRatingFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1498,"b":1525,"line":63,"col":48}]}},{"name":"lowCoachRatingFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1608,"b":1633,"line":64,"col":46}]}},{"name":"onlyLookingForAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1709,"b":1730,"line":65,"col":41}]}},{"name":"rudeOrInappropriate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1798,"b":1817,"line":66,"col":38}]}},{"name":"commentFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1881,"b":1899,"line":67,"col":37}]}},{"name":"commentFromVolunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1964,"b":1984,"line":68,"col":39}]}},{"name":"hasBeenUnmatched","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2047,"b":2063,"line":69,"col":35}]}},{"name":"hasHadTechnicalIssues","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2128,"b":2149,"line":70,"col":41}]}},{"name":"reported","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2204,"b":2212,"line":71,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2270,"b":2276,"line":74,"col":15}]}}],"usedParamSet":{"absentStudent":true,"absentVolunteer":true,"lowSessionRatingFromCoach":true,"lowSessionRatingFromStudent":true,"lowCoachRatingFromStudent":true,"onlyLookingForAnswers":true,"rudeOrInappropriate":true,"commentFromStudent":true,"commentFromVolunteer":true,"hasBeenUnmatched":true,"hasHadTechnicalIssues":true,"reported":true,"userId":true},"statement":{"body":"UPDATE\n    user_session_metrics\nSET\n    absent_student = COALESCE(:absentStudent!, absent_student),\n    absent_volunteer = COALESCE(:absentVolunteer!, absent_volunteer),\n    low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach!, low_session_rating_from_coach),\n    low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent!, low_session_rating_from_student),\n    low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent!, low_coach_rating_from_student),\n    only_looking_for_answers = COALESCE(:onlyLookingForAnswers!, only_looking_for_answers),\n    rude_or_inappropriate = COALESCE(:rudeOrInappropriate!, rude_or_inappropriate),\n    comment_from_student = COALESCE(:commentFromStudent!, comment_from_student),\n    comment_from_volunteer = COALESCE(:commentFromVolunteer!, comment_from_volunteer),\n    has_been_unmatched = COALESCE(:hasBeenUnmatched!, has_been_unmatched),\n    has_had_technical_issues = COALESCE(:hasHadTechnicalIssues!, has_had_technical_issues),\n    reported = COALESCE(:reported!, reported),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":1174,"b":2304,"line":57,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_session_metrics
 * SET
 *     absent_student = COALESCE(:absentStudent!, absent_student),
 *     absent_volunteer = COALESCE(:absentVolunteer!, absent_volunteer),
 *     low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach!, low_session_rating_from_coach),
 *     low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent!, low_session_rating_from_student),
 *     low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent!, low_coach_rating_from_student),
 *     only_looking_for_answers = COALESCE(:onlyLookingForAnswers!, only_looking_for_answers),
 *     rude_or_inappropriate = COALESCE(:rudeOrInappropriate!, rude_or_inappropriate),
 *     comment_from_student = COALESCE(:commentFromStudent!, comment_from_student),
 *     comment_from_volunteer = COALESCE(:commentFromVolunteer!, comment_from_volunteer),
 *     has_been_unmatched = COALESCE(:hasBeenUnmatched!, has_been_unmatched),
 *     has_had_technical_issues = COALESCE(:hasHadTechnicalIssues!, has_had_technical_issues),
 *     reported = COALESCE(:reported!, reported),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const executeUsmUpdatesByUserId = new PreparedQuery<IExecuteUsmUpdatesByUserIdParams,IExecuteUsmUpdatesByUserIdResult>(executeUsmUpdatesByUserIdIR);


