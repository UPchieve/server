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

const getUserSessionMetricsByUserIdIR: any = {"usedParamSet":{"userRole":true,"userId":true},"params":[{"name":"userRole","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":151},{"a":223,"b":232},{"a":326,"b":335},{"a":629,"b":638},{"a":721,"b":730}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":698,"b":705},{"a":794,"b":801}]}],"statement":"WITH flag_rows_by_user AS (\n    SELECT\n        sessions_session_flags.session_id,\n        session_flags.name AS flag_name,\n        CASE WHEN (:userRole!::text = 'student') THEN\n            sessions.student_id\n        WHEN (:userRole!::text = 'volunteer') THEN\n            sessions.volunteer_id\n        END AS user_id,\n        :userRole!::text AS user_role,\n        sessions_session_flags.created_at\n    FROM\n        sessions_session_flags\n        JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id\n        JOIN sessions ON sessions.id = sessions_session_flags.session_id\n    WHERE\n        CASE WHEN (:userRole!::text = 'student') THEN\n            sessions.student_id = :userId!\n        WHEN (:userRole!::text = 'volunteer') THEN\n            sessions.volunteer_id = :userId!\n        END\n),\nuser_session_metrics AS (\n    SELECT\n        flag_rows_by_user.user_id,\n        flag_rows_by_user.user_role,\n        count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Absent student'::text) AS absent_student,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Absent volunteer'::text) AS absent_volunteer,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low session rating from coach'::text) AS low_session_rating_from_coach,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low session rating from student'::text) AS low_session_rating_from_student,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low coach rating from student'::text) AS low_coach_rating_from_student,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Reported'::text) AS reported,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Pressuring coach'::text) AS only_looking_for_answers,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Mean or inappropriate'::text) AS rude_or_inappropriate,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Comment from student'::text) AS comment_from_student,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Comment from volunteer'::text) AS comment_from_volunteer,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Has been unmatched'::text) AS has_been_unmatched,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Has had technical issues'::text) AS has_had_technical_issues,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Personally identifiable information'::text\n        OR flag_rows_by_user.flag_name = 'PII'::text) AS personal_identifying_info,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Graded assignment'::text) AS graded_assignment,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Coach uncomfortable'::text) AS coach_uncomfortable,\n    count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Student in distress'::text) AS student_crisis,\n    min(flag_rows_by_user.created_at) AS created_at\nFROM\n    flag_rows_by_user\nGROUP BY\n    flag_rows_by_user.user_id,\n    flag_rows_by_user.user_role\n)\nSELECT\n    user_id,\n    absent_student::int,\n    absent_volunteer::int,\n    low_session_rating_from_coach::int,\n    low_session_rating_from_student::int,\n    low_coach_rating_from_student::int,\n    only_looking_for_answers::int,\n    rude_or_inappropriate::int,\n    comment_from_student::int,\n    comment_from_volunteer::int,\n    has_been_unmatched::int,\n    has_had_technical_issues::int,\n    reported::int,\n    personal_identifying_info::int,\n    graded_assignment::int,\n    coach_uncomfortable::int,\n    student_crisis::int,\n    created_at\nFROM\n    user_session_metrics"};

/**
 * Query generated from SQL:
 * ```
 * WITH flag_rows_by_user AS (
 *     SELECT
 *         sessions_session_flags.session_id,
 *         session_flags.name AS flag_name,
 *         CASE WHEN (:userRole!::text = 'student') THEN
 *             sessions.student_id
 *         WHEN (:userRole!::text = 'volunteer') THEN
 *             sessions.volunteer_id
 *         END AS user_id,
 *         :userRole!::text AS user_role,
 *         sessions_session_flags.created_at
 *     FROM
 *         sessions_session_flags
 *         JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
 *         JOIN sessions ON sessions.id = sessions_session_flags.session_id
 *     WHERE
 *         CASE WHEN (:userRole!::text = 'student') THEN
 *             sessions.student_id = :userId!
 *         WHEN (:userRole!::text = 'volunteer') THEN
 *             sessions.volunteer_id = :userId!
 *         END
 * ),
 * user_session_metrics AS (
 *     SELECT
 *         flag_rows_by_user.user_id,
 *         flag_rows_by_user.user_role,
 *         count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Absent student'::text) AS absent_student,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Absent volunteer'::text) AS absent_volunteer,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low session rating from coach'::text) AS low_session_rating_from_coach,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low session rating from student'::text) AS low_session_rating_from_student,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Low coach rating from student'::text) AS low_coach_rating_from_student,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Reported'::text) AS reported,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Pressuring coach'::text) AS only_looking_for_answers,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Mean or inappropriate'::text) AS rude_or_inappropriate,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Comment from student'::text) AS comment_from_student,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Comment from volunteer'::text) AS comment_from_volunteer,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Has been unmatched'::text) AS has_been_unmatched,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Has had technical issues'::text) AS has_had_technical_issues,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Personally identifiable information'::text
 *         OR flag_rows_by_user.flag_name = 'PII'::text) AS personal_identifying_info,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Graded assignment'::text) AS graded_assignment,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Coach uncomfortable'::text) AS coach_uncomfortable,
 *     count(*) FILTER (WHERE flag_rows_by_user.flag_name = 'Student in distress'::text) AS student_crisis,
 *     min(flag_rows_by_user.created_at) AS created_at
 * FROM
 *     flag_rows_by_user
 * GROUP BY
 *     flag_rows_by_user.user_id,
 *     flag_rows_by_user.user_role
 * )
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
 *     user_session_metrics
 * ```
 */
export const getUserSessionMetricsByUserId = new PreparedQuery<IGetUserSessionMetricsByUserIdParams,IGetUserSessionMetricsByUserIdResult>(getUserSessionMetricsByUserIdIR);


