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

const createUsmByUserIdIR: any = {"name":"createUSMByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":109,"b":115,"line":4,"col":5},{"a":274,"b":280,"line":14,"col":23}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO user_session_metrics (user_id, created_at, updated_at)\nSELECT\n    :userId!,\n    NOW(),\n    NOW()\nWHERE\n    NOT EXISTS (\n        SELECT\n            1\n        FROM\n            user_session_metrics\n        WHERE\n            user_id = :userId!)\nRETURNING\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    personal_identifying_info,\n    graded_assignment,\n    coach_uncomfortable,\n    student_crisis,\n    created_at,\n    updated_at","loc":{"a":30,"b":762,"line":2,"col":0}}};

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

const getUsmByUserIdIR: any = {"name":"getUSMByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1323,"b":1329,"line":61,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    personal_identifying_info,\n    graded_assignment,\n    coach_uncomfortable,\n    student_crisis,\n    created_at,\n    updated_at\nFROM\n    user_session_metrics\nWHERE\n    user_id = :userId!","loc":{"a":794,"b":1329,"line":38,"col":0}}};

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

const executeUsmUpdatesByUserIdIR: any = {"name":"executeUSMUpdatesByUserId","params":[{"name":"absentStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1439,"b":1452,"line":68,"col":31}]}},{"name":"absentVolunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1505,"b":1520,"line":69,"col":33}]}},{"name":"lowSessionRatingFromCoach","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1588,"b":1613,"line":70,"col":46}]}},{"name":"lowSessionRatingFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1696,"b":1723,"line":71,"col":48}]}},{"name":"lowCoachRatingFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1806,"b":1831,"line":72,"col":46}]}},{"name":"onlyLookingForAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1907,"b":1928,"line":73,"col":41}]}},{"name":"rudeOrInappropriate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1996,"b":2015,"line":74,"col":38}]}},{"name":"commentFromStudent","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2079,"b":2097,"line":75,"col":37}]}},{"name":"commentFromVolunteer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2162,"b":2182,"line":76,"col":39}]}},{"name":"hasBeenUnmatched","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2245,"b":2261,"line":77,"col":35}]}},{"name":"hasHadTechnicalIssues","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2326,"b":2347,"line":78,"col":41}]}},{"name":"personalIdentifyingInfo","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2419,"b":2442,"line":79,"col":42}]}},{"name":"gradedAssignment","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2507,"b":2523,"line":80,"col":34}]}},{"name":"coachUncomfortable","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2582,"b":2600,"line":81,"col":36}]}},{"name":"studentCrisis","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2656,"b":2669,"line":82,"col":31}]}},{"name":"reported","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2714,"b":2722,"line":83,"col":25}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2780,"b":2786,"line":86,"col":15}]}}],"usedParamSet":{"absentStudent":true,"absentVolunteer":true,"lowSessionRatingFromCoach":true,"lowSessionRatingFromStudent":true,"lowCoachRatingFromStudent":true,"onlyLookingForAnswers":true,"rudeOrInappropriate":true,"commentFromStudent":true,"commentFromVolunteer":true,"hasBeenUnmatched":true,"hasHadTechnicalIssues":true,"personalIdentifyingInfo":true,"gradedAssignment":true,"coachUncomfortable":true,"studentCrisis":true,"reported":true,"userId":true},"statement":{"body":"UPDATE\n    user_session_metrics\nSET\n    absent_student = COALESCE(:absentStudent!, absent_student),\n    absent_volunteer = COALESCE(:absentVolunteer!, absent_volunteer),\n    low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach!, low_session_rating_from_coach),\n    low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent!, low_session_rating_from_student),\n    low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent!, low_coach_rating_from_student),\n    only_looking_for_answers = COALESCE(:onlyLookingForAnswers!, only_looking_for_answers),\n    rude_or_inappropriate = COALESCE(:rudeOrInappropriate!, rude_or_inappropriate),\n    comment_from_student = COALESCE(:commentFromStudent!, comment_from_student),\n    comment_from_volunteer = COALESCE(:commentFromVolunteer!, comment_from_volunteer),\n    has_been_unmatched = COALESCE(:hasBeenUnmatched!, has_been_unmatched),\n    has_had_technical_issues = COALESCE(:hasHadTechnicalIssues!, has_had_technical_issues),\n    personal_identifying_info = COALESCE(:personalIdentifyingInfo!, personal_identifying_info),\n    graded_assignment = COALESCE(:gradedAssignment!, graded_assignment),\n    coach_uncomfortable = COALESCE(:coachUncomfortable!, coach_uncomfortable),\n    student_crisis = COALESCE(:studentCrisis!, student_crisis),\n    reported = COALESCE(:reported!, reported),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":1372,"b":2814,"line":65,"col":0}}};

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


