/** Types generated for queries found in "server/models/UserSessionMetrics/user_session_metrics.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateUsmByUserId' parameters type */
export interface ICreateUsmByUserIdParams {
  userId: string;
}

/** 'CreateUsmByUserId' return type */
export interface ICreateUsmByUserIdResult {
  absentStudent: number;
  absentVolunteer: number;
  coachUncomfortable: number;
  commentFromStudent: number;
  commentFromVolunteer: number;
  createdAt: Date;
  gradedAssignment: number;
  hasBeenUnmatched: number;
  hasHadTechnicalIssues: number;
  lowCoachRatingFromStudent: number;
  lowSessionRatingFromCoach: number;
  lowSessionRatingFromStudent: number;
  onlyLookingForAnswers: number;
  personalIdentifyingInfo: number;
  reported: number;
  rudeOrInappropriate: number;
  studentCrisis: number;
  updatedAt: Date;
  userId: string;
}

/** 'CreateUsmByUserId' query type */
export interface ICreateUsmByUserIdQuery {
  params: ICreateUsmByUserIdParams;
  result: ICreateUsmByUserIdResult;
}

const createUsmByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":78,"b":85},{"a":243,"b":250}]}],"statement":"INSERT INTO user_session_metrics (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_session_metrics\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    personal_identifying_info,\n    graded_assignment,\n    coach_uncomfortable,\n    student_crisis,\n    created_at,\n    updated_at"};

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
 *     personal_identifying_info,
 *     graded_assignment,
 *     coach_uncomfortable,
 *     student_crisis,
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
  coachUncomfortable: number;
  commentFromStudent: number;
  commentFromVolunteer: number;
  createdAt: Date;
  gradedAssignment: number;
  hasBeenUnmatched: number;
  hasHadTechnicalIssues: number;
  lowCoachRatingFromStudent: number;
  lowSessionRatingFromCoach: number;
  lowSessionRatingFromStudent: number;
  onlyLookingForAnswers: number;
  personalIdentifyingInfo: number;
  reported: number;
  rudeOrInappropriate: number;
  studentCrisis: number;
  updatedAt: Date;
  userId: string;
}

/** 'GetUsmByUserId' query type */
export interface IGetUsmByUserIdQuery {
  params: IGetUsmByUserIdParams;
  result: IGetUsmByUserIdResult;
}

const getUsmByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":528,"b":535}]}],"statement":"SELECT\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    personal_identifying_info,\n    graded_assignment,\n    coach_uncomfortable,\n    student_crisis,\n    created_at,\n    updated_at\nFROM\n    user_session_metrics\nWHERE\n    user_id = :userId!"};

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
 *     personal_identifying_info,
 *     graded_assignment,
 *     coach_uncomfortable,
 *     student_crisis,
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
  coachUncomfortable: number;
  commentFromStudent: number;
  commentFromVolunteer: number;
  gradedAssignment: number;
  hasBeenUnmatched: number;
  hasHadTechnicalIssues: number;
  lowCoachRatingFromStudent: number;
  lowSessionRatingFromCoach: number;
  lowSessionRatingFromStudent: number;
  onlyLookingForAnswers: number;
  personalIdentifyingInfo: number;
  reported: number;
  rudeOrInappropriate: number;
  studentCrisis: number;
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

const executeUsmUpdatesByUserIdIR: any = {"usedParamSet":{"absentStudent":true,"absentVolunteer":true,"lowSessionRatingFromCoach":true,"lowSessionRatingFromStudent":true,"lowCoachRatingFromStudent":true,"onlyLookingForAnswers":true,"rudeOrInappropriate":true,"commentFromStudent":true,"commentFromVolunteer":true,"hasBeenUnmatched":true,"hasHadTechnicalIssues":true,"personalIdentifyingInfo":true,"gradedAssignment":true,"coachUncomfortable":true,"studentCrisis":true,"reported":true,"userId":true},"params":[{"name":"absentStudent","required":true,"transform":{"type":"scalar"},"locs":[{"a":66,"b":80}]},{"name":"absentVolunteer","required":true,"transform":{"type":"scalar"},"locs":[{"a":132,"b":148}]},{"name":"lowSessionRatingFromCoach","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":241}]},{"name":"lowSessionRatingFromStudent","required":true,"transform":{"type":"scalar"},"locs":[{"a":323,"b":351}]},{"name":"lowCoachRatingFromStudent","required":true,"transform":{"type":"scalar"},"locs":[{"a":433,"b":459}]},{"name":"onlyLookingForAnswers","required":true,"transform":{"type":"scalar"},"locs":[{"a":534,"b":556}]},{"name":"rudeOrInappropriate","required":true,"transform":{"type":"scalar"},"locs":[{"a":623,"b":643}]},{"name":"commentFromStudent","required":true,"transform":{"type":"scalar"},"locs":[{"a":706,"b":725}]},{"name":"commentFromVolunteer","required":true,"transform":{"type":"scalar"},"locs":[{"a":789,"b":810}]},{"name":"hasBeenUnmatched","required":true,"transform":{"type":"scalar"},"locs":[{"a":872,"b":889}]},{"name":"hasHadTechnicalIssues","required":true,"transform":{"type":"scalar"},"locs":[{"a":953,"b":975}]},{"name":"personalIdentifyingInfo","required":true,"transform":{"type":"scalar"},"locs":[{"a":1046,"b":1070}]},{"name":"gradedAssignment","required":true,"transform":{"type":"scalar"},"locs":[{"a":1134,"b":1151}]},{"name":"coachUncomfortable","required":true,"transform":{"type":"scalar"},"locs":[{"a":1209,"b":1228}]},{"name":"studentCrisis","required":true,"transform":{"type":"scalar"},"locs":[{"a":1283,"b":1297}]},{"name":"reported","required":true,"transform":{"type":"scalar"},"locs":[{"a":1341,"b":1350}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1407,"b":1414}]}],"statement":"UPDATE\n    user_session_metrics\nSET\n    absent_student = COALESCE(:absentStudent!, absent_student),\n    absent_volunteer = COALESCE(:absentVolunteer!, absent_volunteer),\n    low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach!, low_session_rating_from_coach),\n    low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent!, low_session_rating_from_student),\n    low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent!, low_coach_rating_from_student),\n    only_looking_for_answers = COALESCE(:onlyLookingForAnswers!, only_looking_for_answers),\n    rude_or_inappropriate = COALESCE(:rudeOrInappropriate!, rude_or_inappropriate),\n    comment_from_student = COALESCE(:commentFromStudent!, comment_from_student),\n    comment_from_volunteer = COALESCE(:commentFromVolunteer!, comment_from_volunteer),\n    has_been_unmatched = COALESCE(:hasBeenUnmatched!, has_been_unmatched),\n    has_had_technical_issues = COALESCE(:hasHadTechnicalIssues!, has_had_technical_issues),\n    personal_identifying_info = COALESCE(:personalIdentifyingInfo!, personal_identifying_info),\n    graded_assignment = COALESCE(:gradedAssignment!, graded_assignment),\n    coach_uncomfortable = COALESCE(:coachUncomfortable!, coach_uncomfortable),\n    student_crisis = COALESCE(:studentCrisis!, student_crisis),\n    reported = COALESCE(:reported!, reported),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok"};

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
 *     personal_identifying_info = COALESCE(:personalIdentifyingInfo!, personal_identifying_info),
 *     graded_assignment = COALESCE(:gradedAssignment!, graded_assignment),
 *     coach_uncomfortable = COALESCE(:coachUncomfortable!, coach_uncomfortable),
 *     student_crisis = COALESCE(:studentCrisis!, student_crisis),
 *     reported = COALESCE(:reported!, reported),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const executeUsmUpdatesByUserId = new PreparedQuery<IExecuteUsmUpdatesByUserIdParams,IExecuteUsmUpdatesByUserIdResult>(executeUsmUpdatesByUserIdIR);


