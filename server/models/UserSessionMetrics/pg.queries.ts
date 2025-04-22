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


/** 'UpdateUserSessionMetricsByUserId' parameters type */
export interface IUpdateUserSessionMetricsByUserIdParams {
  absentStudent?: number | null | void;
  absentVolunteer?: number | null | void;
  coachUncomfortable?: number | null | void;
  commentFromStudent?: number | null | void;
  commentFromVolunteer?: number | null | void;
  gradedAssignment?: number | null | void;
  hasBeenUnmatched?: number | null | void;
  hasHadTechnicalIssues?: number | null | void;
  lowCoachRatingFromStudent?: number | null | void;
  lowSessionRatingFromCoach?: number | null | void;
  lowSessionRatingFromStudent?: number | null | void;
  onlyLookingForAnswers?: number | null | void;
  personalIdentifyingInfo?: number | null | void;
  reported?: number | null | void;
  rudeOrInappropriate?: number | null | void;
  studentCrisis?: number | null | void;
  userId: string;
}

/** 'UpdateUserSessionMetricsByUserId' return type */
export interface IUpdateUserSessionMetricsByUserIdResult {
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
  userId: string;
}

/** 'UpdateUserSessionMetricsByUserId' query type */
export interface IUpdateUserSessionMetricsByUserIdQuery {
  params: IUpdateUserSessionMetricsByUserIdParams;
  result: IUpdateUserSessionMetricsByUserIdResult;
}

const updateUserSessionMetricsByUserIdIR: any = {"usedParamSet":{"absentStudent":true,"absentVolunteer":true,"lowSessionRatingFromCoach":true,"lowSessionRatingFromStudent":true,"lowCoachRatingFromStudent":true,"onlyLookingForAnswers":true,"rudeOrInappropriate":true,"commentFromStudent":true,"commentFromVolunteer":true,"hasBeenUnmatched":true,"hasHadTechnicalIssues":true,"personalIdentifyingInfo":true,"gradedAssignment":true,"coachUncomfortable":true,"studentCrisis":true,"reported":true,"userId":true},"params":[{"name":"absentStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":66,"b":79}]},{"name":"absentVolunteer","required":false,"transform":{"type":"scalar"},"locs":[{"a":131,"b":146}]},{"name":"lowSessionRatingFromCoach","required":false,"transform":{"type":"scalar"},"locs":[{"a":213,"b":238}]},{"name":"lowSessionRatingFromStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":320,"b":347}]},{"name":"lowCoachRatingFromStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":429,"b":454}]},{"name":"onlyLookingForAnswers","required":false,"transform":{"type":"scalar"},"locs":[{"a":529,"b":550}]},{"name":"rudeOrInappropriate","required":false,"transform":{"type":"scalar"},"locs":[{"a":617,"b":636}]},{"name":"commentFromStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":699,"b":717}]},{"name":"commentFromVolunteer","required":false,"transform":{"type":"scalar"},"locs":[{"a":781,"b":801}]},{"name":"hasBeenUnmatched","required":false,"transform":{"type":"scalar"},"locs":[{"a":863,"b":879}]},{"name":"hasHadTechnicalIssues","required":false,"transform":{"type":"scalar"},"locs":[{"a":943,"b":964}]},{"name":"personalIdentifyingInfo","required":false,"transform":{"type":"scalar"},"locs":[{"a":1035,"b":1058}]},{"name":"gradedAssignment","required":false,"transform":{"type":"scalar"},"locs":[{"a":1122,"b":1138}]},{"name":"coachUncomfortable","required":false,"transform":{"type":"scalar"},"locs":[{"a":1196,"b":1214}]},{"name":"studentCrisis","required":false,"transform":{"type":"scalar"},"locs":[{"a":1269,"b":1282}]},{"name":"reported","required":false,"transform":{"type":"scalar"},"locs":[{"a":1326,"b":1334}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1391,"b":1398}]}],"statement":"UPDATE\n    user_session_metrics\nSET\n    absent_student = COALESCE(:absentStudent, absent_student),\n    absent_volunteer = COALESCE(:absentVolunteer, absent_volunteer),\n    low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach, low_session_rating_from_coach),\n    low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent, low_session_rating_from_student),\n    low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent, low_coach_rating_from_student),\n    only_looking_for_answers = COALESCE(:onlyLookingForAnswers, only_looking_for_answers),\n    rude_or_inappropriate = COALESCE(:rudeOrInappropriate, rude_or_inappropriate),\n    comment_from_student = COALESCE(:commentFromStudent, comment_from_student),\n    comment_from_volunteer = COALESCE(:commentFromVolunteer, comment_from_volunteer),\n    has_been_unmatched = COALESCE(:hasBeenUnmatched, has_been_unmatched),\n    has_had_technical_issues = COALESCE(:hasHadTechnicalIssues, has_had_technical_issues),\n    personal_identifying_info = COALESCE(:personalIdentifyingInfo, personal_identifying_info),\n    graded_assignment = COALESCE(:gradedAssignment, graded_assignment),\n    coach_uncomfortable = COALESCE(:coachUncomfortable, coach_uncomfortable),\n    student_crisis = COALESCE(:studentCrisis, student_crisis),\n    reported = COALESCE(:reported, reported),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    personal_identifying_info,\n    graded_assignment,\n    coach_uncomfortable,\n    student_crisis,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_session_metrics
 * SET
 *     absent_student = COALESCE(:absentStudent, absent_student),
 *     absent_volunteer = COALESCE(:absentVolunteer, absent_volunteer),
 *     low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach, low_session_rating_from_coach),
 *     low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent, low_session_rating_from_student),
 *     low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent, low_coach_rating_from_student),
 *     only_looking_for_answers = COALESCE(:onlyLookingForAnswers, only_looking_for_answers),
 *     rude_or_inappropriate = COALESCE(:rudeOrInappropriate, rude_or_inappropriate),
 *     comment_from_student = COALESCE(:commentFromStudent, comment_from_student),
 *     comment_from_volunteer = COALESCE(:commentFromVolunteer, comment_from_volunteer),
 *     has_been_unmatched = COALESCE(:hasBeenUnmatched, has_been_unmatched),
 *     has_had_technical_issues = COALESCE(:hasHadTechnicalIssues, has_had_technical_issues),
 *     personal_identifying_info = COALESCE(:personalIdentifyingInfo, personal_identifying_info),
 *     graded_assignment = COALESCE(:gradedAssignment, graded_assignment),
 *     coach_uncomfortable = COALESCE(:coachUncomfortable, coach_uncomfortable),
 *     student_crisis = COALESCE(:studentCrisis, student_crisis),
 *     reported = COALESCE(:reported, reported),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
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
 *     created_at
 * ```
 */
export const updateUserSessionMetricsByUserId = new PreparedQuery<IUpdateUserSessionMetricsByUserIdParams,IUpdateUserSessionMetricsByUserIdResult>(updateUserSessionMetricsByUserIdIR);


/** 'GetUserSessionMetricsByUserId' parameters type */
export interface IGetUserSessionMetricsByUserIdParams {
  userId: string;
  userRole: string;
}

/** 'GetUserSessionMetricsByUserId' return type */
export interface IGetUserSessionMetricsByUserIdResult {
  absentStudent: number | null;
  absentVolunteer: number | null;
  coachUncomfortable: number | null;
  commentFromStudent: number | null;
  commentFromVolunteer: number | null;
  createdAt: Date | null;
  gradedAssignment: number | null;
  hasBeenUnmatched: number | null;
  hasHadTechnicalIssues: number | null;
  lowCoachRatingFromStudent: number | null;
  lowSessionRatingFromCoach: number | null;
  lowSessionRatingFromStudent: number | null;
  onlyLookingForAnswers: number | null;
  personalIdentifyingInfo: number | null;
  reported: number | null;
  rudeOrInappropriate: number | null;
  studentCrisis: number | null;
  userId: string | null;
}

/** 'GetUserSessionMetricsByUserId' query type */
export interface IGetUserSessionMetricsByUserIdQuery {
  params: IGetUserSessionMetricsByUserIdParams;
  result: IGetUserSessionMetricsByUserIdResult;
}

const getUserSessionMetricsByUserIdIR: any = {"usedParamSet":{"userId":true,"userRole":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":597,"b":604}]},{"name":"userRole","required":true,"transform":{"type":"scalar"},"locs":[{"a":626,"b":635}]}],"statement":"SELECT\n    user_id,\n    absent_student::int,\n    absent_volunteer::int,\n    low_session_rating_from_coach::int,\n    low_session_rating_from_student::int,\n    low_coach_rating_from_student::int,\n    only_looking_for_answers::int,\n    rude_or_inappropriate::int,\n    comment_from_student::int,\n    comment_from_volunteer::int,\n    has_been_unmatched::int,\n    has_had_technical_issues::int,\n    reported::int,\n    personal_identifying_info::int,\n    graded_assignment::int,\n    coach_uncomfortable::int,\n    student_crisis::int,\n    created_at\nFROM\n    user_session_metrics_view\nWHERE\n    user_id = :userId!\n    AND user_role = :userRole!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     absent_student::int,
 *     absent_volunteer::int,
 *     low_session_rating_from_coach::int,
 *     low_session_rating_from_student::int,
 *     low_coach_rating_from_student::int,
 *     only_looking_for_answers::int,
 *     rude_or_inappropriate::int,
 *     comment_from_student::int,
 *     comment_from_volunteer::int,
 *     has_been_unmatched::int,
 *     has_had_technical_issues::int,
 *     reported::int,
 *     personal_identifying_info::int,
 *     graded_assignment::int,
 *     coach_uncomfortable::int,
 *     student_crisis::int,
 *     created_at
 * FROM
 *     user_session_metrics_view
 * WHERE
 *     user_id = :userId!
 *     AND user_role = :userRole!
 * ```
 */
export const getUserSessionMetricsByUserId = new PreparedQuery<IGetUserSessionMetricsByUserIdParams,IGetUserSessionMetricsByUserIdResult>(getUserSessionMetricsByUserIdIR);


