/** Types generated for queries found in "server/models/SessionMetrics/session-metrics.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateSessionMetrics' parameters type */
export interface ICreateSessionMetricsParams {
  sessionId: string;
}

/** 'CreateSessionMetrics' return type */
export interface ICreateSessionMetricsResult {
  ok: string;
}

/** 'CreateSessionMetrics' query type */
export interface ICreateSessionMetricsQuery {
  params: ICreateSessionMetricsParams;
  result: ICreateSessionMetricsResult;
}

const createSessionMetricsIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":53,"b":63}]}],"statement":"INSERT INTO session_metrics (session_id)\n    VALUES (:sessionId!)\nRETURNING\n    session_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_metrics (session_id)
 *     VALUES (:sessionId!)
 * RETURNING
 *     session_id AS ok
 * ```
 */
export const createSessionMetrics = new PreparedQuery<ICreateSessionMetricsParams,ICreateSessionMetricsResult>(createSessionMetricsIR);


/** 'UpdateSessionMetrics' parameters type */
export interface IUpdateSessionMetricsParams {
  absentStudent?: boolean | null | void;
  absentVolunteer?: boolean | null | void;
  coachUncomfortable?: boolean | null | void;
  commentFromStudent?: boolean | null | void;
  commentFromVolunteer?: boolean | null | void;
  gradedAssignment?: boolean | null | void;
  hasBeenUnmatched?: boolean | null | void;
  hasHadTechnicalIssues?: boolean | null | void;
  lowCoachRatingFromStudent?: boolean | null | void;
  lowSessionRatingFromCoach?: boolean | null | void;
  lowSessionRatingFromStudent?: boolean | null | void;
  onlyLookingForAnswers?: boolean | null | void;
  personalIdentifyingInfo?: boolean | null | void;
  reported?: boolean | null | void;
  rudeOrInappropriate?: boolean | null | void;
  sessionId: string;
  studentCrisis?: boolean | null | void;
}

/** 'UpdateSessionMetrics' return type */
export interface IUpdateSessionMetricsResult {
  absentStudent: boolean;
  absentVolunteer: boolean;
  coachUncomfortable: boolean;
  commentFromStudent: boolean;
  commentFromVolunteer: boolean;
  createdAt: Date;
  gradedAssignment: boolean;
  hasBeenUnmatched: boolean;
  hasHadTechnicalIssues: boolean;
  lowCoachRatingFromStudent: boolean;
  lowSessionRatingFromCoach: boolean;
  lowSessionRatingFromStudent: boolean;
  onlyLookingForAnswers: boolean;
  personalIdentifyingInfo: boolean;
  reported: boolean;
  rudeOrInappropriate: boolean;
  sessionId: string;
  studentCrisis: boolean;
}

/** 'UpdateSessionMetrics' query type */
export interface IUpdateSessionMetricsQuery {
  params: IUpdateSessionMetricsParams;
  result: IUpdateSessionMetricsResult;
}

const updateSessionMetricsIR: any = {"usedParamSet":{"absentStudent":true,"absentVolunteer":true,"lowSessionRatingFromCoach":true,"lowSessionRatingFromStudent":true,"lowCoachRatingFromStudent":true,"onlyLookingForAnswers":true,"rudeOrInappropriate":true,"commentFromStudent":true,"commentFromVolunteer":true,"hasBeenUnmatched":true,"hasHadTechnicalIssues":true,"personalIdentifyingInfo":true,"gradedAssignment":true,"coachUncomfortable":true,"studentCrisis":true,"reported":true,"sessionId":true},"params":[{"name":"absentStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":61,"b":74}]},{"name":"absentVolunteer","required":false,"transform":{"type":"scalar"},"locs":[{"a":126,"b":141}]},{"name":"lowSessionRatingFromCoach","required":false,"transform":{"type":"scalar"},"locs":[{"a":208,"b":233}]},{"name":"lowSessionRatingFromStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":315,"b":342}]},{"name":"lowCoachRatingFromStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":424,"b":449}]},{"name":"onlyLookingForAnswers","required":false,"transform":{"type":"scalar"},"locs":[{"a":524,"b":545}]},{"name":"rudeOrInappropriate","required":false,"transform":{"type":"scalar"},"locs":[{"a":612,"b":631}]},{"name":"commentFromStudent","required":false,"transform":{"type":"scalar"},"locs":[{"a":694,"b":712}]},{"name":"commentFromVolunteer","required":false,"transform":{"type":"scalar"},"locs":[{"a":776,"b":796}]},{"name":"hasBeenUnmatched","required":false,"transform":{"type":"scalar"},"locs":[{"a":858,"b":874}]},{"name":"hasHadTechnicalIssues","required":false,"transform":{"type":"scalar"},"locs":[{"a":938,"b":959}]},{"name":"personalIdentifyingInfo","required":false,"transform":{"type":"scalar"},"locs":[{"a":1030,"b":1053}]},{"name":"gradedAssignment","required":false,"transform":{"type":"scalar"},"locs":[{"a":1117,"b":1133}]},{"name":"coachUncomfortable","required":false,"transform":{"type":"scalar"},"locs":[{"a":1191,"b":1209}]},{"name":"studentCrisis","required":false,"transform":{"type":"scalar"},"locs":[{"a":1264,"b":1277}]},{"name":"reported","required":false,"transform":{"type":"scalar"},"locs":[{"a":1321,"b":1329}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1389,"b":1399}]}],"statement":"UPDATE\n    session_metrics\nSET\n    absent_student = COALESCE(:absentStudent, absent_student),\n    absent_volunteer = COALESCE(:absentVolunteer, absent_volunteer),\n    low_session_rating_from_coach = COALESCE(:lowSessionRatingFromCoach, low_session_rating_from_coach),\n    low_session_rating_from_student = COALESCE(:lowSessionRatingFromStudent, low_session_rating_from_student),\n    low_coach_rating_from_student = COALESCE(:lowCoachRatingFromStudent, low_coach_rating_from_student),\n    only_looking_for_answers = COALESCE(:onlyLookingForAnswers, only_looking_for_answers),\n    rude_or_inappropriate = COALESCE(:rudeOrInappropriate, rude_or_inappropriate),\n    comment_from_student = COALESCE(:commentFromStudent, comment_from_student),\n    comment_from_volunteer = COALESCE(:commentFromVolunteer, comment_from_volunteer),\n    has_been_unmatched = COALESCE(:hasBeenUnmatched, has_been_unmatched),\n    has_had_technical_issues = COALESCE(:hasHadTechnicalIssues, has_had_technical_issues),\n    personal_identifying_info = COALESCE(:personalIdentifyingInfo, personal_identifying_info),\n    graded_assignment = COALESCE(:gradedAssignment, graded_assignment),\n    coach_uncomfortable = COALESCE(:coachUncomfortable, coach_uncomfortable),\n    student_crisis = COALESCE(:studentCrisis, student_crisis),\n    reported = COALESCE(:reported, reported),\n    updated_at = NOW()\nWHERE\n    session_id = :sessionId!\nRETURNING\n    session_id,\n    absent_student,\n    absent_volunteer,\n    low_session_rating_from_coach,\n    low_session_rating_from_student,\n    low_coach_rating_from_student,\n    only_looking_for_answers,\n    rude_or_inappropriate,\n    comment_from_student,\n    comment_from_volunteer,\n    has_been_unmatched,\n    has_had_technical_issues,\n    reported,\n    personal_identifying_info,\n    graded_assignment,\n    coach_uncomfortable,\n    student_crisis,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     session_metrics
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
 *     session_id = :sessionId!
 * RETURNING
 *     session_id,
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
export const updateSessionMetrics = new PreparedQuery<IUpdateSessionMetricsParams,IUpdateSessionMetricsResult>(updateSessionMetricsIR);


