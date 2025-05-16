/** Types generated for queries found in "server/models/UserSessionMetrics/user_session_metrics.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

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


