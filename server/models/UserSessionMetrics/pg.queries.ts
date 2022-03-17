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

const createUsmByUserIdIR: any = {"name":"createUSMByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":109,"b":115,"line":4,"col":5},{"a":286,"b":292,"line":14,"col":23}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO user_session_metrics (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW()::date,\n    NOW()::date\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_session_metrics\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    created_at,\n    updated_at","loc":{"a":30,"b":675,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_session_metrics (user_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     NOW()::date,
 *     NOW()::date
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

const getUsmByUserIdIR: any = {"name":"getUSMByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1137,"b":1143,"line":53,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    created_at,\n    updated_at\nFROM\n    user_session_metrics\nWHERE\n    user_id = :userId!","loc":{"a":707,"b":1143,"line":34,"col":0}}};

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


/** 'GetAllUsm' parameters type */
export type IGetAllUsmParams = void;

/** 'GetAllUsm' return type */
export interface IGetAllUsmResult {
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

/** 'GetAllUsm' query type */
export interface IGetAllUsmQuery {
  params: IGetAllUsmParams;
  result: IGetAllUsmResult;
}

const getAllUsmIR: any = {"name":"getAllUSM","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    created_at,\n    updated_at\nFROM\n    user_session_metrics","loc":{"a":1170,"b":1577,"line":57,"col":0}}};

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
 * ```
 */
export const getAllUsm = new PreparedQuery<IGetAllUsmParams,IGetAllUsmResult>(getAllUsmIR);


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
  userId: string;
}

/** 'ExecuteUsmUpdatesByUserId' query type */
export interface IExecuteUsmUpdatesByUserIdQuery {
  params: IExecuteUsmUpdatesByUserIdParams;
  result: IExecuteUsmUpdatesByUserIdResult;
}

const executeUsmUpdatesByUserIdIR: any = {"name":"executeUSMUpdatesByUserId","params":[{"name":"absentStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1687,"b":1700,"line":81,"col":31}]}},{"name":"absentVolunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1753,"b":1768,"line":82,"col":33}]}},{"name":"lowSessionRatingFromCoach","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1836,"b":1861,"line":83,"col":46}]}},{"name":"lowSessionRatingFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1944,"b":1971,"line":84,"col":48}]}},{"name":"lowCoachRatingFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2054,"b":2079,"line":85,"col":46}]}},{"name":"onlyLookingForAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2155,"b":2176,"line":86,"col":41}]}},{"name":"rudeOrInappropriate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2244,"b":2263,"line":87,"col":38}]}},{"name":"commentFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2327,"b":2345,"line":88,"col":37}]}},{"name":"commentFromVolunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2410,"b":2430,"line":89,"col":39}]}},{"name":"hasBeenUnmatched","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2493,"b":2509,"line":90,"col":35}]}},{"name":"hasHadTechnicalIssues","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2574,"b":2595,"line":91,"col":41}]}},{"name":"reported","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2650,"b":2658,"line":92,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2722,"b":2728,"line":95,"col":15}]}}],"usedParamSet":{"absentStudent":true,"absentVolunteer":true,"lowSessionRatingFromCoach":true,"lowSessionRatingFromStudent":true,"lowCoachRatingFromStudent":true,"onlyLookingForAnswers":true,"rudeOrInappropriate":true,"commentFromStudent":true,"commentFromVolunteer":true,"hasBeenUnmatched":true,"hasHadTechnicalIssues":true,"reported":true,"userId":true},"statement":{"body":"UPDATE\n    user_session_metrics\nSET\n    absent_student = COALESCE(:absentStudent!, absent_student),\n    absent_volunteer = COALESCE(:absentVolunteer!, absent_volunteer),\n    low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach!, low_session_rating_from_coach),\n    low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent!, low_session_rating_from_student),\n    low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent!, low_coach_rating_from_student),\n    only_looking_for_answers = COALESCE(:onlyLookingForAnswers!, only_looking_for_answers),\n    rude_or_inappropriate = COALESCE(:rudeOrInappropriate!, rude_or_inappropriate),\n    comment_from_student = COALESCE(:commentFromStudent!, comment_from_student),\n    comment_from_volunteer = COALESCE(:commentFromVolunteer!, comment_from_volunteer),\n    has_been_unmatched = COALESCE(:hasBeenUnmatched!, has_been_unmatched),\n    has_had_technical_issues = COALESCE(:hasHadTechnicalIssues!, has_had_technical_issues),\n    reported = COALESCE(:reported!, reported),\n    updated_at = NOW()::date\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id","loc":{"a":1620,"b":2750,"line":78,"col":0}}};

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
 *     updated_at = NOW()::date
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id
 * ```
 */
export const executeUsmUpdatesByUserId = new PreparedQuery<IExecuteUsmUpdatesByUserIdParams,IExecuteUsmUpdatesByUserIdResult>(executeUsmUpdatesByUserIdIR);


